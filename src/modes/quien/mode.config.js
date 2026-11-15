import { UI_ICONS } from '../../config/themeTokens.js';

export const QUIEN_MODE_ID = 'quien';

export const QUIEN_MODE_DEFINITION = Object.freeze({
  id: QUIEN_MODE_ID,
  version: '1.0',
  folder: 'src/modes/quien',
  icon: '👉',
  iconImg: UI_ICONS.question,
  accent: '#06b6d4',
  surfaceBg: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 52%, #10b981 100%)',
  borderColor: 'rgba(125, 211, 252, 0.56)',
  inkColor: 'var(--oms-text-on-vibrant)',
  playable: true,
  minPlayers: 2,
  maxPlayers: 24,
  badgeEs: 'Votación',
  badgeEn: 'Voting',
  badgePt: 'Votação',
  titleEs: 'Quién',
  titleEn: 'Most Likely',
  titlePt: 'Quem é Mais Provável',
  descEs: '¿Quién del grupo es más probable que...? ¡A la de 3 todos señalan!',
  descEn: 'Who in the group is most likely to...? On the count of 3, everybody points!',
  descPt: 'Quem da galera é mais provável que...? No 3 todo mundo aponta!',
  howToPlayEs: [
    'El anfitrión lee en voz alta la carta de "¿Quién es más probable...?".',
    'A la cuenta de tres, todos los jugadores señalan con el dedo a la persona elegida.',
    'La persona más señalada o votada debe beber o cumplir el castigo indicado.'
  ],
  howToPlayEn: [
    'The host reads each "Who is most likely to...?" card out loud.',
    'On the count of three, everyone points their finger at the chosen person.',
    'The player with the most votes or fingers pointing at them drinks or pays the penalty.'
  ],
  howToPlayPt: [
    'O anfitrião lê em voz alta a carta de "Quem é mais provável...?".',
    'Na contagem de três, todo mundo aponta o dedo para a persona escolhida.',
    'A pessoa mais apontada ou votada deve beber ou pagar a prenda indicada.'
  ]
});
