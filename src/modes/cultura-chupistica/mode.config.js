import { UI_ICONS } from '../../config/themeTokens.js';

export const CULTURA_CHUPISTICA_MODE_ID = 'cultura-chupistica';

export const CULTURA_CHUPISTICA_MODE_DEFINITION = Object.freeze({
  id: CULTURA_CHUPISTICA_MODE_ID,
  version: '1.0',
  folder: 'src/modes/cultura-chupistica',
  icon: '🍺',
  iconImg: UI_ICONS.shotFull,
  accent: '#f59e0b',
  surfaceBg: 'linear-gradient(135deg, #1f1105 0%, #3d2008 45%, #5a1a06 100%)',
  borderColor: 'rgba(245, 158, 11, 0.55)',
  inkColor: 'var(--oms-white)',
  playable: true,
  minPlayers: 2,
  maxPlayers: 24,
  badgeEs: 'Memoria',
  badgeEn: 'Memory',
  badgePt: 'Memória',
  titleEs: 'Cultura Chupística',
  titleEn: 'Drinking Trivia',
  titlePt: 'Cultura Etílica',
  descEs: 'Un clásico, responde por turnos sin repetir ni dudar.',
  descEn: 'A classic! Take turns answering without repeating or hesitating.',
  descPt: 'Um clássico! Respondam por turnos, sem repetir nem hesitar.',
  howToPlayEs: [
    'La carta propone un tema (por ejemplo, marcas, países o temas de fiesta). Empieza quien indique el juego.',
    'Cada jugador debe decir un elemento válido en sentido horario. Si alguien repite, tarda o se equivoca: ¡Alguien falló!',
    'Quien falle recibe un castigo y se le suma un punto negativo en el marcador de la noche.'
  ],
  howToPlayEn: [
    'The card suggests a topic (e.g., brands, countries, or party themes). Whoever the game indicates goes first.',
    'Each player must name a valid item in clockwise order. If someone repeats, takes too long, or makes a mistake: Someone failed!',
    'Whoever fails receives a penalty and gets one negative point added to the night´s scoreboard.'
  ],
  howToPlayPt: [
    'A carta propõe um tema (por exemplo, marcas, países ou temas de festa). Começa quem o jogo indicar.',
    'Cada jogador deve dizer um item válido no sentido horário. Se alguém repetir, demorar ou errar: Alguém falhou!',
    'Quem falhar recebe uma penalidade e ganha um ponto negativo no placar da noite.'
  ]
});

export const DEFAULT_CULTURA_CHUPISTICA_CONFIG = Object.freeze({
  timerMode: 'infinite', // 'infinite' | '5s' | '10s' | '15s' | 'custom'
  customTimerSeconds: 20,
  trackFails: true,
  maxIntensity: 10,
  targetTurns: 30
});
