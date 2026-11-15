import { CARD_CATEGORIES, DESIGN_TOKENS, UI_ICONS } from '../../config/themeTokens.js';

/**
 * Configuracion independiente de Previa Mix v3.0.
 * Sincronizada con logicas/Previa Mix/PREVIA_MIX_LOGICA_PARA_IA.md.
 */

export const PREVIA_MIX_MODE_ID = 'classic';
export const PREVIA_MIX_SCHEMA_VERSION = 3;
export const PREVIA_MIX_MAX_PLAYERS = 24;
export const PREVIA_MIX_MIN_PLAYERS = 2;

export const PREVIA_MIX_LOCALE_OPTIONS = Object.freeze([
  {
    code: 'es-CO',
    shortCode: 'CO',
    nativeLabel: 'ES · Español (Colombia)',
    labelEs: 'Colombia',
    labelEn: 'Colombia',
    labelPt: 'Colômbia',
    baseLang: 'es'
  },
  {
    code: 'es-MX',
    shortCode: 'MX',
    nativeLabel: 'ES · Español (México)',
    labelEs: 'México',
    labelEn: 'Mexico',
    labelPt: 'México',
    baseLang: 'es'
  },
  {
    code: 'es-ES',
    shortCode: 'ES',
    nativeLabel: 'ES · Español (España)',
    labelEs: 'España',
    labelEn: 'Spain',
    labelPt: 'Espanha',
    baseLang: 'es'
  },
  {
    code: 'en-US',
    shortCode: 'US',
    nativeLabel: 'EN · English (US)',
    labelEs: 'EE. UU.',
    labelEn: 'US',
    labelPt: 'EUA',
    baseLang: 'en'
  },
  {
    code: 'en-GB',
    shortCode: 'UK',
    nativeLabel: 'EN · English (UK)',
    labelEs: 'Reino Unido',
    labelEn: 'UK',
    labelPt: 'Reino Unido',
    baseLang: 'en'
  },
  {
    code: 'pt-BR',
    shortCode: 'BR',
    nativeLabel: 'PT · Português (Brasil)',
    labelEs: 'Brasil',
    labelEn: 'Brazil',
    labelPt: 'Brasil',
    baseLang: 'pt'
  },
  {
    code: 'pt-PT',
    shortCode: 'PT',
    nativeLabel: 'PT · Português (Portugal)',
    labelEs: 'Portugal',
    labelEn: 'Portugal',
    labelPt: 'Portugal',
    baseLang: 'pt'
  }
]);

