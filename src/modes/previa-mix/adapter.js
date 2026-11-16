import { resolveCardFxMode } from '../../config/themeTokens.js';
import {
  SUPPORTED_LOCALES,
  TYPES,
  createPreviaMixGame,
  getActivePreviaMixEvents,
  getCardTypeLabel,
  getOptionalPenaltyLabel,
  getPendingGroupEventPlayers,
  getTargetIntensity,
  nextPreviaMixCard,
  recordGroupEventOutcome,
  resolvePreviaMixCard,
  canonicalCardId
} from './previa-mix.engine.js';
import {
  DEFAULT_CASTIGOS_NOTOMA,
  DEFAULT_CASTIGOS_TOMA,
  loadPreviaMixLocale
} from './previa-mix.locales.js';
import { getCastigosForLocale } from '../../cards/castigos.catalog.js';
import { applyOverridesToCards } from '../editor/editor.storage.js';
import { getCustomCardsForMode } from '../../core/customCards.js';
import {
  PREVIA_MIX_DEFAULT_ENABLED_TYPES,
  PREVIA_MIX_LOCALE_OPTIONS,
  PREVIA_MIX_MAX_PLAYERS,
  PREVIA_MIX_MODE_ID,
  PREVIA_MIX_SCHEMA_VERSION,
  PREVIA_MIX_TYPE_CONFIG,
  createDefaultPreviaMixConfig
} from './mode.config.js';

const catalogCache = new Map();
const catalogPromises = new Map();

