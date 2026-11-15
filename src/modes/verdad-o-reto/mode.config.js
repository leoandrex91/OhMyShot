import { UI_ICONS } from '../../config/themeTokens.js';

export const VERDAD_O_RETO_MODE_ID = 'verdad-o-reto';

export const VERDAD_O_RETO_MODE_DEFINITION = Object.freeze({
  id: VERDAD_O_RETO_MODE_ID,
  version: '1.0',
  folder: 'src/modes/verdad-o-reto',
  icon: '⚖️',
  iconImg: UI_ICONS.duel,
  accent: '#a855f7',
  surfaceBg: 'linear-gradient(135deg, #09122c 0%, #1c0e3a 45%, #3d0c3e 100%)',
  borderColor: 'rgba(216, 70, 239, 0.55)',
  inkColor: 'var(--oms-white)',
  playable: true,
  minPlayers: 2,
  maxPlayers: 24,
  badgeEs: 'Elección',
  badgeEn: 'Choice',
  badgePt: 'Escolha',
  titleEs: 'Verdad o Reto',
  titleEn: 'Truth or Dare',
  titlePt: 'Verdade ou Desafio',
  descEs: 'El juego clásico de previa: elige confesar tus mayores secretos o cumplir retos épicos.',
  descEn: 'The party classic: choose to confess your deepest secrets or face epic dares.',
  descPt: 'O clássico do esquenta: escolha confessar seus maiores segredos ou encarar desafios épicos.',
  howToPlayEs: [
    'En cada turno, el jugador protagonista debe elegir entre dos cartas: ¿Verdad o Reto?',
    'Si un jugador elige demasiadas verdades seguidas, se bloqueará la opción y deberá cumplir un Reto obligatorio.',
    'De vez en cuando aparecerán cartas Bonus sorpresa directas para toda la mesa.'
  ],
  howToPlayEn: [
    'On each turn, the active player must choose between two cards: Truth or Dare?',
    'If a player picks too many truths in a row, the option is locked and they must face a Dare.',
    'Surprise Bonus rounds will appear directly from time to time for the whole table.'
  ],
  howToPlayPt: [
    'Em cada rodada, o jogador da vez deve escolher entre duas cartas: Verdade ou Desafio?',
    'Se um jogador escolher muitas verdades seguidas, a opção será bloqueada e ele deverá cumprir um Desafio obrigatório.',
    'De tempos em tempos surgirão rodadas Bônus surpresa diretas para toda a galera.'
  ]
});

export const DEFAULT_VERDAD_O_RETO_CONFIG = Object.freeze({
  turnOrder: 'secuencial', // 'secuencial' | 'aleatorio'
  maxConsecutiveTruths: 3, // 1..5, 0 = ilimitado
  bonusEnabled: true,
  customCardsEnabled: true,
  targetTurns: 45
});
