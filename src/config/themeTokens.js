/**
 * Tokens visuales e iconografía compartida del Design Kit v1.0 de Oh My Shot!
 * Archivo libre de lógica de modos para evitar dependencias circulares entre
 * `src/config/constants.js` y las carpetas independientes en `src/modes/*`.
 */

export const APP_VERSION = '0.6.0';

export const PROJECT_META = Object.freeze({
  name: 'Oh My Shot!',
  version: '0.6.0',
  creator: 'leoandre91',
  githubUser: 'leoandrex91',
  githubUrl: 'https://github.com/leoandrex91',
  supportCoffeeUrl: ''
});

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 32;

export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const ROOM_CODE_LENGTH = 4;

/**
 * Fuente centralizada de colores oficiales en JS (espejo de tokens.css / design-tokens.json).
 */
export const DESIGN_TOKENS = Object.freeze({
  midnight: '#100B22',
  darkGrape: '#201536',
  surfaceElevated: '#302148',
  shotPink: '#FF4FA3',
  partyCoral: '#FF6D5A',
  electricYellow: '#FFD166',
  mintPop: '#47E9D2',
  softWhite: '#F9F7FF',
  lavenderGray: '#B9AECF',
  border: '#49365F',
  deepTeal: '#168F83',
  duelCoral: '#EF6A56',
  chaosPurple: '#754AC1',
  fireRed: '#FF2438',
  fireOrange: '#FF6E1A',
  fireAmber: '#FFB020',
  white: '#FFFFFF'
});

export const UI_ICONS_V2 = Object.freeze({
  closeX: './assets/icons/ui/icon2_01.webp',
  checkMint: './assets/icons/ui/icon2_02.webp',
  arrowLeft: './assets/icons/ui/icon2_03.webp',
  arrowUp: './assets/icons/ui/icon2_04.webp',
  arrowDown: './assets/icons/ui/icon2_05.webp',
  arrowRight: './assets/icons/ui/icon2_06.webp',
  menuBars: './assets/icons/ui/icon2_07.webp',
  plus: './assets/icons/ui/icon2_08.webp',
  minus: './assets/icons/ui/icon2_09.webp',
  refresh: './assets/icons/ui/icon2_10.webp',
  undo: './assets/icons/ui/icon2_11.webp',
  redo: './assets/icons/ui/icon2_12.webp',
  search: './assets/icons/ui/icon2_13.webp',
  filter: './assets/icons/ui/icon2_14.webp',
  pencil: './assets/icons/ui/icon2_15.webp',
  saveDisk: './assets/icons/ui/icon2_16.webp',
  share: './assets/icons/ui/icon2_17.webp',
  info: './assets/icons/ui/icon2_18.webp',
  helpBubble: './assets/icons/ui/icon2_19.webp',
  warning: './assets/icons/ui/icon2_20.webp',
  lockClosed: './assets/icons/ui/icon2_21.webp',
  lockOpen: './assets/icons/ui/icon2_22.webp',
  eyeOpen: './assets/icons/ui/icon2_23.webp',
  eyeClosed: './assets/icons/ui/icon2_24.webp',
  soundOn: './assets/icons/ui/icon2_25.webp',
  soundOff: './assets/icons/ui/icon2_26.webp',
  home: './assets/icons/ui/icon2_27.webp',
  settings: './assets/icons/ui/icon2_28.webp',
  chatDots: './assets/icons/ui/icon2_29.webp',
  trophy: './assets/icons/ui/icon2_30.webp',
  star: './assets/icons/ui/icon2_31.webp',
  heart: './assets/icons/ui/icon2_32.webp',
  trash: './assets/icons/ui/icon2_33.webp',
  pause: './assets/icons/ui/icon2_34.webp',
  playCyan: './assets/icons/ui/icon2_35.webp',
  fastForward: './assets/icons/ui/icon2_36.webp',
  rewind: './assets/icons/ui/icon2_37.webp',
  vs: './assets/icons/ui/icon2_38.webp'
});