function clampInt(value, min, max, fallback) {
  const num = Math.floor(Number(value));
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

function clampFloat(value, min, max, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

function prefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return Boolean(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

export function invalidatePreviaMixCatalogCache(locale = null) {
  if (locale) {
    catalogCache.delete(locale);
    catalogPromises.delete(locale);
  } else {
    catalogCache.clear();
    catalogPromises.clear();
  }
}

/**
 * Carga y cachea localmente el catálogo de 900 cartas del idioma regional elegido.
 */
export async function ensurePreviaMixCatalog(locale = 'es-CO') {
  const safeLocale = SUPPORTED_LOCALES.includes(locale) ? locale : 'es-CO';
  if (catalogCache.has(safeLocale)) {
    return catalogCache.get(safeLocale);
  }
  if (catalogPromises.has(safeLocale)) {
    return catalogPromises.get(safeLocale);
  }

  const promise = loadPreviaMixLocale(safeLocale)
    .then((cards) => {
      if (!Array.isArray(cards) || cards.length === 0) {
        throw new Error(`[Previa Mix] Catálogo vacío o inválido para ${safeLocale}`);
      }
      const withOverrides = applyOverridesToCards(`previa-mix:${safeLocale}`, cards);
      catalogCache.set(safeLocale, withOverrides);
      catalogPromises.delete(safeLocale);
      return withOverrides;
    })
    .catch((err) => {
      catalogPromises.delete(safeLocale);
      throw err;
    });

  catalogPromises.set(safeLocale, promise);
  return promise;
}

export function getCachedPreviaMixCatalog(locale = 'es-CO') {
  const safeLocale = SUPPORTED_LOCALES.includes(locale) ? locale : 'es-CO';
  return catalogCache.get(safeLocale) || null;
}

/**
 * Normaliza y valida la configuración del modo respetando el triple opt-in de HOT +18
 * y asegurando al menos una categoría regular distinta de eventos grupales.
 */
export function normalizePreviaMixConfig(rawConfig = {}, { appLang = 'es', appLocale = null } = {}) {
  const safeAppLocale = SUPPORTED_LOCALES.includes(appLocale) ? appLocale : null;
  const defaults = createDefaultPreviaMixConfig(appLang, safeAppLocale);
  const merged = { ...defaults, ...(rawConfig || {}) };

  const localeAutoSynced = merged.localeAutoSynced !== false;
  let locale = SUPPORTED_LOCALES.includes(merged.locale) ? merged.locale : defaults.locale;
  if (localeAutoSynced) {
    locale = safeAppLocale || defaults.locale;
  }

  const hotRequested =
    merged.enableHot === true ||
    (Array.isArray(merged.enabledTypes) && merged.enabledTypes.includes('hot'));

  let enabledTypes = Array.isArray(merged.enabledTypes)
    ? [...new Set(merged.enabledTypes)].filter((t) => TYPES.includes(t))
    : [...PREVIA_MIX_DEFAULT_ENABLED_TYPES];

  if (hotRequested) {
    if (!enabledTypes.includes('hot')) {
      enabledTypes.push('hot');
    }
  } else {
    enabledTypes = enabledTypes.filter((t) => t !== 'hot');
  }

  if (!enabledTypes.some((t) => t !== 'eventos especiales' && t !== 'bonus')) {
    enabledTypes = ['clásico', ...enabledTypes];
  }

  const minIntensity = clampInt(merged.minIntensity ?? merged.startIntensity, 1, 10, 1);
  const maxIntensity = clampInt(merged.maxIntensity, minIntensity, 10, 10);
  const startIntensity = minIntensity;
  const targetTurns = clampInt(merged.targetTurns, 5, 900, 45);
  const eventChance = clampFloat(merged.eventChance, 0, 1, 0.13);
  const drinkMode = 'auto';

  return {
    locale,
    localeAutoSynced,
    enabledTypes,
    minIntensity,
    startIntensity,
    maxIntensity,
    targetTurns,
    eventChance,
    drinkMode,
    enableHot: hotRequested,
    adultsConfirmed: hotRequested,
    everyoneConsentsHot: hotRequested,
    customCardsEnabled: merged.customCardsEnabled !== false
  };
}

export function getEffectiveDrinkSettings(_config, localPlayers = []) {
  const activeSlice = localPlayers.slice(0, PREVIA_MIX_MAX_PLAYERS);
  const anyDrinker = activeSlice.some((p) => p.drinksAlcohol !== false);
  return {
    noAlcohol: !anyDrinker,
    showOptionalDrinkSuggestion: anyDrinker
  };
}

export function pickPenaltyFromToken(token, penaltyList = [], rng = Math.random) {
  if (!penaltyList || !Array.isArray(penaltyList) || penaltyList.length === 0) return '';
  const match = token.match(/\{([^}]+)\}/);
  const param = match ? match[1].trim().toLowerCase() : 'x';

  let candidates = [];
  if (param === 'x' || param === 'any' || param === '*') {
    candidates = penaltyList;
  } else if (param.includes('-')) {
    const parts = param.split('-');
    const minId = parseInt(parts[0], 10);
    const maxId = parseInt(parts[1], 10);
    candidates = penaltyList.filter((item) => {
      const id = Number(item.id);
      return id >= minId && id <= maxId;
    });
  } else if (param.includes(',')) {
    const ids = new Set(
      param
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n))
    );
    candidates = penaltyList.filter((item) => ids.has(Number(item.id)));
  } else {
    const targetId = parseInt(param, 10);
    candidates = penaltyList.filter((item) => Number(item.id) === targetId);
  }

  if (candidates.length === 0) {
    candidates = penaltyList;
  }

  const picked = candidates[Math.floor(rng() * candidates.length)];
  return picked?.castigo || '';
}