export const PREVIA_MIX_TYPE_CONFIG = Object.freeze({
  clásico: {
    type: 'clásico',
    categoryKey: 'drink',
    labelEs: 'Clásico',
    labelEn: 'Classic',
    labelPt: 'Clássico',
    iconImg: CARD_CATEGORIES.drink.iconImg,
    color: CARD_CATEGORIES.drink.color,
    hex: CARD_CATEGORIES.drink.hex,
    cardGradient: CARD_CATEGORIES.drink.cardGradient,
    onCardColor: CARD_CATEGORIES.drink.onCardColor,
    isHot: false,
    isEvent: false
  },
  duelo: {
    type: 'duelo',
    categoryKey: 'versus',
    labelEs: 'Duelo',
    labelEn: 'Duel',
    labelPt: 'Duelo',
    iconImg: CARD_CATEGORIES.versus.iconImg,
    color: CARD_CATEGORIES.versus.color,
    hex: CARD_CATEGORIES.versus.hex,
    cardGradient: CARD_CATEGORIES.versus.cardGradient,
    onCardColor: CARD_CATEGORIES.versus.onCardColor,
    isHot: false,
    isEvent: false,
    isDuoSpotlight: true
  },
  'yo nunca': {
    type: 'yo nunca',
    categoryKey: 'never_have',
    labelEs: 'Yo nunca',
    labelEn: 'Never Have I',
    labelPt: 'Eu Nunca',
    iconImg: CARD_CATEGORIES.never_have.iconImg,
    color: CARD_CATEGORIES.never_have.color,
    hex: CARD_CATEGORIES.never_have.hex,
    cardGradient: CARD_CATEGORIES.never_have.cardGradient,
    onCardColor: CARD_CATEGORIES.never_have.onCardColor,
    isHot: false,
    isEvent: false
  },
  'quien es más probable': {
    type: 'quien es más probable',
    categoryKey: 'most_likely',
    labelEs: 'Más probable',
    labelEn: 'Most Likely',
    labelPt: 'Mais Provável',
    iconImg: CARD_CATEGORIES.most_likely.iconImg,
    color: CARD_CATEGORIES.most_likely.color,
    hex: CARD_CATEGORIES.most_likely.hex,
    cardGradient: CARD_CATEGORIES.most_likely.cardGradient,
    onCardColor: CARD_CATEGORIES.most_likely.onCardColor,
    isHot: false,
    isEvent: false
  },
  verdad: {
    type: 'verdad',
    categoryKey: 'truth',
    labelEs: 'Verdad',
    labelEn: 'Truth',
    labelPt: 'Verdade',
    iconImg: CARD_CATEGORIES.truth.iconImg,
    color: CARD_CATEGORIES.truth.color,
    hex: CARD_CATEGORIES.truth.hex,
    cardGradient: CARD_CATEGORIES.truth.cardGradient,
    onCardColor: CARD_CATEGORIES.truth.onCardColor,
    isHot: false,
    isEvent: false
  },
  reto: {
    type: 'reto',
    categoryKey: 'dare',
    labelEs: 'Reto',
    labelEn: 'Dare',
    labelPt: 'Desafio',
    iconImg: CARD_CATEGORIES.dare.iconImg,
    color: CARD_CATEGORIES.dare.color,
    hex: CARD_CATEGORIES.dare.hex,
    cardGradient: CARD_CATEGORIES.dare.cardGradient,
    onCardColor: CARD_CATEGORIES.dare.onCardColor,
    isHot: false,
    isEvent: false
  },
  'retos especiales': {
    type: 'retos especiales',
    categoryKey: 'special_dare',
    labelEs: '★ Retos especiales',
    labelEn: '★ Special Dares',
    labelPt: '★ Desafios especiais',
    iconImg: CARD_CATEGORIES.special_dare.iconImg,
    color: CARD_CATEGORIES.special_dare.color,
    hex: CARD_CATEGORIES.special_dare.hex,
    cardGradient: CARD_CATEGORIES.special_dare.cardGradient,
    onCardColor: CARD_CATEGORIES.special_dare.onCardColor,
    isHot: false,
    isEvent: false,
    isDuoSpotlight: true
  },
  'eventos especiales': {
    type: 'eventos especiales',
    categoryKey: 'event',
    labelEs: '★ Eventos grupales',
    labelEn: '★ Group Events',
    labelPt: '★ Eventos em grupo',
    iconImg: CARD_CATEGORIES.event.iconImg,
    color: CARD_CATEGORIES.event.color,
    hex: CARD_CATEGORIES.event.hex,
    cardGradient: CARD_CATEGORIES.event.cardGradient,
    onCardColor: CARD_CATEGORIES.event.onCardColor,
    isHot: false,
    isEvent: true
  },
  hot: {
    type: 'hot',
    categoryKey: 'hot',
    labelEs: 'Hot +18',
    labelEn: 'Hot +18',
    labelPt: 'Hot +18',
    iconImg: CARD_CATEGORIES.hot.iconImg,
    color: CARD_CATEGORIES.hot.color,
    hex: CARD_CATEGORIES.hot.hex,
    cardGradient: CARD_CATEGORIES.hot.cardGradient,
    onCardColor: CARD_CATEGORIES.hot.onCardColor,
    isHot: true,
    isEvent: false,
    isDuoSpotlight: true
  },
  bonus: {
    type: 'bonus',
    categoryKey: 'bonus',
    labelEs: 'Bonus 🎁',
    labelEn: 'Bonus 🎁',
    labelPt: 'Bônus 🎁',
    iconImg: CARD_CATEGORIES.bonus.iconImg,
    color: CARD_CATEGORIES.bonus.color,
    hex: CARD_CATEGORIES.bonus.hex,
    cardGradient: CARD_CATEGORIES.bonus.cardGradient,
    onCardColor: CARD_CATEGORIES.bonus.onCardColor,
    isHot: false,
    isEvent: false
  }
});

