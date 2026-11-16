/**
 * Oh My Shot! — Adaptador del Modo "Cultura Chupística"
 *
 * Mecánica Oficial:
 * - Ronda grupal continua por turnos en sentido horario a partir de un jugador inicial.
 * - Cada carta presenta un tema limpio (sin ejemplos de respuesta).
 * - Canto/rito ritual de cabecera adaptado según el país activo:
 *   - Colombia (es-CO): "Cultura Chupística de [Categoría], como por ejemplo:"
 *   - México (es-MX): "Caricachupas presenta: [Categoría], como por ejemplo:"
 *   - España (es-ES): "Cultura Chupística de [Categoría], como por ejemplo:"
 *   - USA / UK (en-US, en-GB): "Categories of [Category], such as:"
 *   - Brasil / Portugal (pt-BR, pt-PT): "Cultura Chupística / Cultura do Gole de [Categoria], como por exemplo:"
 * - Temporizador configurable: Infinito (por defecto, para llevar el compás con palmadas) o 4s / 6s / 8s.
 * - Contador opcional de fallos: cuando alguien repite, duda o falla, se selecciona al jugador,
 *   se le anota +1 fallo y se genera el castigo dinámico correspondiente.
 * - Podio final: corona a la "Mente Rápida" (menos fallos) y al "Más Prendido / Rey del Shot" (más fallos).
 */

import { loadCulturaChupisticaCards } from '../../cards/cards.loader.js';
import { getCastigosForLocale } from '../../cards/castigos.catalog.js';
import { resolveDynamicPenalty } from '../previa-mix/adapter.js';
import {
  CULTURA_CHUPISTICA_MODE_ID,
  DEFAULT_CULTURA_CHUPISTICA_CONFIG
} from './mode.config.js';

// Cache en memoria de catálogos por locale
const catalogCache = new Map();

async function getCulturaCatalog(locale = 'es-CO') {
  if (catalogCache.has(locale)) {
    return catalogCache.get(locale);
  }
  const loadedCards = await loadCulturaChupisticaCards(locale);
  const castigos = getCastigosForLocale(locale);
  const catalog = {
    cards: Array.isArray(loadedCards) ? loadedCards : [],
    castigos_toma: castigos.castigos_toma || [],
    castigos_notoma: castigos.castigos_notoma || []
  };
  catalogCache.set(locale, catalog);
  return catalog;
}

function normalizeConfig(raw = {}) {
  const timerMode = ['infinite', '4s', '6s', '8s'].includes(raw.timerMode)
    ? raw.timerMode
    : 'infinite';

  return {
    ...DEFAULT_CULTURA_CHUPISTICA_CONFIG,
    ...raw,
    timerMode,
    trackFails: raw.trackFails !== false,
    minIntensity: Math.max(1, Math.min(10, Number(raw.minIntensity) || 1)),
    maxIntensity: Math.max(1, Math.min(10, Number(raw.maxIntensity) || 10)),
    targetTurns: Math.max(10, Math.min(100, Number(raw.targetTurns) || 30))
  };
}

function shuffleArray(arr, rng = Math.random) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getRitualPhrasing(locale = 'es-CO') {
  const norm = String(locale || 'es-CO').toLowerCase();
  if (norm.startsWith('es-mx')) {
    return {
      prefix: 'Caricachupas presenta:',
      connector: '... como por ejemplo:'
    };
  }
  if (norm.startsWith('es-es')) {
    return {
      prefix: 'Cultura Chupística de:',
      connector: '... como por ejemplo:'
    };
  }
  if (norm.startsWith('en')) {
    return {
      prefix: 'Categories of:',
      connector: '... such as:'
    };
  }
  if (norm.startsWith('pt-pt')) {
    return {
      prefix: 'Cultura do Gole de:',
      connector: '... como por exemplo:'
    };
  }
  if (norm.startsWith('pt')) {
    return {
      prefix: 'Cultura Chupística de:',
      connector: '... como por exemplo:'
    };
  }
  // Default es-CO / Latin America
  return {
    prefix: 'Cultura Chupística de:',
    connector: '... como por ejemplo:'
  };
}

