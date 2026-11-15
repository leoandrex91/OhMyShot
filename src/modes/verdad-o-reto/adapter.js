/**
 * Oh My Shot! — Adaptador del Modo "Verdad o Reto"
 *
 * Mecánica:
 * - Cada jugador (en orden secuencial o aleatorio según configuración) tiene una pantalla
 *   previa interactiva para elegir entre dos cartas: ¿Verdad o Reto?
 * - Si un jugador alcanza el límite configurable de verdades consecutivas (por defecto 3),
 *   la opción de Verdad se bloquea y debe elegir Reto obligatoriamente.
 * - Al cumplir un Reto, se reinicia el contador de verdades de ese jugador.
 * - Incluye rondas Bonus sorpresa (que aparecen directamente sin mostrar la pantalla de elección).
 * - Soporta cartas personalizadas de verdad y reto creadas por los usuarios.
 */

import { loadCardsLocale } from '../../cards/cards.loader.js';
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
import { DEFAULT_VERDAD_O_RETO_CONFIG, VERDAD_O_RETO_MODE_ID } from './mode.config.js';

// Cache en memoria de catálogos cargados por locale
const catalogCache = new Map();

async function getVorCatalog(locale = 'es-CO') {
  if (catalogCache.has(locale)) {
    return catalogCache.get(locale);
  }
  const loaded = await loadCardsLocale(locale);
  const cardsArray = Array.isArray(loaded) ? loaded : (loaded.questions || []);

  const verdadCards = (Array.isArray(loaded.verdadCards) && loaded.verdadCards.length > 0)
    ? loaded.verdadCards
    : cardsArray.filter((c) => c.tipo === 'verdad');

  const retoCards = (Array.isArray(loaded.retoCards) && loaded.retoCards.length > 0)
    ? loaded.retoCards
    : cardsArray.filter((c) => c.tipo === 'reto');

  const retosEspecialesCards = (Array.isArray(loaded.retosEspecialesCards) && loaded.retosEspecialesCards.length > 0)
    ? loaded.retosEspecialesCards
    : cardsArray.filter((c) => c.tipo === 'retos especiales');

  const bonusCards = (Array.isArray(loaded.bonusCards) && loaded.bonusCards.length > 0)
    ? loaded.bonusCards
    : cardsArray.filter((c) => c.tipo === 'bonus');

  const catalog = {
    questions: cardsArray,
    verdadCards,
    retoCards,
    retosEspecialesCards,
    bonusCards,
    castigos_toma: loaded.castigos_toma || [],
    castigos_notoma: loaded.castigos_notoma || []
  };

  catalogCache.set(locale, catalog);
  return catalog;
}

function normalizeVorConfig(raw = {}) {
  return {
    ...DEFAULT_VERDAD_O_RETO_CONFIG,
    ...raw,
    turnOrder: raw.turnOrder === 'aleatorio' ? 'aleatorio' : 'secuencial',
    maxConsecutiveTruths:
      typeof raw.maxConsecutiveTruths === 'number'
        ? Math.max(0, Math.min(10, Math.round(raw.maxConsecutiveTruths)))
        : 3,
    bonusEnabled: raw.bonusEnabled !== false,
    customCardsEnabled: raw.customCardsEnabled !== false,
    targetTurns: Math.max(15, Math.min(120, Number(raw.targetTurns) || 45)),
    minIntensity: Math.max(1, Math.min(10, Number(raw.minIntensity) || 1)),
    maxIntensity: Math.max(1, Math.min(10, Number(raw.maxIntensity) || 10))
  };
}

function pickRandomElement(arr, rng = Math.random) {
  if (!arr || arr.length === 0) return null;
  const idx = Math.floor(rng() * arr.length);
  return arr[idx];
}

