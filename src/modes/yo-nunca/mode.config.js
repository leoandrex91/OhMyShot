import { UI_ICONS } from '../../config/themeTokens.js';

export const YO_NUNCA_MODE_ID = 'yo-nunca';

export const YO_NUNCA_MODE_DEFINITION = Object.freeze({
  id: YO_NUNCA_MODE_ID,
  version: '1.0',
  folder: 'src/modes/yo-nunca',
  icon: '🤫',
  iconImg: UI_ICONS.confessions,
  accent: '#a855f7',
  surfaceBg: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 52%, #ec4899 100%)',
  borderColor: 'rgba(216, 180, 254, 0.56)',
  inkColor: 'var(--oms-text-on-vibrant)',
  playable: true,
  minPlayers: 2,
  maxPlayers: 24,
  badgeEs: 'Confesiones',
  badgeEn: 'Confessions',
  badgePt: 'Confissões',
  titleEs: 'Yo nunca',
  titleEn: 'Never Have I Ever',
  titlePt: 'Eu Nunca',
  descEs: 'Secretos, anécdotas y tragos: si lo has hecho alguna vez en tu vida, ¡te toca beber!',
  descEn: 'Secrets, stories, and drinks: if you’ve ever done it in your life, take a sip!',
  descPt: 'Segredos, histórias e goles: se você já fez isso alguma vez na vida, bebe!',
  howToPlayEs: [
    'El anfitrión o el grupo lee en voz alta cada afirmación de "Yo nunca".',
    'Todos los jugadores que alguna vez hayan hecho lo que dice la carta deben beber o cumplir el castigo.',
    'Desliza a la derecha para continuar descubriendo los secretos del grupo.'
  ],
  howToPlayEn: [
    'The host reads each "Never Have I Ever" statement out loud for the group.',
    'Anyone who has ever done what the card says must drink or pay the forfeit.',
    'Swipe right to continue uncovering the crew’s secrets.'
  ],
  howToPlayPt: [
    'O anfitrião lê em voz alta cada frase de "Eu Nunca" para todo o grupo.',
    'Todos os jogadores que já fizeram o que a carta diz devem beber ou cumprir o castigo.',
    'Deslize para a direita para continuar descobrindo os segredos da galera.'
  ]
});
