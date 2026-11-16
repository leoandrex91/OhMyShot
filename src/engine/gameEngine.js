import { CARD_CATEGORIES } from '../config/constants.js';
import { PHASE1_DECK } from './decksData.js';

/**
 * Calcula la intensidad maxima permitida segun la ronda actual (Curva de Fiesta).
 */
export function computeIntensityCap(round, settings = {}) {
  const maxAllowed = settings.maxIntensity ?? 5;
  if (settings.progressiveCurve === false) return maxAllowed;
  if (round <= 2) return Math.min(2, maxAllowed);
  if (round <= 5) return Math.min(3, maxAllowed);
  if (round <= 9) return Math.min(4, maxAllowed);
  return maxAllowed;
}

function formatPenalty(units, alcoholMode, lang) {
  if (alcoholMode) {
    if (lang === 'en') return `${units} ${units === 1 ? 'sip' : 'sips'}`;
    return `${units} ${units === 1 ? 'trago' : 'tragos'}`;
  }
  if (lang === 'en') return `${units} ${units === 1 ? 'dare (no alcohol)' : 'dares (no alcohol)'}`;
  return `${units} ${units === 1 ? 'reto (sin alcohol)' : 'retos (sin alcohol)'}`;
}

function pickPlayersForTemplate(players, turnIndex) {
  if (!players.length) {
    return {
      currentName: 'Jugador 1',
      otherName: 'el grupo'
    };
  }
  const safeIdx = ((turnIndex % players.length) + players.length) % players.length;
  const current = players[safeIdx];
  const others = players.filter((_, idx) => idx !== safeIdx);
  const other = others.length
    ? others[Math.floor(Math.random() * others.length)]
    : current;

  return {
    currentName: current.name,
    otherName: other === current ? 'quien elijas' : other.name
  };
}

function pickEligiblePool(sourceDeck, usedIds, cap, playerCount, currentDrinks) {
  let pool = sourceDeck.filter(
    (card) =>
      !usedIds.has(card.id) &&
      !usedIds.has(String(card.id)) &&
      card.intensity <= cap &&
      card.minPlayers <= playerCount
  );

  if (!currentDrinks) {
    const nonDrinkPool = pool.filter((card) => card.category !== 'drink');
    if (nonDrinkPool.length > 0) return nonDrinkPool;
  }
  return pool;
}

/**
 * Extrae la siguiente carta para Previa Mix evitando repeticiones, aplicando
 * curva progresiva de intensidad, interpolacion de jugadores y reglas activas.
 */
export function drawNextTurnState({
  room,
  players,
  deck = PHASE1_DECK,
  modeId = 'classic',
  advanceTurn = true
}) {
  const currentState = room.state || {};
  const settings = room.settings || {};
  const lang = settings.lang || 'es';
  const round = (currentState.round || 0) + 1;
  const nextTurnIndex = !players.length
    ? 0
    : advanceTurn
      ? ((currentState.turnIndex ?? -1) + 1) % players.length
      : Math.max(0, currentState.turnIndex ?? 0) % players.length;

  const usedIds = new Set(currentState.usedCardIds || []);
  const cap = computeIntensityCap(round, settings);
  const playerCount = Math.max(players.length, 2);

  const sourceDeck = deck;

  const currentPlayer = players.length ? players[nextTurnIndex] : null;
  const currentDrinks =
    settings.alcoholMode !== false && (currentPlayer ? currentPlayer.drinksAlcohol !== false : true);

  let pool = pickEligiblePool(sourceDeck, usedIds, cap, playerCount, currentDrinks);
  let nextUsedIds = [...usedIds];
  if (pool.length === 0) {
    // Reinicia baraja solo para las cartas del modo actual
    const scopedIds = new Set(sourceDeck.map((c) => String(c.id)));
    nextUsedIds = nextUsedIds.filter((id) => !scopedIds.has(String(id)));
    pool = pickEligiblePool(sourceDeck, new Set(nextUsedIds), cap, playerCount, currentDrinks);
  }
  if (pool.length === 0) {
    pool = sourceDeck;
  }

  const chosen = pool[Math.floor(Math.random() * pool.length)];
  nextUsedIds.push(String(chosen.id));

  const { currentName, otherName } = pickPlayersForTemplate(players, nextTurnIndex);
  const penaltyText = formatPenalty(chosen.penaltyUnits || 1, currentDrinks, lang);
  const rawTemplate = lang === 'en' ? chosen.templateEn : chosen.templateEs;

  const renderedText = rawTemplate
    .replaceAll('{current}', currentName)
    .replaceAll('{other}', otherName)
    .replaceAll('{penalty}', penaltyText);

  const remainingRules = (currentState.activeRules || [])
    .map((rule) => ({ ...rule, remainingTurns: rule.remainingTurns - 1 }))
    .filter((rule) => rule.remainingTurns > 0);

  if (chosen.durationTurns > 0) {
    remainingRules.push({
      id: `${chosen.id}-${round}`,
      titleEs: chosen.ruleTitleEs || 'Regla Especial',
      titleEn: chosen.ruleTitleEn || 'Special Rule',
      remainingTurns: chosen.durationTurns
    });
  }

  const meta = CARD_CATEGORIES[chosen.category] || CARD_CATEGORIES.drink;

  return {
    round,
    turnIndex: nextTurnIndex,
    usedCardIds: nextUsedIds,
    activeRules: remainingRules,
    lastDiceRoll: currentState.lastDiceRoll ?? null,
    currentCard: {
      id: chosen.id,
      category: chosen.category,
      categoryLabel: lang === 'en' ? meta.labelEn : meta.labelEs,
      emoji: meta.emoji || '🎤',
      color: meta.color,
      hex: meta.hex,
      cardGradient: meta.cardGradient || 'var(--oms-gradient-party)',
      onCardColor: meta.onCardColor || 'var(--oms-text-on-vibrant)',
      intensity: chosen.intensity,
      renderedText
    }
  };
}