export const verdadORetoAdapter = {
  modeId: VERDAD_O_RETO_MODE_ID,

  async createSession({
    localPlayers = [],
    appLang = 'es',
    modeConfig = {}
  }) {
    const config = normalizeVorConfig(modeConfig);
    const locale = modeConfig.locale || (appLang === 'en' ? 'en-US' : appLang === 'pt' ? 'pt-BR' : 'es-CO');
    const catalog = await getVorCatalog(locale);

    // Jugadores de la sesión
    const activeSlice = localPlayers.slice(0, PREVIA_MIX_MAX_PLAYERS);
    const enginePlayers = activeSlice.map((p, idx) => ({
      id: String(p.id || `p${idx + 1}`),
      name: p.name || `Jugador ${idx + 1}`,
      avatarEmoji: p.avatarEmoji || '',
      avatarColor: p.avatarColor || '',
      drinksAlcohol: p.drinksAlcohol !== false
    }));

    // Índice de inicio
    const activePlayerIndex =
      config.turnOrder === 'aleatorio' && enginePlayers.length > 0
        ? Math.floor(Math.random() * enginePlayers.length)
        : 0;

    // Inicializar contadores de verdades consecutivas por jugador
    const playerTruthCounts = {};
    for (const p of enginePlayers) {
      playerTruthCounts[p.id] = 0;
    }

    const session = {
      schemaVersion: PREVIA_MIX_SCHEMA_VERSION,
      modeId: VERDAD_O_RETO_MODE_ID,
      locale,
      config,
      players: enginePlayers,
      activePlayerIndex,
      turn: 1,
      finished: false,
      playerTruthCounts,
      usedCardIds: [],
      // Estado de la fase de elección
      isVorChoiceStage: true,
      currentChoice: null, // 'verdad' | 'reto' | 'bonus'
      currentCard: null,
      bonusCounter: 0
    };

    return {
      session,
      wasPlayerCountCapped: localPlayers.length > PREVIA_MIX_MAX_PLAYERS
    };
  },

  /**
   * El jugador activo elige "verdad" o "reto". Revela la carta correspondiente.
   */
  async chooseChoice(session, choice) {
    if (!session || session.finished || !session.isVorChoiceStage) {
      return session;
    }

    const activePlayer = session.players[session.activePlayerIndex] || session.players[0];
    const playerId = activePlayer.id;
    const currentTruthCount = session.playerTruthCounts[playerId] || 0;
    const maxTruths = session.config.maxConsecutiveTruths ?? 3;

    // Validación de límite de verdades
    let effectiveChoice = choice;
    if (choice === 'verdad' && maxTruths > 0 && currentTruthCount >= maxTruths) {
      // Bloqueado: forzar reto
      effectiveChoice = 'reto';
    }

    // Cargar catálogo y cartas personalizadas
    const catalog = await getVorCatalog(session.locale);
    const minI = session.config.minIntensity ?? 1;
    const maxI = session.config.maxIntensity ?? 10;
    const usedSet = new Set((session.usedCardIds || []).map((id) => String(id)));

    let pool = [];

    if (effectiveChoice === 'verdad') {
      // Base truths (únicamente cartas para un solo jugador: participantes === 'uno')
      let baseTruths = (catalog.verdadCards || []).filter(
        (c) => c.intensidad >= minI && c.intensidad <= maxI && (c.participantes === 'uno' || !c.participantes)
      );
      if (baseTruths.length === 0) {
        baseTruths = (catalog.verdadCards || []).filter(
          (c) => c.participantes === 'uno' || !c.participantes
        );
      }
      pool = [...baseTruths];

      // Custom truths (únicamente participantes: 'uno')
      if (session.config.customCardsEnabled !== false) {
        const customTruths = getCustomCardsForMode('verdad-o-reto', {
          enabledTypes: ['verdad'],
          minIntensity: minI,
          maxIntensity: maxI
        }).filter((c) => c.participantes === 'uno' || !c.participantes);
        pool = [...customTruths, ...pool];
      }

      // Actualizar contador de verdades del jugador
      session.playerTruthCounts[playerId] = currentTruthCount + 1;
    } else {
      // Retos estándar (únicamente cartas para un solo jugador: participantes === 'uno')
      let baseDares = (catalog.retoCards || []).filter(
        (c) => c.intensidad >= minI && c.intensidad <= maxI && (c.participantes === 'uno' || !c.participantes)
      );
      if (baseDares.length === 0) {
        baseDares = (catalog.retoCards || []).filter(
          (c) => c.participantes === 'uno' || !c.participantes
        );
      }
      pool = [...baseDares];

      // Custom dares (únicamente participantes: 'uno')
      if (session.config.customCardsEnabled !== false) {
        const customDares = getCustomCardsForMode('verdad-o-reto', {
          enabledTypes: ['reto'],
          minIntensity: minI,
          maxIntensity: maxI
        }).filter((c) => c.participantes === 'uno' || !c.participantes);
        pool = [...customDares, ...pool];
      }

      // Al elegir Reto, se reinicia el contador de verdades de este jugador
      session.playerTruthCounts[playerId] = 0;
    }

    // Seleccionar carta que no haya salido recientemente
    const unused = pool.filter((c) => !usedSet.has(String(c.id)));
    const availablePool = unused.length > 0 ? unused : pool;
    let card = pickRandomElement(availablePool) || pool[0];

    if (!card) {
      // Fallback de emergencia para un solo jugador
      card = {
        id: `vor_fb_${Date.now()}`,
        texto:
          effectiveChoice === 'verdad'
            ? '¿Cuál ha sido la mentira más grande que has dicho en una fiesta?'
            : 'Imita a alguien del grupo durante 1 minuto o toma 2 tragos.',
        tipo: effectiveChoice === 'verdad' ? 'verdad' : 'reto',
        intensidad: 5,
        castigo: '1 trago',
        participantes: 'uno'
      };
    }

    // Clonar carta y asignar únicamente al jugador activo (participantes: 'uno')
    const assignedCard = {
      ...card,
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

  /**
   * Avanza al siguiente turno.
   */
  async advanceTurn(session, result = 'completed', localPlayers = []) {
    if (!session) {
      throw new Error('[Verdad o Reto] Sesión inválida.');
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

    // Seleccionar el siguiente jugador protagonista
    let nextPlayerIndex = 0;
    if (session.config.turnOrder === 'aleatorio' && session.players.length > 1) {
      do {
        nextPlayerIndex = Math.floor(Math.random() * session.players.length);
      } while (nextPlayerIndex === session.activePlayerIndex);
    } else {
      nextPlayerIndex = (session.activePlayerIndex + 1) % session.players.length;
    }

    // Comprobar si corresponde una ronda Bonus
    const bonusInterval = 8;
    const nextBonusCounter = (session.bonusCounter || 0) + 1;
    const isBonusTurn = session.config.bonusEnabled !== false && nextBonusCounter >= bonusInterval;

    if (isBonusTurn) {
      // Ronda Bonus directa: NO muestra pantalla de verdad o reto
      const catalog = await getVorCatalog(session.locale);
      const minI = session.config.minIntensity ?? 1;
      const maxI = session.config.maxIntensity ?? 10;
      let bonusPool = (catalog.bonusCards || []).filter(
        (c) => c.intensidad >= minI && c.intensidad <= maxI
      );
      if (bonusPool.length === 0) {
        bonusPool = catalog.bonusCards || [];
      }

      if (session.config.customCardsEnabled !== false) {
        const customBonus = getCustomCardsForMode('verdad-o-reto', {
          enabledTypes: ['bonus'],
          minIntensity: minI,
          maxIntensity: maxI
        });
        bonusPool = [...customBonus, ...bonusPool];
      }

      const activePlayer = session.players[nextPlayerIndex];
      const otherPlayers = session.players.filter((p) => p.id !== activePlayer.id);
      const usedSet = new Set((session.usedCardIds || []).map((id) => String(id)));
      const unusedBonus = bonusPool.filter((c) => !usedSet.has(String(c.id)));
      const availableBonus = unusedBonus.length > 0 ? unusedBonus : bonusPool;
      const rawBonus = pickRandomElement(availableBonus) || {
        id: `bonus_fb_${Date.now()}`,
        texto: '¡Ronda Bonus! Todos los que lleven gafas o reloj toman un shot.',
        tipo: 'bonus',
        intensidad: 5,
        castigo: '1 trago',
        participantes: 'grupo'
      };

      const bonusCard = {
        ...rawBonus,
        selectedPlayers: [activePlayer, ...otherPlayers]
      };

      const nextUsed = [...(session.usedCardIds || []), String(rawBonus.id)].slice(-100);

      return {
        session: {
          ...session,
          turn: nextTurn,
          activePlayerIndex: nextPlayerIndex,
          bonusCounter: 0,
          isVorChoiceStage: false,
          currentChoice: 'bonus',
          currentCard: bonusCard,
          usedCardIds: nextUsed
        },
        resolvedOutcome: { result }
      };
    }

    // Turno normal: muestra la pantalla de elección ¿Verdad o Reto?
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

  /**
   * Genera el ViewModel para la vista de juego.
   */
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

    // FASE 1: Pantalla de elección previa de ¿Verdad o Reto?
    if (session.isVorChoiceStage || !session.currentCard) {
      return {
        isVorChoice: true,
        turnNumber: session.turn,
        targetTurns: session.config.targetTurns,
        activePlayer,
        consecutiveTruths,
        maxConsecutiveTruths: maxConsecutive,
        truthLocked,
        truthRemaining,
        locale: session.locale,
        turnOrder: session.config.turnOrder || 'secuencial'
      };
    }

    // FASE 2: Carta revelada (Verdad, Reto o Bonus)
    const card = session.currentCard;
    const typeMeta = PREVIA_MIX_TYPE_CONFIG[card.tipo] || PREVIA_MIX_TYPE_CONFIG['clásico'];
    const fxMode = resolveCardFxMode(card);

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

    const isBonusCard = card.tipo === 'bonus' || session.currentChoice === 'bonus';
    const isDiceCard = isBonusCard && card.subtipo === 'bonus_dice';

    const catalog = catalogCache.get(session.locale);
    const castigosToma = catalog?.castigos_toma || [];
    const castigosNotoma = catalog?.castigos_notoma || [];

    const playerDoesDrink = activePlayer.drinksAlcohol !== false;
    let cardPenaltyText = '';
    if (!isBonusCard && card.castigo) {
      cardPenaltyText = resolveDynamicPenalty(
        card.castigo,
        playerDoesDrink,
        castigosToma,
        castigosNotoma
      );
    }

    const basePromptText = String(card.texto || '').trim();
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
      selectedPlayers,
      localMap,
      session.locale,
      card.resp || card.respuesta || ''
    );

    return {
      isVorChoice: false,
      canComplete: true,
      canSkip: true,
      canForfeit: true,
      card,
      turnNumber: session.turn,
      targetTurns: session.config.targetTurns,
      locale: session.locale,
      typeLabel:
        session.currentChoice === 'verdad'
          ? 'Verdad'
          : session.currentChoice === 'reto'
            ? 'Reto'
            : isBonusCard
              ? 'Bonus'
              : (card.tipo === 'verdad' ? 'Verdad' : card.tipo === 'reto' ? 'Reto' : 'Bonus'),
      typeMeta,
      fxMode,
      cardIntensity: card.intensidad || 5,
      minIntensity: session.config.minIntensity ?? 1,
      maxIntensity: session.config.maxIntensity ?? 10,
      selectedPlayers,
      excludedPlayers: [],
      highlightedPlayerIds: new Set(selectedPlayers.map((p) => String(p.id))),
      promptTokens,
      cardPenaltyText: cardPenaltyText || null,
      cardPenaltyIsSober: !playerDoesDrink,
      activeEvents: [],
      pendingPlayers: [],
      hasPendingEventPlayers: false,
      isEventActivation: false,
      isBonusCard,
      bonusSubtype: card.subtipo || null,
      isDiceCard,
      diceConfig: card.diceConfig || null,
      activePlayer,
      consecutiveTruths,
      maxConsecutiveTruths: maxConsecutive,
      currentChoice: session.currentChoice
    };
  }
};