export const UI_ICONS = Object.freeze({
  playYellow: './assets/icons/ui/icon_01.webp',
  home: './assets/icons/ui/icon2_27.webp',
  settings: './assets/icons/ui/icon2_28.webp',
  playersGroup: './assets/icons/ui/icon_04.webp',
  addPlayer: './assets/icons/ui/icon_05.webp',
  avatarBoy: './assets/icons/ui/icon_06.webp',
  deck: './assets/icons/ui/icon_07.webp',
  card: './assets/icons/ui/icon_08.webp',
  question: './assets/icons/ui/icon2_19.webp',
  confessions: './assets/icons/ui/icon_10.webp',
  duel: './assets/icons/ui/icon_11.webp',
  vs: './assets/icons/ui/icon2_38.webp',
  burst: './assets/icons/ui/icon_12.webp',
  shotFull: './assets/icons/ui/icon_13.webp',
  shotBanned: './assets/icons/ui/icon_14.webp',
  martini: './assets/icons/ui/icon_15.webp',
  dice: './assets/icons/ui/icon_16.webp',
  shuffle: './assets/icons/ui/icon_17.webp',
  crown: './assets/icons/ui/icon_18.webp',
  trophy: './assets/icons/ui/icon2_30.webp',
  star: './assets/icons/ui/icon2_31.webp',
  music: './assets/icons/ui/icon_21.webp',
  soundOn: './assets/icons/ui/icon2_25.webp',
  soundOff: './assets/icons/ui/icon2_26.webp',
  phone: './assets/icons/ui/icon_24.webp',
  pause: './assets/icons/ui/icon2_34.webp',
  playCyan: './assets/icons/ui/icon2_35.webp',
  skip: './assets/icons/ui/icon2_36.webp',
  timer: './assets/icons/ui/icon_28.webp',
  flame: './assets/icons/ui/icon_29.webp',
  hearts: './assets/icons/ui/icon_30.webp',
  laugh: './assets/icons/ui/icon_31.webp',
  sparkles: './assets/icons/ui/icon_32.webp',
  info: './assets/icons/ui/icon2_18.webp',
  gift: './assets/icons/ui/icon_34.webp',
  lock: './assets/icons/ui/icon2_21.webp',
  trash: './assets/icons/ui/icon2_33.webp',
  closeX: './assets/icons/ui/icon2_01.webp',
  checkMint: './assets/icons/ui/icon2_02.webp',
  arrowLeft: './assets/icons/ui/icon2_03.webp',
  arrowRight: './assets/icons/ui/icon2_06.webp',
  plus: './assets/icons/ui/icon2_08.webp',
  saveDisk: './assets/icons/ui/icon2_16.webp',
  warning: './assets/icons/ui/icon2_20.webp'
});