export function resolveDynamicPenalty(
  template,
  doesDrink = true,
  castigosToma = null,
  castigosNotoma = null,
  rng = Math.random,
  locale = 'es-CO'
) {
  if (!template || typeof template !== 'string') return '';
  const raw = template.trim();
  if (!raw) return '';

  const safeLocale = String(locale || 'es-CO');
  const baseLang = safeLocale.startsWith('en') ? 'en' : safeLocale.startsWith('pt') ? 'pt' : 'es';

  const localeCastigos = getCastigosForLocale(safeLocale);
  const effectiveToma = (Array.isArray(castigosToma) && castigosToma.length > 0)
    ? castigosToma
    : localeCastigos.castigos_toma;
  const effectiveNotoma = (Array.isArray(castigosNotoma) && castigosNotoma.length > 0)
    ? castigosNotoma
    : localeCastigos.castigos_notoma;

  const hasDynamicBracket = /\[\s*[^\]]*?castigo_(?:toma|notoma)[^\]]*?\s*\]/i.test(raw);

  if (hasDynamicBracket) {
    const bracketRegex = /\[\s*([^\]]*?castigo_(?:toma|notoma)[^\]]*?)\s*\]/gi;
    return raw.replace(bracketRegex, (_, inner) => {
      const parts = inner.split('||').map((s) => s.trim());
      const tomaPart = parts.find((p) => p.toLowerCase().startsWith('castigo_toma'));
      const notomaPart = parts.find((p) => p.toLowerCase().startsWith('castigo_notoma'));

      if (doesDrink) {
        if (tomaPart) {
          return pickPenaltyFromToken(tomaPart, effectiveToma, rng);
        }
        if (notomaPart) {
          return pickPenaltyFromToken(notomaPart, effectiveNotoma, rng);
        }
      } else {
        if (notomaPart) {
          return pickPenaltyFromToken(notomaPart, effectiveNotoma, rng);
        }
        if (tomaPart) {
          const defaultNoAlcoholText = baseLang === 'en'
            ? 'complete a non-alcoholic forfeit'
            : baseLang === 'pt'
              ? 'cumpre um castigo sem álcool'
              : 'cumple una penitencia sin alcohol';
          return (
            pickPenaltyFromToken('castigo_notoma{x}', effectiveNotoma, rng) ||
            defaultNoAlcoholText
          );
        }
      }
      return '';
    });
  }

  // Castigos estáticos o con prefijo
  const prefixPenalty = baseLang === 'en'
    ? (safeLocale === 'en-GB' ? 'Forfeit: ' : 'Penalty: ')
    : 'Castigo: ';
  const prefixSober = baseLang === 'en'
    ? 'Forfeit: '
    : (baseLang === 'pt' ? 'Penitência: ' : 'Penitencia: ');
  const defaultSoberText = baseLang === 'en'
    ? 'Non-alcoholic forfeit'
    : (baseLang === 'pt' ? 'Castigo sem álcool' : 'Penitencia sin alcohol');

  const startsWithPrefix = /^(Si no|Castigo|Penitencia|Penitência|If they|If anyone|Whoever|Penalty|Forfeit|Se não|Se alguém|Quem)/i.test(raw);

  if (doesDrink) {
    return startsWithPrefix ? raw : `${prefixPenalty}${raw}`;
  } else {
    const isDrinkingPenalty = /(trago|shot|sorbo|cerveza|copa|bebe|toma|drink|sip|pint|beer|gole|golo)/i.test(raw);
    if (isDrinkingPenalty && effectiveNotoma.length > 0) {
      const alt = pickPenaltyFromToken('castigo_notoma{x}', effectiveNotoma, rng);
      return alt ? `${prefixSober}${alt}` : defaultSoberText;
    }
    return startsWithPrefix ? raw : `${prefixSober}${raw}`;
  }
}

/**
 * Construye segmentos seguros (sin HTML crudo) para resaltar `[player]`, `[player_x]`, `[player_x1]` y `[all]` con chips.
 */
export function buildSafePromptTokens(
  textoOriginal,
  selectedPlayers = [],
  localPlayersMap = new Map(),
  locale = 'es-CO',
  cardResp = ''
) {
  const source = String(textoOriginal || '');
  const enrich = (p, fallbackIdx) => {
    if (!p) return null;
    const full = localPlayersMap.get(String(p.id)) || p;
    return {
      id: String(p.id),
      name: full.name || p.name || `Jugador ${fallbackIdx + 1}`,
      avatarEmoji: full.avatarEmoji || '',
      avatarColor: full.avatarColor || '',
      drinksAlcohol: full.drinksAlcohol !== false
    };
  };

  const p1 = enrich(selectedPlayers[0], 0);
  const p2 = enrich(selectedPlayers[1], 1);
  const p3 = enrich(selectedPlayers[2], 2);

  const lang = String(locale || 'es').startsWith('en')
    ? 'en'
    : String(locale || 'es').startsWith('pt')
      ? 'pt'
      : 'es';
  const allLabel = lang === 'en' ? 'Everyone' : 'Todos';

  const validResp = typeof cardResp === 'string' ? cardResp.trim() : String(cardResp || '').trim();

  return source
    .split(/(\[player_x1\]|\[player_x\]|\[player_y\]|\[player_X\]|\[player\]|\[all\]|\[\?\])/gi)
    .filter((part) => part.length > 0)
    .map((part) => {
      const lower = part.toLowerCase();
      if (lower === '[player]') {
        const player = p1 || { id: 'p1', name: 'Jugador 1', avatarEmoji: '', drinksAlcohol: true };
        return { kind: 'player', slot: 0, player };
      }
      if (lower === '[player_x]') {
        const player = p2 || p1 || { id: 'p2', name: 'Jugador 2', avatarEmoji: '', drinksAlcohol: true };
        return { kind: 'player', slot: 1, player };
      }
      if (lower === '[player_x1]' || lower === '[player_y]') {
        const player = p3 || p2 || p1 || { id: 'p3', name: 'Jugador 3', avatarEmoji: '', drinksAlcohol: true };
        return { kind: 'player', slot: 2, player };
      }
      if (lower === '[all]') {
        return { kind: 'group', label: allLabel };
      }
      if (lower === '[?]') {
        if (validResp) {
          return { kind: 'question_resp', resp: validResp };
        }
        return { kind: 'text', value: '' };
      }
      return { kind: 'text', value: part };
    });
}

