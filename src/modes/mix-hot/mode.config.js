import { UI_ICONS } from '../../config/themeTokens.js';

export const MIX_HOT_MODE_ID = 'mix-hot';

export const MIX_HOT_MODE_DEFINITION = Object.freeze({
  id: MIX_HOT_MODE_ID,
  version: '1.0',
  folder: 'src/modes/mix-hot',
  icon: '💥',
  iconImg: UI_ICONS.flame,
  accent: '#ec4899',
  surfaceBg: 'linear-gradient(135deg, #1f0223 0%, #581c87 35%, #9d174d 70%, #ec4899 100%)',
  borderColor: 'rgba(236, 72, 153, 0.7)',
  inkColor: 'var(--oms-text-on-vibrant)',
  playable: true,
  minPlayers: 2,
  maxPlayers: 24,
  badgeEs: 'Mix Especial +18',
  badgeEn: 'Special Mix +18',
  badgePt: 'Mix Especial +18',
  titleEs: 'Mix Hot +18',
  titleEn: 'Mix Hot +18',
  titlePt: 'Mix Hot +18',
  descEs: 'La experiencia definitiva sin censura: cóctel explosivo con cartas Hot, Verdad o Reto Hot, Yo Nunca Hot, Quién Hot y Cultura Hot.',
  descEn: 'The ultimate uncensored party mix: a wild cocktail of Hot, Truth or Dare Hot, Never Have I Ever Hot, Who\'s Most Likely Hot, and Spicy Trivia.',
  descPt: 'A experiência definitiva sem censura: um coquetel explosivo com cartas Hot, Verdade ou Desafio Hot, Eu Nunca Hot, Quem É Mais Provável Hot e Cultura Hot.',
  howToPlayEs: [
    'Desliza cada carta a la derecha para avanzar en la ronda.',
    'Se mezclan todos los tipos de cartas picantes: Hot clásico, Verdad o Reto Hot, Yo Nunca Hot, Quién Hot y Cultura Hot rápida.',
    'Si no cumples con la carta o te niegas a responder, debes cumplir la penitencia.'
  ],
  howToPlayEn: [
    'Swipe right on each card to advance the round.',
    'All spicy categories mixed together: Classic Hot, Truth or Dare Hot, Never Have I Ever Hot, Who\'s Most Likely Hot, and quick Spicy Trivia.',
    'If you refuse to answer or complete the card prompt, you must take the forfeit.'
  ],
  howToPlayPt: [
    'Deslize cada carta para a direita para avançar a rodada.',
    'Uma mistura de todas as categorias picantes: Hot clássico, Verdade ou Desafio Hot, Eu Nunca Hot, Quem É Mais Provável Hot e Cultura Hot rápida.',
    'Se não cumprir a carta ou se recusar a responder, deve pagar a penitência.'
  ]
});

export const DEFAULT_MIX_HOT_CONFIG = Object.freeze({
  minIntensity: 1,
  maxIntensity: 10,
  targetTurns: 45,
  bonusEnabled: true,
  customCardsEnabled: true
});
