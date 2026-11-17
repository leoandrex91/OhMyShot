/**
 * Oh My Shot! — Adaptador del Modo "Mix Hot +18"
 *
 * Modo especial que combina todas las categorías picantes:
 * - Cartas Hot clásicas
 * - Verdad Hot
 * - Reto Hot
 * - Yo Nunca Hot
 * - Quién Hot
 * - Cultura Chupística Hot (adaptadas para deslizar como cartas rápidas)
 * - Cartas personalizadas hot
 *
 * Utiliza el motor 3D de baraja y gestos de deslizamiento (Previa Mix).
 */

import { loadCardsLocale, loadHotCardsLocale, loadCulturaHotCards } from '../../cards/cards.loader.js';
import { getBonusCardsForLocale } from '../../config/bonusCards.catalog.js';
import { getCustomCardsForMode } from '../../core/customCards.js';
import {
  createPreviaMixGame,
  nextPreviaMixCard,
  resolvePreviaMixCard,
  canonicalCardId
} from '../previa-mix/previa-mix.engine.js';
import {
  buildSafePromptTokens,
  getEffectiveDrinkSettings,
  pickPenaltyFromToken,
  resolveDynamicPenalty,
  previaMixAdapter
} from '../previa-mix/adapter.js';
import { getRitualPhrasing } from '../cultura-chupistica/adapter.js';
import {
  MIX_HOT_MODE_ID,
  DEFAULT_MIX_HOT_CONFIG
} from './mode.config.js';

const mixHotCatalogCache = new Map();

/**
 * Normaliza una carta para que sea compatible con el motor de Previa Mix.
 */
function normalizeMixHotCard(card, defaultType = 'hot') {
  if (!card) return null;
  const id = String(card.id || `hot_c_${Math.random().toString(36).slice(2, 7)}`);
  const tipo = card.tipo || defaultType;
  let texto = String(card.texto || card.prompt || card.tema || '').trim();

  // Asegurar que la carta tenga al menos un token de jugador si no es grupal
  if (!texto.includes('[player]') && !texto.includes('[all]') && card.participantes !== 'grupo') {
    if (tipo === 'yo_nunca_hot') {
      texto = `${texto} (Quien lo haya hecho, bebe)`;
    } else if (tipo === 'quien_hot') {
      texto = `${texto} A la cuenta de 3, todos señalan.`;
    } else {
      texto = `[player] ${texto}`;
    }
  }

  return {
    ...card,
    id,
    tipo,
    texto,
    intensidad: Math.max(1, Math.min(10, Number(card.intensidad) || 2)),
    castigo: card.castigo || 'Si no cumple [castigo_toma{1-3} || castigo_notoma{x}].',
    min_jugadores: Math.max(2, Number(card.min_jugadores) || 2),
    participantes: card.participantes || 'uno',
    consentimiento: true,
    especial: Boolean(card.especial)
  };
}

/**
 * Carga y unifica las 6 categorías picantes para el locale indicado.
 */
async function loadFullMixHotCatalog(locale = 'es') {
  const normLocale = String(locale).toLowerCase().startsWith('en')
    ? 'en'
    : String(locale).toLowerCase().startsWith('pt')
      ? 'pt'
      : 'es';

  if (mixHotCatalogCache.has(normLocale)) {
    return mixHotCatalogCache.get(normLocale);
  }

  const [baseLoaded, hotBundle, culturaList] = await Promise.all([
    loadCardsLocale(normLocale),
    loadHotCardsLocale(normLocale),
    loadCulturaHotCards(normLocale)
  ]);

  const cardsArray = Array.isArray(baseLoaded) ? baseLoaded : (baseLoaded.questions || []);
  const classicHot = (Array.isArray(baseLoaded.hotCards) && baseLoaded.hotCards.length > 0)
    ? baseLoaded.hotCards
    : cardsArray.filter((c) => c.tipo === 'hot');

  const ritual = getRitualPhrasing(normLocale);

  // Adaptar cultura_hot a tarjetas deslizables de ritmo rápido
  const formattedCulturaHot = (culturaList || []).map((c, i) => {
    const tema = c.tema || c.texto || '';
    const promptText = normLocale === 'en'
      ? `Spicy Trivia: Name examples of... "${tema}". [player] starts!`
      : normLocale === 'pt'
        ? `Cultura Etílica Hot: Diga exemplos de... "${tema}". [player] começa!`
        : `Cultura Chupística Hot: Diga nombres de... "${tema}". ¡Comienza [player]!`;

    return {
      id: `mix_${c.id || i + 1}`,
      tipo: 'cultura_hot',
      intensidad: c.intensidad || 2,
      texto: promptText,
      castigo: c.castigo || 'Si falla [castigo_toma{1-3} || castigo_notoma{x}].',
      min_jugadores: 2,
      participantes: 'uno',
      consentimiento: true,
      especial: false
    };
  });

  const normalizedClassicHot = classicHot.map((c) => normalizeMixHotCard(c, 'hot')).filter(Boolean);
  const normalizedVerdadHot = (hotBundle.verdadHot || []).map((c) => normalizeMixHotCard(c, 'verdad_hot')).filter(Boolean);
  const normalizedRetoHot = (hotBundle.retoHot || []).map((c) => normalizeMixHotCard(c, 'reto_hot')).filter(Boolean);
  const normalizedYoNuncaHot = (hotBundle.yoNuncaHot || []).map((c) => normalizeMixHotCard(c, 'yo_nunca_hot')).filter(Boolean);
  const normalizedQuienHot = (hotBundle.quienHot || []).map((c) => normalizeMixHotCard(c, 'quien_hot')).filter(Boolean);
  const normalizedCulturaHot = formattedCulturaHot.map((c) => normalizeMixHotCard(c, 'cultura_hot')).filter(Boolean);

  const combinedCatalog = [
    ...normalizedClassicHot,
    ...normalizedVerdadHot,
    ...normalizedRetoHot,
    ...normalizedYoNuncaHot,
    ...normalizedQuienHot,
    ...normalizedCulturaHot
  ];

  mixHotCatalogCache.set(normLocale, combinedCatalog);
  return combinedCatalog;
}