export const PREVIA_MIX_PACE_PRESETS = Object.freeze([
  { id: 'fast', targetTurns: 25, labelEs: 'Rápida · 25', labelEn: 'Fast · 25', labelPt: 'Rápida · 25' },
  { id: 'normal', targetTurns: 45, labelEs: 'Clásica · 45', labelEn: 'Normal · 45', labelPt: 'Clássica · 45' },
  { id: 'long', targetTurns: 70, labelEs: 'Larga · 70', labelEn: 'Long · 70', labelPt: 'Longa · 70' },
  { id: 'marathon', targetTurns: 100, labelEs: 'Maratón · 100', labelEn: 'Marathon · 100', labelPt: 'Maratona · 100' }
]);

export const PREVIA_MIX_DEFAULT_ENABLED_TYPES = Object.freeze([
  'clásico',
  'duelo',
  'yo nunca',
  'quien es más probable',
  'verdad',
  'reto',
  'retos especiales',
  'eventos especiales',
  'bonus'
]);

export function createDefaultPreviaMixConfig(appLang = 'es', localeOverride = null) {
  const fallbackLocale = appLang === 'en' ? 'en-US' : appLang === 'pt' ? 'pt-BR' : 'es-CO';
  return {
    locale: localeOverride || fallbackLocale,
    localeAutoSynced: true,
    enabledTypes: [...PREVIA_MIX_DEFAULT_ENABLED_TYPES],
    minIntensity: 1,
    startIntensity: 1,
    maxIntensity: 10,
    targetTurns: 45,
    eventChance: 0.13,
    drinkMode: 'auto', // 'auto' | 'optional' | 'sober'
    enableHot: false,
    adultsConfirmed: false,
    everyoneConsentsHot: false
  };
}

export const PREVIA_MIX_MODE_DEFINITION = Object.freeze({
  id: PREVIA_MIX_MODE_ID,
  version: '3.0',
  folder: 'src/modes/previa-mix',
  icon: '🎉',
  iconImg: UI_ICONS.deck,
  accent: DESIGN_TOKENS.shotPink,
  surfaceBg: 'linear-gradient(135deg, #FF4FA3 0%, #FF6B7B 54%, #FF8E53 100%)',
  borderColor: 'rgba(255, 210, 230, 0.56)',
  inkColor: 'var(--oms-text-on-vibrant)',
  playable: true,
  minPlayers: PREVIA_MIX_MIN_PLAYERS,
  maxPlayers: PREVIA_MIX_MAX_PLAYERS,
  badgeEs: 'Popular',
  badgeEn: 'Popular',
  badgePt: 'Popular',
  titleEs: 'Previa Mix',
  titleEn: 'Previa Mix',
  titlePt: 'Previa Mix',
  descEs: 'De todo un poco para comenzar la noche.',
  descEn: 'A little bit of everything to kick off the night.',
  descPt: 'Um pouco de tudo para começar a noite.',
  howToPlayEs: [
    'Un jugador actúa como líder o anfitrión: sostiene el dispositivo y lee cada carta o pregunta en voz alta para todo el grupo.',
    'En cada turno saldrán cartas al azar con uno, dos o más participantes en juego (¡o desafíos para todo el grupo!).',
    'Desliza a la derecha para aceptar y cumplir el reto, o a la izquierda para pasar cumpliendo la penitencia o trago de la carta.'
  ],
  howToPlayEn: [
    'One player acts as host: holding the device and reading each card and prompt out loud for the whole group.',
    'Each turn draws a random card featuring one, two, or more selected players (or challenges for the whole crew!).',
    'Swipe right to accept and complete the challenge, or swipe left to pass and pay the card’s forfeit or drink.'
  ],
  howToPlayPt: [
    'Um jogador atua como líder ou anfitrião: segura o celular e lê cada carta ou pergunta em voz alta para todo o grupo.',
    'A cada rodada saem cartas aleatórias com um, dois ou mais participantes em jogo (ou desafios para a galera toda!).',
    'Deslize para a direita para aceitar e cumprir o desafio, ou para a esquerda para passar pagando a prenda ou gole da carta.'
  ]
});