export const culturaChupisticaAdapter = {
  modeId: CULTURA_CHUPISTICA_MODE_ID,

  async createSession({
    localPlayers = [],
    appLang = 'es',
    modeConfig = {},
    isAdultConfirmed = true
  }) {
    const config = normalizeConfig(modeConfig);
    const locale = modeConfig.locale || (appLang === 'en' ? 'en-US' : appLang === 'pt' ? 'pt-BR' : 'es-CO');
    const catalog = await getCulturaCatalog(locale);

    // Filtrar por rango de intensidad
    let pool = catalog.cards.filter((c) => {
      const cardInt = Number(c.intensidad) || 1;
      return cardInt >= config.minIntensity && cardInt <= config.maxIntensity;
    });

    // Filtro de protección +18 si no está confirmado
    if (!isAdultConfirmed) {
      pool = pool.filter((c) => c.categoria !== 'hot' && (Number(c.intensidad) || 1) <= 8);
    }

    if (pool.length === 0) {
      pool = catalog.cards.slice(0, 100);
    }

    const deck = shuffleArray(pool);

    const failsByPlayer = {};
    for (const player of localPlayers) {
      if (player && player.id) {
        failsByPlayer[player.id] = 0;
      }
    }

    const session = {
      mode: CULTURA_CHUPISTICA_MODE_ID,
      locale,
      config,
      deck,
      currentCardIndex: 0,
      currentTurn: 1,
      targetTurns: config.targetTurns,
      activeStarterIdx: 0,
      failsByPlayer,
      direction: 'clockwise',
      roundState: 'active', // 'active' | 'fail_selection' | 'penalty_revealed' | 'game_over'
      lastFailedPlayer: null,
      lastPenalty: null,
      castigosCatalog: {
        toma: catalog.castigos_toma,
        notoma: catalog.castigos_notoma
      }
    };

    return {
      session,
      wasPlayerCountCapped: false
    };
  },

  buildTurnViewModel(session, localPlayers = [], appLang = 'es') {
    if (!session || !session.deck || session.deck.length === 0) {
      return null;
    }

    const card = session.deck[session.currentCardIndex % session.deck.length];
    const starterPlayer = localPlayers[session.activeStarterIdx % localPlayers.length] || {
      id: 'p1',
      name: 'Jugador 1',
      avatar: './assets/icons/ui/icon_06.webp',
      drinksAlcohol: true
    };

    const ritual = getRitualPhrasing(session.locale);
    const isGameOver = session.currentTurn > session.targetTurns;

    // Calcular podio actual
    const scoreboard = localPlayers.map((p) => ({
      player: p,
      fails: session.failsByPlayer[p.id] || 0
    })).sort((a, b) => a.fails - b.fails);

    return {
      card,
      cardId: card.id,
      intensidad: card.intensidad || 1,
      categoria: card.categoria || 'clasico',
      tema: card.tema || '',
      ritualPrefix: ritual.prefix,
      ritualConnector: ritual.connector,
      starterPlayer,
      currentTurn: session.currentTurn,
      targetTurns: session.targetTurns,
      direction: session.direction,
      timerMode: session.config.timerMode,
      trackFails: session.config.trackFails,
      roundState: session.roundState,
      lastFailedPlayer: session.lastFailedPlayer,
      lastPenalty: session.lastPenalty,
      isGameOver,
      scoreboard,
      winner: scoreboard[0] || null,
      shotKing: scoreboard[scoreboard.length - 1] || null
    };
  },

  recordFail(session, playerId, localPlayers = []) {
    if (!session) return null;

    const player = localPlayers.find((p) => p.id === playerId);
    if (!player) return null;

    if (!session.failsByPlayer[playerId]) {
      session.failsByPlayer[playerId] = 0;
    }
    session.failsByPlayer[playerId] += 1;

    // Generar castigo dinámico
    const template = 'Si falla [castigo_toma{1-3} || castigo_notoma{x}]';
    const penalty = resolveDynamicPenalty(
      template,
      Boolean(player.drinksAlcohol),
      session.castigosCatalog?.toma,
      session.castigosCatalog?.notoma,
      Math.random,
      session.locale
    );

    session.lastFailedPlayer = player;
    session.lastPenalty = penalty;
    session.roundState = 'penalty_revealed';

    return {
      player,
      penalty,
      fails: session.failsByPlayer[playerId]
    };
  },

  advanceToNextRound(session, localPlayers = []) {
    if (!session) return;

    session.currentCardIndex = (session.currentCardIndex + 1) % session.deck.length;
    session.currentTurn += 1;
    session.activeStarterIdx = (session.activeStarterIdx + 1) % localPlayers.length;
    session.roundState = session.currentTurn > session.targetTurns ? 'game_over' : 'active';
    session.lastFailedPlayer = null;
    session.lastPenalty = null;
  },

  openFailModal(session) {
    if (!session) return;
    session.roundState = 'fail_selection';
  },

  cancelFailModal(session) {
    if (!session) return;
    session.roundState = 'active';
  }
};
