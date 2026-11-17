/**
 * Oh My Shot! — Adaptador del Modo "Verdad o Reto Hot +18"
 *
 * Mecánica interactiva:
 * - Pantalla de elección interactiva ¿Verdad Hot o Reto Hot?
 * - Cargado exclusivamente con cartas picantes +18 (verdad_hot y reto_hot).
 * - Límite de verdades consecutivas configurable (por defecto 3).
 * - Bloqueo de verdad y reto forzoso si se excede el límite.
 * - Soporte para rondas bonus sorpresa.
 * - Efectos visuales de fuego (+18) y música hot.
 */

import { loadHotCardsLocale } from '../../cards/cards.loader.js';
import { getBonusCardsForLocale } from '../../config/bonusCards.catalog.js';
import { getCastigosForLocale } from '../../cards/castigos.catalog.js';
import { getCustomCardsForMode } from '../../core/customCards.js';
import { resolveCardFxMode } from '../../config/themeTokens.js';
import {
  PREVIA_MIX_MAX_PLAYERS,
  PREVIA_MIX_SCHEMA_VERSION,
  PREVIA_MIX_TYPE_CONFIG
} from '../previa-mix/mode.config.js';
import {
  buildSafePromptTokens,
  resolveDynamicPenalty
} from '../previa-mix/adapter.js';
import {
  DEFAULT_VERDAD_O_RETO_HOT_CONFIG,
  VERDAD_O_RETO_HOT_MODE_ID
} from './mode.config.js';

const catalogCache = new Map();

async function getVorHotCatalog(locale = 'es') {
  const normLocale = String(locale).toLowerCase().startsWith('en')
    ? 'en'
    : String(locale).toLowerCase().startsWith('pt')
      ? 'pt'
      : 'es';

  if (catalogCache.has(normLocale)) {
    return catalogCache.get(normLocale);
  }

  const [hotBundle, bonusCards, castigos] = await Promise.all([
    loadHotCardsLocale(normLocale),
    getBonusCardsForLocale(normLocale),
    getCastigosForLocale(normLocale)
  ]);

  const catalog = {
    verdadHotCards: hotBundle.verdadHot || [],
    retoHotCards: hotBundle.retoHot || [],
    bonusCards: bonusCards || [],
    castigos_toma: castigos.castigos_toma || [],
    castigos_notoma: castigos.castigos_notoma || []
  };

  catalogCache.set(normLocale, catalog);
  return catalog;
}

function normalizeVorHotConfig(raw = {}) {
  return {
    turnOrder: raw.turnOrder === 'aleatorio' ? 'aleatorio' : 'secuencial',
    maxConsecutiveTruths:
      typeof raw.maxConsecutiveTruths === 'number'
        ? Math.max(0, Math.min(10, Math.round(raw.maxConsecutiveTruths)))
        : 3,
    bonusEnabled: raw.bonusEnabled !== false,
    customCardsEnabled: raw.customCardsEnabled !== false,
    targetTurns: Math.max(5, Math.min(900, Number(raw.targetTurns) || 45))
  };
}

function pickRandomElement(arr = []) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

