import { UI_ICONS } from '../../config/themeTokens.js';

export const CULTURA_CHUPISTICA_HOT_MODE_ID = 'cultura-chupistica-hot';

export const CULTURA_CHUPISTICA_HOT_MODE_DEFINITION = Object.freeze({
  id: CULTURA_CHUPISTICA_HOT_MODE_ID,
  version: '1.0',
  folder: 'src/modes/cultura-chupistica-hot',
  icon: '🔥',
  iconImg: UI_ICONS.flame,
  accent: '#ef4444',
  surfaceBg: 'linear-gradient(135deg, #3b0764 0%, #701a75 35%, #be123c 70%, #ef4444 100%)',
  borderColor: 'rgba(239, 68, 68, 0.65)',
  inkColor: 'var(--oms-white)',
  playable: true,
  minPlayers: 2,
  maxPlayers: 24,
  badgeEs: 'Cultura +18',
  badgeEn: 'Trivia +18',
  badgePt: 'Cultura +18',
  titleEs: 'Cultura Chupística Hot +18',
  titleEn: 'Spicy Trivia Hot +18',
  titlePt: 'Cultura Etílica Hot +18',
  descEs: 'Cultura Chupística al rojo vivo: temas picantes, fetiches, posiciones y secretos íntimos. ¡El que repita o se trabe, toma!',
  descEn: 'Red-hot party trivia: spicy topics, intimate fantasies, and wild confessions. Repeat or hesitate and drink!',
  descPt: 'Cultura alcoólica picante: temas íntimos, fetiches e segredos ousados. Quem repetir ou travar, bebe!',
  howToPlayEs: [
    'El jugador inicial canta el ritual en voz alta con el tema picante revelado.',
    'Cada jugador en la ronda debe decir un ejemplo nuevo del tema íntimo antes de que acabe el tiempo.',
    'Quien repita un ejemplo, se demore, o no sepa qué decir, pierde la ronda y debe pagar la penitencia.',
    'Toca "Alguien falló" para seleccionar al perdedor y asignarle su castigo dinámico.'
  ],
  howToPlayEn: [
    'The starting player recites the ritual out loud with the revealed spicy topic.',
    'Each player in turn must name a new example of the intimate topic before time runs out.',
    'Whoever repeats an answer, hesitates too long, or draws a blank loses the round and drinks.',
    'Tap "Someone Failed" to select who lost and assign their dynamic forfeit.'
  ],
  howToPlayPt: [
    'O jogador inicial recita o ritual em voz alta com o tema picante revelado.',
    'Cada jogador na rodada deve dizer um novo exemplo do tema íntimo antes do tempo acabar.',
    'Quem repetir, demorar ou não souber o que falar perde a rodada e bebe a penalidade.',
    'Toque em "Alguém errou" para registrar o perdedor e aplicar o castigo dinâmico.'
  ]
});

export const DEFAULT_CULTURA_HOT_CONFIG = Object.freeze({
  timerMode: 'infinite', // 'infinite' | 5 | 10 | 15 | 'custom'
  customTimerSeconds: 20,
  trackFails: true,
  customCardsEnabled: true,
  targetTurns: 30
});
