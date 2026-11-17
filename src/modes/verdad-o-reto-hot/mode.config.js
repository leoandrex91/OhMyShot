import { UI_ICONS } from '../../config/themeTokens.js';

export const VERDAD_O_RETO_HOT_MODE_ID = 'verdad-o-reto-hot';

export const VERDAD_O_RETO_HOT_MODE_DEFINITION = Object.freeze({
  id: VERDAD_O_RETO_HOT_MODE_ID,
  version: '1.0',
  folder: 'src/modes/verdad-o-reto-hot',
  icon: '🌶️',
  iconImg: UI_ICONS.flame,
  accent: '#f43f5e',
  surfaceBg: 'linear-gradient(135deg, #4c0519 0%, #881337 45%, #e11d48 100%)',
  borderColor: 'rgba(244, 63, 94, 0.65)',
  inkColor: 'var(--oms-white)',
  playable: true,
  minPlayers: 2,
  maxPlayers: 24,
  badgeEs: 'Elección +18',
  badgeEn: 'Choice +18',
  badgePt: 'Escolha +18',
  titleEs: 'Verdad o Reto Hot +18',
  titleEn: 'Truth or Dare Hot +18',
  titlePt: 'Verdade ou Desafio Hot +18',
  descEs: 'Preguntas ardientes y desafíos sin filtro: elige confesar tus deseos más íntimos o cumplir penitencias picantes.',
  descEn: 'Spicy confessions and unfiltered dares: choose between revealing your deepest secrets or taking daring forfeits.',
  descPt: 'Confissões quentes e desafios sem limites: escolha entre revelar seus segredos íntimos ou cumprir prendas picantes.',
  howToPlayEs: [
    'En cada turno, el jugador protagonista debe elegir entre dos cartas: ¿Verdad Hot o Reto Hot?',
    'Deberá responder la pregunta con sinceridad o cumplir el reto; de lo contrario, recibirá una penitencia.',
    'Si un jugador elige demasiadas verdades seguidas, se bloqueará la opción y deberá cumplir un Reto Hot obligatorio.'
  ],
  howToPlayEn: [
    'On each turn, the current player must choose between two spicy cards: Truth Hot or Dare Hot?',
    'They must answer truthfully or complete the dare; otherwise, they will receive a penalty.',
    'If a player chooses Truth too many times in a row, the option is locked and they must take a mandatory Dare Hot.'
  ],
  howToPlayPt: [
    'Em cada rodada, o jogador da vez deve escolher entre duas cartas picantes: Verdade Hot ou Desafio Hot?',
    'Deverá responder com sinceridade ou cumprir o desafio; caso contrário, receberá uma penalidade.',
    'Se um jogador escolher Verdade muitas vezes seguidas, a opção será bloqueada e ele deverá cumprir um Desafio Hot obrigatório.'
  ]
});

export const DEFAULT_VERDAD_O_RETO_HOT_CONFIG = Object.freeze({
  turnOrder: 'secuencial', // 'secuencial' | 'aleatorio'
  maxConsecutiveTruths: 3, // 1..5, 0 = ilimitado
  bonusEnabled: true,
  customCardsEnabled: true,
  targetTurns: 45
});