const MIX_HOT_ENABLED_TYPES = Object.freeze([
  'hot',
  'verdad_hot',
  'reto_hot',
  'yo_nunca_hot',
  'quien_hot',
  'cultura_hot',
  'bonus'
]);

export const mixHotAdapter = {
  ...previaMixAdapter,
  modeId: MIX_HOT_MODE_ID,

  async preloadLocale(locale) {
    return loadFullMixHotCatalog(locale);
  },

  async createSession({
    localPlayers = [],
    appLang = 'es',
    progressiveCurve = true,
    modeConfig = {}
  }) {
    const locale = String(modeConfig?.locale || appLang || 'es').toLowerCase().startsWith('en')
      ? 'en'
      : String(modeConfig?.locale || appLang || 'es').toLowerCase().startsWith('pt')
        ? 'pt'
        : 'es';

    const minIntensity = Math.max(1, Math.min(10, Number(modeConfig.minIntensity || modeConfig.startIntensity) || 1));
    const maxIntensity = Math.max(minIntensity, Math.min(10, Number(modeConfig.maxIntensity) || 10));
    const targetTurns = Math.max(5, Math.min(900, Number(modeConfig.targetTurns) || 45));

    const enginePlayers = localPlayers.slice(0, 24).map((p, idx) => ({
      id: String(p.id || `p${idx + 1}`),
      name: String(p.name || `Jugador ${idx + 1}`).trim().slice(0, 60) || `Jugador ${idx + 1}`
    }));

    const catalogBase = await loadFullMixHotCatalog(locale);
    let catalog = catalogBase;

    if (modeConfig.customCardsEnabled !== false) {
      const customCards = getCustomCardsForMode(MIX_HOT_MODE_ID, {
        enabledTypes: MIX_HOT_ENABLED_TYPES,
        minIntensity,
        maxIntensity
      });
      if (customCards.length > 0) {
        const normalizedCustom = customCards.map((c) => normalizeMixHotCard(c, c.tipo || 'hot')).filter(Boolean);
        catalog = [...normalizedCustom, ...catalogBase];
      }
    }

    const drinkOpts = getEffectiveDrinkSettings(modeConfig, localPlayers);

    const initial = createPreviaMixGame({
      modeId: MIX_HOT_MODE_ID,
      players: enginePlayers,
      locale,
      enabledTypes: [...MIX_HOT_ENABLED_TYPES],
      minIntensity,
      startIntensity: minIntensity,
      maxIntensity,
      targetTurns,
      eventChance: 0.1,
      progressiveCurve: progressiveCurve !== false,
      noAlcohol: drinkOpts.noAlcohol,
      showOptionalDrinkSuggestion: drinkOpts.showOptionalDrinkSuggestion,
      enableHot: true,
      adultsConfirmed: true,
      everyoneConsentsHot: true,
      motionReduced: false,
      customCardsEnabled: modeConfig.customCardsEnabled !== false
    });

    const started = nextPreviaMixCard(initial, catalog);

    return {
      session: started,
      wasPlayerCountCapped: localPlayers.length > 24
    };
  },

  async advanceTurn(session, result = 'completed', localPlayers = []) {
    if (!session) {
      throw new Error('[Mix Hot] Sesión inválida o expirada.');
    }

    const catalogBase = await loadFullMixHotCatalog(session.locale);
    let catalog = catalogBase;

    if (session.config?.customCardsEnabled !== false) {
      const customCards = getCustomCardsForMode(MIX_HOT_MODE_ID, {
        enabledTypes: MIX_HOT_ENABLED_TYPES,
        minIntensity: session.config?.minIntensity ?? 1,
        maxIntensity: session.config?.maxIntensity ?? 10
      });
      if (customCards.length > 0) {
        const normalizedCustom = customCards.map((c) => normalizeMixHotCard(c, c.tipo || 'hot')).filter(Boolean);
        catalog = [...normalizedCustom, ...catalogBase];
      }
    }

    let workingSession = session;
    const resolved = resolvePreviaMixCard(workingSession, result);
    const nextGame = nextPreviaMixCard(resolved.state, catalog);

    return {
      session: nextGame,
      optionalDrinkSuggestion: resolved.optionalDrinkSuggestion,
      note: resolved.note
    };
  }
};