function buildEnginePlayers(localPlayers = []) {
  const sliced = localPlayers.slice(0, PREVIA_MIX_MAX_PLAYERS);
  return sliced.map((p, idx) => ({
    id: String(p.id || `p${idx + 1}`),
    name: String(p.name || `Jugador ${idx + 1}`).trim().slice(0, 60) || `Jugador ${idx + 1}`
  }));
}

export const previaMixAdapter = {
  modeId: PREVIA_MIX_MODE_ID,
  schemaVersion: PREVIA_MIX_SCHEMA_VERSION,
  localeOptions: PREVIA_MIX_LOCALE_OPTIONS,
  typeConfigs: PREVIA_MIX_TYPE_CONFIG,

  async preloadLocale(locale) {
    return ensurePreviaMixCatalog(locale);
  },

  async createSession({
    localPlayers = [],
    appLang = 'es',
    progressiveCurve = true,
    modeConfig = {}
  }) {
    const normalized = normalizePreviaMixConfig(modeConfig, {
      appLang,
      appLocale: modeConfig?.locale
    });
    const enginePlayers = buildEnginePlayers(localPlayers);
    const catalogBase = await ensurePreviaMixCatalog(normalized.locale);
    const minInt = normalized.minIntensity || normalized.startIntensity || 1;
    const maxInt = normalized.maxIntensity || 10;
    const startInt = minInt;

    let catalog = catalogBase;
    if (normalized.customCardsEnabled !== false) {
      const customCards = getCustomCardsForMode(this.modeId || 'previa-mix', {
        enabledTypes: normalized.enabledTypes,
        minIntensity: minInt,
        maxIntensity: maxInt
      });
      if (customCards.length > 0) {
        catalog = [...customCards, ...catalogBase];
      }
    }
    const drinkOpts = getEffectiveDrinkSettings(normalized, localPlayers);

    const initial = createPreviaMixGame({
      modeId: this.modeId || 'previa-mix',
      players: enginePlayers,
      locale: normalized.locale,
      enabledTypes: normalized.enabledTypes,
      minIntensity: minInt,
      startIntensity: startInt,
      maxIntensity: maxInt,
      targetTurns: normalized.targetTurns,
      eventChance: normalized.eventChance,
      progressiveCurve: progressiveCurve !== false,
      noAlcohol: drinkOpts.noAlcohol,
      showOptionalDrinkSuggestion: drinkOpts.showOptionalDrinkSuggestion,
      enableHot: normalized.enableHot,
      adultsConfirmed: normalized.adultsConfirmed,
      everyoneConsentsHot: normalized.everyoneConsentsHot,
      motionReduced: prefersReducedMotion(),
      customCardsEnabled: normalized.customCardsEnabled !== false
    });

    const started = nextPreviaMixCard(initial, catalog);
    return {
      session: started,
      wasPlayerCountCapped: localPlayers.length > PREVIA_MIX_MAX_PLAYERS
    };
  },

  async advanceTurn(session, result = 'completed', localPlayers = []) {
    if (!session || session.schemaVersion !== PREVIA_MIX_SCHEMA_VERSION) {
      throw new Error('[Previa Mix] Sesión inválida o expirada.');
    }
    const catalogBase = await ensurePreviaMixCatalog(session.locale);
    let catalog = catalogBase;
    if (session.config?.customCardsEnabled !== false) {
      const customCards = getCustomCardsForMode(session.modeId || this.modeId || 'previa-mix', {
        enabledTypes: session.config?.enabledTypes,
        minIntensity: session.config?.minIntensity ?? session.config?.startIntensity ?? 1,
        maxIntensity: session.config?.maxIntensity ?? 10
      });
      if (customCards.length > 0) {
        catalog = [...customCards, ...catalogBase];
      }
    }
    const previousCard = session.currentCard;

    let workingSession = session;
    for (const pendingEv of getPendingGroupEventPlayers(workingSession)) {
      for (const p of pendingEv.players) {
        workingSession = recordGroupEventOutcome(workingSession, {
          eventId: pendingEv.eventId,
          playerId: p.id,
          outcome: 'participated'
        }).state;
      }
    }

    const resolved = resolvePreviaMixCard(workingSession, result);

    // Respeta si el protagonista principal de esa carta marcó "No toma"
    const playerLookup = new Map(localPlayers.map((p) => [String(p.id), p]));
    const primaryPlayerId = previousCard?.selectedPlayers?.[0]?.id;
    const primaryProfile = primaryPlayerId ? playerLookup.get(String(primaryPlayerId)) : null;
    const primaryIsSober = primaryProfile && primaryProfile.drinksAlcohol === false;

    const rawSuggestion = !primaryIsSober ? resolved.optionalDrinkSuggestion : null;
    const optionalDrinkLabel = rawSuggestion
      ? getOptionalPenaltyLabel(rawSuggestion, session.locale)
      : null;

    const nextSession = nextPreviaMixCard(resolved.state, catalog);
    return {
      session: nextSession,
      resolvedOutcome: {
        result,
        previousCard,
        optionalDrinkSuggestion: rawSuggestion,
        optionalDrinkLabel,
        primaryPlayerName: previousCard?.selectedPlayers?.[0]?.name || '',
        primaryIsSober: Boolean(primaryIsSober),
        note: resolved.note
      }
    };
  },

  recordEventOutcome(session, { eventId, playerId, outcome }) {
    const res = recordGroupEventOutcome(session, { eventId, playerId, outcome });
    return {
      session: res.state,
      socialForfeit: res.socialForfeit
    };
  },

  getPendingPlayers(session) {
    if (!session || session.schemaVersion !== PREVIA_MIX_SCHEMA_VERSION) return [];
    return getPendingGroupEventPlayers(session);
  },

  async setSessionLocale(session, nextLocale) {
    if (!session || session.schemaVersion !== PREVIA_MIX_SCHEMA_VERSION) {
      return { session, changed: false };
    }
    const safeLocale = SUPPORTED_LOCALES.includes(nextLocale) ? nextLocale : 'es-CO';
    if (session.locale === safeLocale) {
      return { session, changed: false };
    }
    const catalog = await ensurePreviaMixCatalog(safeLocale);
    const byId = new Map();
    for (const c of catalog) {
      byId.set(String(c.id), c);
      const canon = canonicalCardId(c);
      if (canon !== c.id) {
        byId.set(String(canon), c);
      }
    }
    const findCard = (rawId) => {
      if (!rawId) return null;
      return byId.get(String(rawId)) || byId.get(String(canonicalCardId({ id: rawId }))) || null;
    };

    let nextCurrentCard = session.currentCard;
    if (nextCurrentCard) {
      const translated = findCard(nextCurrentCard.id);
      const selected = nextCurrentCard.selectedPlayers || [];
      if (translated) {
        const fill = (tpl) =>
          String(tpl || '').replace(/\[player_X\]|\[player\]/g, (tok) =>
            tok === '[player]' ? selected[0]?.name || tok : selected[1]?.name || tok
          );
        nextCurrentCard = {
          ...nextCurrentCard,
          ...translated,
          textoOriginal: translated.texto,
          texto: fill(translated.texto),
          selectedPlayers: selected,
          groupPlayerIds: nextCurrentCard.groupPlayerIds || [],
          numeroTurno: nextCurrentCard.numeroTurno,
          intensidadObjetivo: nextCurrentCard.intensidadObjetivo,
          tipoEtiqueta: (translated.especial ? '★ ' : '') + translated.tipo
        };
      }
    }

    const nextEvents = (session.events || []).map((ev) => {
      const translated = findCard(ev.id);
      if (!translated) return ev;
      return {
        ...ev,
        rule: translated.regla || ev.rule,
        penitencia_social: translated.penitencia_social || ev.penitencia_social
      };
    });

    return {
      session: {
        ...session,
        locale: safeLocale,
        currentCard: nextCurrentCard,
        events: nextEvents
      },
      changed: true
    };
  },

  async setHotEnabledMidGame(session, { enable } = {}) {
    if (!session || session.schemaVersion !== PREVIA_MIX_SCHEMA_VERSION) {
      return { session, replacedCard: false, changed: false };
    }
    const catalog = await ensurePreviaMixCatalog(session.locale);

    if (!enable) {
      let nextTypes = session.config.enabledTypes.filter((t) => t !== 'hot');
      if (!nextTypes.some((t) => t !== 'eventos especiales' && t !== 'bonus')) {
        nextTypes = ['clásico', ...nextTypes];
      }

      const updatedBase = {
        ...session,
        config: {
          ...session.config,
          enabledTypes: nextTypes,
          hotAllowed: false
        }
      };

      // Si justo estaba en pantalla una carta HOT, la reemplazamos en el mismo turno sin penalización
      if (updatedBase.currentCard?.tipo === 'hot') {
        const rolledBack = {
          ...updatedBase,
          turn: Math.max(0, updatedBase.turn - 1),
          currentCard: null
        };
        return {
          session: nextPreviaMixCard(rolledBack, catalog),
          replacedCard: true,
          changed: true
        };
      }

      return {
        session: updatedBase,
        replacedCard: false,
        changed: true
      };
    }

    const nextTypes = session.config.enabledTypes.includes('hot')
      ? [...session.config.enabledTypes]
      : [...session.config.enabledTypes, 'hot'];

    return {
      session: {
        ...session,
        config: {
          ...session.config,
          enabledTypes: nextTypes,
          hotAllowed: true
        }
      },
      replacedCard: false,
      changed: true
    };
  },

  buildTurnViewModel(session, localPlayers = []) {
    if (!session || session.schemaVersion !== PREVIA_MIX_SCHEMA_VERSION || !session.currentCard) {
      return null;
    }

    const card = session.currentCard;
    const typeMeta = PREVIA_MIX_TYPE_CONFIG[card.tipo] || PREVIA_MIX_TYPE_CONFIG['clásico'];
    const fxMode = resolveCardFxMode(card);
    const localMap = new Map(localPlayers.map((p) => [String(p.id), p]));

    const selectedPlayers = (card.selectedPlayers || []).map((sp, idx) => {
      const full = localMap.get(String(sp.id));
      return {
        id: String(sp.id),
        name: full?.name || sp.name || `Jugador ${idx + 1}`,
        avatarEmoji: full?.avatarEmoji || '',
        avatarColor: full?.avatarColor || '',
        drinksAlcohol: full ? full.drinksAlcohol !== false : true
      };
    });

    const highlightedPlayerIds = new Set(
      card.participantes === 'grupo' && card.groupPlayerIds?.length
        ? card.groupPlayerIds.map(String)
        : selectedPlayers.map((p) => String(p.id))
    );

    const activeEventsRaw = getActivePreviaMixEvents(session);
    const pendingByEvent = getPendingGroupEventPlayers(session);
    const pendingMap = new Map(pendingByEvent.map((p) => [p.eventId, p.players]));

    const activeEvents = activeEventsRaw.map((ev) => {
      const pendingList = pendingMap.get(ev.id) || [];
      const pendingIds = new Set(pendingList.map((p) => String(p.id)));
      const playerStates = session.players.map((sp) => {
        const full = localMap.get(String(sp.id));
        const record = session.eventParticipation.find(
          (r) => r.turn === session.turn && r.eventId === ev.id && r.playerId === sp.id
        );
        return {
          id: String(sp.id),
          name: full?.name || sp.name,
          avatarEmoji: full?.avatarEmoji || '',
          outcome: record?.outcome || null,
          isPending: pendingIds.has(String(sp.id))
        };
      });

      return {
        ...ev,
        pendingPlayers: pendingList,
        playerStates
      };
    });

    const pendingPlayersFlat = [];
    const seenPending = new Set();
    for (const ev of activeEvents) {
      for (const p of ev.pendingPlayers) {
        if (!seenPending.has(String(p.id))) {
          seenPending.add(String(p.id));
          pendingPlayersFlat.push(p);
        }
      }
    }

    const isEventActivation = card.tipo === 'eventos especiales';
    const isBonusCard = card.tipo === 'bonus' || card.isBonus === true;
    const isDiceCard = isBonusCard && card.subtipo === 'bonus_dice';
    const excludedPlayers = (card.excludedPlayerIds || []).map((id, idx) => {
      const full = localMap.get(String(id));
      return {
        id: String(id),
        name: full?.name || `Jugador ${idx + 1}`,
        avatarEmoji: full?.avatarEmoji || '',
        avatarColor: full?.avatarColor || '',
        drinksAlcohol: full ? full.drinksAlcohol !== false : true
      };
    });
    const hasPendingEventPlayers = false;

    const isGroupCard = card.participantes === 'grupo';
    const activeSlice = localPlayers.slice(0, PREVIA_MIX_MAX_PLAYERS);
    const allSober = activeSlice.length > 0 && activeSlice.every((p) => p.drinksAlcohol === false);
    const primaryPlayer = selectedPlayers[0] || null;
    const playerDoesDrink = isGroupCard
      ? !allSober
      : (primaryPlayer ? primaryPlayer.drinksAlcohol !== false : true);

    const catalog = getCachedPreviaMixCatalog(session.locale);
    const castigosToma = catalog?.castigos_toma || DEFAULT_CASTIGOS_TOMA;
    const castigosNotoma = catalog?.castigos_notoma || DEFAULT_CASTIGOS_NOTOMA;

    let cardPenaltyText = '';
    if (!isBonusCard && card.castigo) {
      if (card._cachedPenalty && card._cachedPenaltyForDrink === playerDoesDrink) {
        cardPenaltyText = card._cachedPenalty;
      } else {
        cardPenaltyText = resolveDynamicPenalty(
          card.castigo,
          playerDoesDrink,
          castigosToma,
          castigosNotoma,
          Math.random,
          session.locale
        );
        card._cachedPenalty = cardPenaltyText;
        card._cachedPenaltyForDrink = playerDoesDrink;
      }
    }

    const basePromptText = String(card.textoOriginal || card.texto || '').trim();
    let fullPromptText = basePromptText;
    if (cardPenaltyText) {
      if (/[.?!]$/.test(basePromptText)) {
        fullPromptText = `${basePromptText} ${cardPenaltyText}`;
      } else if (basePromptText.length > 0) {
        fullPromptText = `${basePromptText}. ${cardPenaltyText}`;
      } else {
        fullPromptText = cardPenaltyText;
      }
    }

    const promptTokens = buildSafePromptTokens(
      fullPromptText,
      card.selectedPlayers,
      localMap,
      session.locale,
      card.resp || card.respuesta || ''
    );

    return {
      card,
      turnNumber: session.turn,
      targetTurns: session.config.targetTurns,
      progressiveCurve: session.config.progressiveCurve !== false,
      locale: session.locale,
      typeLabel: getCardTypeLabel(card, session.locale),
      typeMeta,
      fxMode,
      targetIntensity: card.intensidadObjetivo ?? getTargetIntensity(session, session.turn),
      cardIntensity: card.intensidad,
      minIntensity: session.config.minIntensity ?? session.config.startIntensity ?? 1,
      maxIntensity: session.config.maxIntensity,
      selectedPlayers,
      excludedPlayers,
      highlightedPlayerIds,
      promptTokens,
      cardPenaltyText: cardPenaltyText || null,
      cardPenaltyIsSober: !playerDoesDrink,
      activeEvents,
      pendingPlayers: [],
      hasPendingEventPlayers,
      isEventActivation,
      isBonusCard,
      bonusSubtype: card.subtipo || null,
      isDiceCard,
      diceConfig: isDiceCard
        ? {
          threshold: card.diceThreshold ?? 3,
          condition: card.diceCondition || 'greater'
        }
        : null,
      canSkip: !isEventActivation,
      canComplete: true,
      hotActive: Boolean(session.config.hotAllowed && session.config.enabledTypes.includes('hot')),
      optionalDrinkEnabled: Boolean(!session.config.noAlcohol && session.config.showOptionalDrinkSuggestion)
    };
  }
};