export const verdadORetoHotAdapter = {
  modeId: VERDAD_O_RETO_HOT_MODE_ID,
  schemaVersion: PREVIA_MIX_SCHEMA_VERSION,

  async preloadLocale(locale) {
    return getVorHotCatalog(locale);
  },

  async createSession({
    localPlayers = [],
    appLang = 'es',
    modeConfig = {}
  }) {
    const config = normalizeVorHotConfig(modeConfig);
    const locale = modeConfig.locale || (appLang === 'en' ? 'en' : appLang === 'pt' ? 'pt' : 'es');
    await getVorHotCatalog(locale);

    const activeSlice = localPlayers.slice(0, PREVIA_MIX_MAX_PLAYERS);
    const enginePlayers = activeSlice.map((p, idx) => ({
      id: String(p.id || `p${idx + 1}`),
      name: p.name || `Jugador ${idx + 1}`,
      avatarEmoji: p.avatarEmoji || '',
      avatarColor: p.avatarColor || '',
      drinksAlcohol: p.drinksAlcohol !== false
    }));

    const activePlayerIndex =
      config.turnOrder === 'aleatorio' && enginePlayers.length > 0
        ? Math.floor(Math.random() * enginePlayers.length)
        : 0;

    const playerTruthCounts = {};
    for (const p of enginePlayers) {
      playerTruthCounts[p.id] = 0;
    }

    const session = {
      schemaVersion: PREVIA_MIX_SCHEMA_VERSION,
      modeId: VERDAD_O_RETO_HOT_MODE_ID,
      locale,
      config,
      players: enginePlayers,
      activePlayerIndex,
      turn: 1,
      finished: false,
      playerTruthCounts,
      usedCardIds: [],
      isVorChoiceStage: true,
      currentChoice: null,
      currentCard: null,
      bonusCounter: 0
    };

    return {
      session,
      wasPlayerCountCapped: localPlayers.length > PREVIA_MIX_MAX_PLAYERS
    };
  },

  async chooseChoice(session, choice) {
    if (!session || session.finished || !session.isVorChoiceStage) {
      return session;
    }

    const activePlayer = session.players[session.activePlayerIndex] || session.players[0];
    const playerId = activePlayer.id;
    const currentTruthCount = session.playerTruthCounts[playerId] || 0;
    const maxTruths = session.config.maxConsecutiveTruths ?? 3;

    let effectiveChoice = choice;
    if (choice === 'verdad' && maxTruths > 0 && currentTruthCount >= maxTruths) {
      effectiveChoice = 'reto';
    }

    const catalog = await getVorHotCatalog(session.locale);
    const minI = session.config.minIntensity ?? 1;
    const maxI = session.config.maxIntensity ?? 10;
    const usedSet = new Set((session.usedCardIds || []).map((id) => String(id)));

    let pool = [];

    if (effectiveChoice === 'verdad') {
      let baseTruths = (catalog.verdadHotCards || []).filter(
        (c) => c.intensidad >= minI && c.intensidad <= maxI && (c.participantes === 'uno' || !c.participantes)
      );
      if (baseTruths.length === 0) {
        baseTruths = catalog.verdadHotCards || [];
      }
      pool = [...baseTruths];

      if (session.config.customCardsEnabled !== false) {
        const customTruths = getCustomCardsForMode(VERDAD_O_RETO_HOT_MODE_ID, {
          enabledTypes: ['verdad_hot', 'verdad'],
          minIntensity: minI,
          maxIntensity: maxI
        }).filter((c) => c.participantes === 'uno' || !c.participantes);
        pool = [...customTruths, ...pool];
      }

      session.playerTruthCounts[playerId] = currentTruthCount + 1;
    } else {
      let baseDares = (catalog.retoHotCards || []).filter(
        (c) => c.intensidad >= minI && c.intensidad <= maxI && (c.participantes === 'uno' || !c.participantes)
      );
      if (baseDares.length === 0) {
        baseDares = catalog.retoHotCards || [];
      }
      pool = [...baseDares];

      if (session.config.customCardsEnabled !== false) {
        const customDares = getCustomCardsForMode(VERDAD_O_RETO_HOT_MODE_ID, {
          enabledTypes: ['reto_hot', 'reto'],
          minIntensity: minI,
          maxIntensity: maxI
        }).filter((c) => c.participantes === 'uno' || !c.participantes);
        pool = [...customDares, ...pool];
      }

      session.playerTruthCounts[playerId] = 0;
    }

    const unused = pool.filter((c) => !usedSet.has(String(c.id)));
    const availablePool = unused.length > 0 ? unused : pool;
    let card = pickRandomElement(availablePool) || pool[0];

    if (!card) {
      const isEn = session.locale?.startsWith('en');
      const isPt = session.locale?.startsWith('pt');
      let fbText = '';
      if (effectiveChoice === 'verdad') {
        fbText = isEn
          ? '[player] Truth Hot: What is your wildest secret fantasy?'
          : isPt
            ? '[player] Verdade Hot: Qual é a sua fantasia mais secreta e ousada?'
            : '[player] Verdad Hot: ¿Cuál es tu fantasía íntima más secreta?';
      } else {
        fbText = isEn
          ? '[player] Dare Hot: Give a passionate compliment looking straight into someone\'s eyes.'
          : isPt
            ? '[player] Desafio Hot: Diga um elogio sensual olhando nos olhos de alguém.'
            : '[player] Reto Hot: Di un cumplido apasionado mirando fijamente a los ojos de alguien.';
      }
      card = {
        id: `vor_hot_fb_${Date.now()}`,
        texto: fbText,
        tipo: effectiveChoice === 'verdad' ? 'verdad_hot' : 'reto_hot',
        intensidad: 5,
        castigo: 'Si no cumple [castigo_toma{1-3} || castigo_notoma{x}].',
        participantes: 'uno'
      };
    }

    const assignedCard = {
      ...card,
      tipo: effectiveChoice === 'verdad' ? 'verdad_hot' : 'reto_hot',
      participantes: 'uno',
      selectedPlayers: [activePlayer]
    };

    const nextUsed = [...(session.usedCardIds || []), String(card.id)].slice(-100);

    return {
      ...session,
      currentCard: assignedCard,
      currentChoice: effectiveChoice,
      isVorChoiceStage: false,
      usedCardIds: nextUsed
    };
  },

  async advanceTurn(session, result = 'completed', localPlayers = []) {
    if (!session) {
      throw new Error('[Verdad o Reto Hot] Sesión inválida.');
    }

    const nextTurn = session.turn + 1;
    if (nextTurn > session.config.targetTurns) {
      return {
        session: {
          ...session,
          finished: true
        },
        resolvedOutcome: { result }
      };
    }

    let nextPlayerIndex = 0;
    if (session.config.turnOrder === 'aleatorio' && session.players.length > 1) {
      do {
        nextPlayerIndex = Math.floor(Math.random() * session.players.length);
      } while (nextPlayerIndex === session.activePlayerIndex);
    } else {
      nextPlayerIndex = (session.activePlayerIndex + 1) % session.players.length;
    }

    const bonusInterval = 8;
    const nextBonusCounter = (session.bonusCounter || 0) + 1;
    const isBonusTurn = session.config.bonusEnabled !== false && nextBonusCounter >= bonusInterval;

    if (isBonusTurn) {
      const catalog = await getVorHotCatalog(session.locale);
      const minI = session.config.minIntensity ?? 1;
      const maxI = session.config.maxIntensity ?? 10;
      let bonusPool = (catalog.bonusCards || []).filter(
        (c) => c.intensidad >= minI && c.intensidad <= maxI
      );
      if (bonusPool.length === 0) {
        bonusPool = catalog.bonusCards || [];
      }

      const activePlayer = session.players[nextPlayerIndex];
      const usedSet = new Set((session.usedCardIds || []).map((id) => String(id)));
      const unusedBonus = bonusPool.filter((c) => !usedSet.has(String(c.id)));
      const availableBonus = unusedBonus.length > 0 ? unusedBonus : bonusPool;
      const rawBonus = pickRandomElement(availableBonus) || {
        id: `bonus_fb_${Date.now()}`,
        texto: '¡Ronda Bonus! Todos los que estén solteros toman un shot.',
        tipo: 'bonus',
        intensidad: 5,
        castigo: '1 trago',
        participantes: 'grupo'
      };

      const assignedBonus = {
        ...rawBonus,
        selectedPlayers: [activePlayer]
      };

      return {
        session: {
          ...session,
          turn: nextTurn,
          activePlayerIndex: nextPlayerIndex,
          bonusCounter: 0,
          isVorChoiceStage: false,
          currentChoice: 'bonus',
          currentCard: assignedBonus,
          usedCardIds: [...(session.usedCardIds || []), String(rawBonus.id)].slice(-100)
        },
        resolvedOutcome: { result }
      };
    }

    return {
      session: {
        ...session,
        turn: nextTurn,
        activePlayerIndex: nextPlayerIndex,
        bonusCounter: nextBonusCounter,
        isVorChoiceStage: true,
        currentChoice: null,
        currentCard: null
      },
      resolvedOutcome: { result }
    };
  },

  buildTurnViewModel(session, localPlayers = []) {
    if (!session) return null;

    const localMap = new Map(localPlayers.map((p) => [String(p.id), p]));
    const playersList = Array.isArray(session?.players) ? session.players : [];
    const activeRaw = playersList[session?.activePlayerIndex] || playersList[0] || { id: 'p1', name: 'Jugador 1' };
    const fullActive = localMap.get(String(activeRaw.id)) || activeRaw;
    const activePlayer = {
      id: String(activeRaw.id),
      name: fullActive.name || activeRaw.name,
      avatarEmoji: fullActive.avatarEmoji || '',
      avatarColor: fullActive.avatarColor || '',
      drinksAlcohol: fullActive.drinksAlcohol !== false
    };

    const maxConsecutive = session.config?.maxConsecutiveTruths ?? 3;
    const consecutiveTruths = session.playerTruthCounts?.[activePlayer.id] || 0;
    const truthLocked = maxConsecutive > 0 && consecutiveTruths >= maxConsecutive;
    const truthRemaining = maxConsecutive > 0 ? Math.max(0, maxConsecutive - consecutiveTruths) : Infinity;

    if (session.isVorChoiceStage || !session.currentCard) {
      return {
        isVorChoice: true,
        turnNumber: session.turn,
        targetTurns: session.config?.targetTurns || 45,
        activePlayer,
        consecutiveTruths,
        maxConsecutiveTruths: maxConsecutive,
        truthLocked,
        truthRemaining,
        locale: session.locale,
        turnOrder: session.config?.turnOrder || 'secuencial',
        fxMode: 'hot'
      };
    }

    const card = session.currentCard;
    const typeMeta = PREVIA_MIX_TYPE_CONFIG[card.tipo] || {
      name: 'Hot +18',
      color: '#f43f5e',
      border: '#f43f5e',
      hex: 0xf43f5e,
      label: card.tipo === 'verdad_hot' ? 'Verdad Hot 🌶️' : card.tipo === 'reto_hot' ? 'Reto Hot ⚡' : 'Hot +18'
    };

    const selectedPlayers = (card.selectedPlayers || [activePlayer]).map((sp, idx) => {
      const full = localMap.get(String(sp.id));
      return {
        id: String(sp.id),
        name: full?.name || sp.name || `Jugador ${idx + 1}`,
        avatarEmoji: full?.avatarEmoji || '',
        avatarColor: full?.avatarColor || '',
        drinksAlcohol: full ? full.drinksAlcohol !== false : true
      };
    });

    const isGroupEvent = card.participantes === 'grupo';
    const isSpecialEvent = card.tipo === 'eventos especiales';

    const safePromptTokens = buildSafePromptTokens(
      card.texto,
      selectedPlayers,
      localMap,
      session.locale,
      card.resp || ''
    );

    const isDrinkingPenalty = /(trago|shot|sorbo|copa|bebe|toma|drink|sip|pint|beer|gole|golo)/i.test(card.castigo || '');
    const penaltyLabel = resolveDynamicPenalty(
      card.castigo || 'Si no cumple [castigo_toma{1-3} || castigo_notoma{x}].',
      Boolean(activePlayer.drinksAlcohol),
      null,
      null,
      Math.random,
      session.locale
    );

    let displayTypeLabel = 'Verdad o Reto Hot +18';
    if (card.tipo === 'bonus') {
      displayTypeLabel = 'Bonus 🎁';
    } else if (session.currentChoice === 'verdad' || card.tipo === 'verdad_hot') {
      displayTypeLabel = 'Verdad Hot 🌶️';
    } else if (session.currentChoice === 'reto' || card.tipo === 'reto_hot') {
      displayTypeLabel = 'Reto Hot ⚡';
    }

    return {
      card,
      canComplete: true,
      canSkip: true,
      canForfeit: true,
      turnNumber: session.turn,
      targetTurns: session.config?.targetTurns || 45,
      currentIntensity: card.intensidad || 5,
      typeMeta,
      fxMode: 'hot',
      activePlayer,
      selectedPlayers,
      isGroupEvent,
      isSpecialEvent,
      cardTypeLabel: displayTypeLabel,
      promptTokens: safePromptTokens,
      penaltyLabel,
      isDrinkingPenalty,
      isVorChoice: false,
      consecutiveTruths,
      maxConsecutiveTruths: maxConsecutive,
      truthLocked,
      truthRemaining,
      locale: session.locale
    };
  },

  async setSessionLocale(session, nextLocale) {
    if (!session) return { session, changed: false };
    const norm = String(nextLocale).toLowerCase().startsWith('en')
      ? 'en'
      : String(nextLocale).toLowerCase().startsWith('pt')
        ? 'pt'
        : 'es';
    if (session.locale === norm) return { session, changed: false };
    session.locale = norm;
    return { session, changed: true };
  }
};
