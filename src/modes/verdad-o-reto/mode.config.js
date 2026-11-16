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
  descEs: 'Elige confesar tus mayores secretos o cumplir retos épicos.',
  descEn: 'Choose to reveal your biggest secrets or take on epic challenges.',
  descPt: 'Escolha revelar seus maiores segredos ou cumprir desafios épicos.',
  howToPlayEs: [
    'En cada turno, el jugador protagonista debe elegir entre dos cartas: ¿Verdad o Reto?',
    'Deberá responder la pregunta con la verdad o cumplir el reto; de lo contrario, recibirá una penitencia.',
    'Si un jugador elige demasiadas verdades seguidas, se bloqueará la opción y deberá cumplir un Reto obligatorio.',
  ],
  howToPlayEn: [
    'On each turn, the current player must choose between two cards: Truth or Dare?',
    'They must answer the question truthfully or complete the dare; otherwise, they will receive a penalty.',
    'If a player chooses Truth too many times in a row, the option will be locked, and they must complete a mandatory Dare.',
  ],
  howToPlayPt: [
    'Em cada rodada, o jogador da vez deve escolher entre duas cartas: Verdade ou Desafio?',
    'Deverá responder à pergunta com sinceridade ou cumprir o desafio; caso contrário, receberá uma penalidade.',
    'Se um jogador escolher Verdade muitas vezes seguidas, a opção será bloqueada e ele deverá cumprir um Desafio obrigatório.',
  ]
});

export const DEFAULT_VERDAD_O_RETO_CONFIG = Object.freeze({
  turnOrder: 'secuencial', // 'secuencial' | 'aleatorio'
  maxConsecutiveTruths: 3, // 1..5, 0 = ilimitado
  bonusEnabled: true,
  customCardsEnabled: true,
  targetTurns: 45
});