export const CARD_CATEGORIES = Object.freeze({
  drink: {
    labelEs: 'CLÁSICO',
    labelEn: 'CLASSIC',
    emoji: '🎉',
    iconImg: UI_ICONS.deck,
    color: DESIGN_TOKENS.shotPink,
    hex: 0xff4fa3,
    cardGradient: 'linear-gradient(142deg, #FF4FA3 0%, #FF6284 48%, #FF7B59 100%)',
    onCardColor: 'var(--oms-text-on-vibrant)'
  },
  never_have: {
    labelEs: 'YO NUNCA',
    labelEn: 'NEVER HAVE I',
    emoji: '💬',
    iconImg: UI_ICONS.confessions,
    color: DESIGN_TOKENS.deepTeal,
    hex: 0x168f83,
    cardGradient: 'linear-gradient(142deg, #3BEAD0 0%, #1DC5AE 48%, #149688 100%)',
    onCardColor: 'var(--oms-text-on-vibrant)'
  },
  truth: {
    labelEs: 'VERDAD',
    labelEn: 'TRUTH',
    emoji: '🎤',
    iconImg: UI_ICONS.question,
    color: DESIGN_TOKENS.mintPop,
    hex: 0x47e9d2,
    cardGradient: 'linear-gradient(142deg, #52F2DA 0%, #44B8FF 52%, #6D82FF 100%)',
    onCardColor: 'var(--oms-text-on-vibrant)'
  },
  dare: {
    labelEs: 'RETO',
    labelEn: 'DARE',
    emoji: '🔥',
    iconImg: UI_ICONS.burst,
    color: DESIGN_TOKENS.chaosPurple,
    hex: 0x754ac1,
    cardGradient: 'linear-gradient(142deg, #8B5CF6 0%, #754AC1 50%, #9D3493 100%)',
    onCardColor: 'var(--oms-white)'
  },
  special_dare: {
    labelEs: 'RETO ESPECIAL',
    labelEn: 'SPECIAL DARE',
    emoji: '★',
    iconImg: UI_ICONS.star,
    color: DESIGN_TOKENS.chaosPurple,
    hex: 0x754ac1,
    cardGradient: 'linear-gradient(138deg, #4F2396 0%, #7D3CE8 46%, #C82D86 100%)',
    onCardColor: 'var(--oms-white)'
  },
  most_likely: {
    labelEs: 'MÁS PROBABLE',
    labelEn: 'MOST LIKELY',
    emoji: '👀',
    iconImg: UI_ICONS.question,
    color: DESIGN_TOKENS.electricYellow,
    hex: 0xffd166,
    cardGradient: 'linear-gradient(142deg, #FFE47A 0%, #FFD166 48%, #FF9F4A 100%)',
    onCardColor: 'var(--oms-text-on-vibrant)'
  },
  event: {
    labelEs: 'EVENTO',
    labelEn: 'EVENT',
    emoji: '✦',
    iconImg: UI_ICONS.sparkles,
    color: DESIGN_TOKENS.electricYellow,
    hex: 0xffd166,
    cardGradient: 'linear-gradient(138deg, #FFE878 0%, #FFAD42 52%, #FF6A95 100%)',
    onCardColor: 'var(--oms-text-on-vibrant)'
  },
  versus: {
    labelEs: 'DUELO',
    labelEn: 'DUEL',
    emoji: '⚡',
    iconImg: UI_ICONS.duel,
    color: DESIGN_TOKENS.duelCoral,
    hex: 0xef6a56,
    cardGradient: 'linear-gradient(142deg, #FF5E6C 0%, #EF6A56 50%, #FF9C52 100%)',
    onCardColor: 'var(--oms-text-on-vibrant)'
  },
  hot: {
    labelEs: 'HOT 🔥',
    labelEn: 'HOT 🔥',
    emoji: '🔥',
    iconImg: UI_ICONS.flame,
    color: DESIGN_TOKENS.fireOrange,
    hex: 0xff4518,
    cardGradient: 'linear-gradient(142deg, #2E0514 0%, #990D2E 48%, #D12B17 100%)',
    onCardColor: 'var(--oms-white)'
  },
  bonus: {
    labelEs: 'BONUS 🎁',
    labelEn: 'BONUS 🎁',
    labelPt: 'BÔNUS 🎁',
    emoji: '🎁',
    iconImg: UI_ICONS.gift,
    color: '#FFD700',
    hex: 0xffd700,
    cardGradient: 'linear-gradient(138deg, #FFE066 0%, #F59E0B 45%, #D97706 100%)',
    onCardColor: 'var(--oms-text-on-vibrant)'
  }
});

/**
 * Temas y movimientos especiales del fondo FX y carta (exclusivos dentro de partidas).
 */
