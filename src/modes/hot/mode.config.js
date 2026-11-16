import { UI_ICONS } from '../../config/themeTokens.js';

export const HOT_MODE_ID = 'hot';

export const HOT_MODE_DEFINITION = Object.freeze({
  id: HOT_MODE_ID,
  version: '1.0',
  folder: 'src/modes/hot',
  icon: '🔥',
  iconImg: UI_ICONS.flame,
  accent: '#ff0055',
  surfaceBg: 'linear-gradient(135deg, #881337 0%, #be123c 45%, #ff0055 100%)',
  borderColor: 'rgba(255, 79, 163, 0.56)',
  inkColor: 'var(--oms-text-on-vibrant)',
  playable: true,
  minPlayers: 2,
  maxPlayers: 24,
  badgeEs: 'Picante +18',
  badgeEn: 'Spicy +18',
  badgePt: 'Picante +18',
  titleEs: 'Modo Hot +18',
  titleEn: 'Hot Mode +18',
  titlePt: 'Modo Hot +18',
  descEs: 'Preguntas íntimas, confesiones atrevidas y tensión pura: solo cartas HOT para subir la temperatura.',
  descEn: 'Intimate questions, daring confessions, and pure tension: exclusively HOT cards to turn up the heat.',
  descPt: 'Perguntas íntimas, confissões ousadas e pura tensão: apenas cartas HOT para esquentar o clima.',
  howToPlayEs: [
    'El juego selecciona al azar a los participantes para responder o cumplir cada carta HOT.',
    'Si alguien se niega a responder o cumplir la prueba picante, debe tomar el castigo.',
    'Desliza a la derecha para avanzar a la siguiente carta y subir el nivel.'
  ],
  howToPlayEn: [
    'The game randomly selects participants to answer or fulfill each HOT card.',
    'If someone refuses to answer or complete the spicy prompt, they must drink the penalty.',
    'Swipe right to advance to the next card and turn up the heat.'
  ],
  howToPlayPt: [
    'O jogo escolhe aleatoriamente os participantes para responder ou cumprir cada carta HOT.',
    'Se alguém se recusar a responder ou cumprir o desafio picante, deve beber a penitência.',
    'Deslize para a direita para avançar para a próxima carta e esquentar o jogo.'
  ]
});
