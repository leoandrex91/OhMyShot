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
  badgeEs: 'Ritmo & Memoria',
  badgeEn: 'Rhythm & Recall',
  badgePt: 'Ritmo & Memória',
  titleEs: 'Cultura Chupística',
  titleEn: 'Categories',
  titlePt: 'Cultura Chupística',
  descEs: 'El clásico de previa: responde por turnos sin repetir ni dudar al ritmo de las palmas.',
  descEn: 'The party classic: take turns naming items without repeating or hesitating.',
  descPt: 'O clássico do esquenta: responda em turnos sem repetir nem hesitar ao ritmo das palmas.',
  howToPlayEs: [
    'La carta propone un tema (ej. marcas, países o temas de fiesta). Quien empieza marca el ritmo.',
    'Cada jugador debe decir un elemento válido en sentido horario. Si alguien repite, tarda o se equivoca: ¡Alguien falló!',
    'Quien falle recibe un castigo y se le suma un punto negativo en el marcador de la noche.'
  ],
  howToPlayEn: [
    'The card gives a topic. The active player starts the rhythm.',
    'Each player in clockwise order must name a valid item without repeating or hesitating.',
    'Whoever fails takes a penalty and gets a strike on the night scoreboard.'
  ],
  howToPlayPt: [
    'A carta propõe um tema. Quem começa dita o ritmo da rodada.',
    'Cada jogador no sentido horário deve falar um item válido sem repetir nem travar.',
    'Quem errar cumpre a penitência e ganha um ponto no placar da noite.'
  ]
});

export const DEFAULT_CULTURA_CHUPISTICA_CONFIG = Object.freeze({
  timerMode: 'infinite', // 'infinite' | '5s' | '10s' | '15s' | 'custom'
  customTimerSeconds: 20,
  trackFails: true,
  maxIntensity: 10,
  targetTurns: 30
});