export const SPECIAL_CARD_FX = Object.freeze({
  hot: {
    mode: 'hot',
    accent: DESIGN_TOKENS.fireOrange,
    secondaryAccent: DESIGN_TOKENS.fireRed,
    hex: 0xff4518,
    confettiPreset: 'hot',
    badgeEs: 'CARTA HOT 🔥',
    badgeEn: 'HOT CARD 🔥'
  },
  event: {
    mode: 'event',
    accent: DESIGN_TOKENS.electricYellow,
    secondaryAccent: DESIGN_TOKENS.mintPop,
    hex: 0xffd166,
    confettiPreset: 'event',
    badgeEs: 'EVENTO GRUPAL ✦',
    badgeEn: 'GROUP EVENT ✦'
  },
  duel: {
    mode: 'duel',
    accent: DESIGN_TOKENS.duelCoral,
    secondaryAccent: DESIGN_TOKENS.mintPop,
    hex: 0xef6a56,
    confettiPreset: 'duel',
    badgeEs: 'DUELO EN VIVO ⚡',
    badgeEn: 'LIVE DUEL ⚡'
  },
  intense: {
    mode: 'intense',
    accent: DESIGN_TOKENS.chaosPurple,
    secondaryAccent: DESIGN_TOKENS.shotPink,
    hex: 0x754ac1,
    confettiPreset: 'intense',
    badgeEs: 'CARTA ESPECIAL ★',
    badgeEn: 'SPECIAL CARD ★'
  },
  bonus: {
    mode: 'bonus',
    accent: '#FFD700',
    secondaryAccent: '#F59E0B',
    hex: 0xffd700,
    confettiPreset: 'event',
    badgeEs: 'RONDA BONUS 🎁',
    badgeEn: 'BONUS ROUND 🎁',
    badgePt: 'RODADA BÔNUS 🎁'
  }
});

/**
 * Resuelve el modo visual de fondo/carta sin activar llamas HOT en cartas normales de nivel alto (escala 1..10).
 */
export function resolveCardFxMode(card) {
  if (!card) return 'ambient';
  if (card.tipo === 'bonus' || card.category === 'bonus' || card.isBonus) return 'bonus';
  if (card.tipo === 'hot' || card.category === 'hot') return 'hot';
  if (card.tipo === 'eventos especiales' || card.category === 'event') return 'event';
  if (card.tipo === 'duelo' || card.category === 'versus') return 'duel';
  if (
    card.tipo === 'retos especiales' ||
    card.category === 'special_dare' ||
    card.especial === true ||
    (card.tipo === 'reto' && (card.intensidad || 0) >= 8)
  ) {
    return 'intense';
  }
  return 'ambient';
}

export const SHOT_ICONS = Object.freeze({
  on: './assets/icons/ui/shot_on.webp',
  off: './assets/icons/ui/shot_off.webp'
});

export const COUNTDOWN_MEDIA = Object.freeze({
  3: './assets/imgs/3.webp',
  2: './assets/imgs/2.webp',
  1: './assets/imgs/1.webp',
  go: './assets/imgs/go.webp'
});

export const SWIPE_FEEDBACK_MEDIA = Object.freeze({
  god: './assets/imgs/god.webp',
  bad: './assets/imgs/bad.webp'
});

export const AUDIO_ASSETS = Object.freeze({
  pop: './assets/audio/pop.m4a',
  swoosh: './assets/audio/swoosh.m4a',
  count: './assets/audio/count.m4a',
  go: './assets/audio/go.m4a',
  god: './assets/audio/god.m4a',
  bad: './assets/audio/bad.m4a',
  musicBg: './assets/audio/music_bg.m4a',
  musicHotBg: './assets/audio/music_hot_bg.m4a'
});

export const PLAYER_AVATARS = Object.freeze(
  Array.from(
    { length: 36 },
    (_, idx) => `./assets/imgs/avatars/avatar_${String(idx + 1).padStart(2, '0')}.webp`
  )
);

export const PLAYER_COLORS = [
  DESIGN_TOKENS.electricYellow,
  DESIGN_TOKENS.mintPop,
  DESIGN_TOKENS.shotPink,
  DESIGN_TOKENS.partyCoral,
  DESIGN_TOKENS.chaosPurple,
  DESIGN_TOKENS.deepTeal,
  DESIGN_TOKENS.duelCoral,
  DESIGN_TOKENS.electricYellow
];

