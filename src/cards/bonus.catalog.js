/**
 * Oh My Shot! — Catálogo universal de Cartas Bonus y Modo Dados.
 * Carga modular por idioma desde src/cards/[locale]/bonus.[locale].js
 * 
 * Subtipos de cartas Bonus:
 * - bonus_single: 1 jugador (penitencia o trago individual)
 * - bonus_duo: 2 jugadores (penitencia o trago en combo)
 * - bonus_trio: 3 jugadores (trío dinamita)
 * - bonus_group: Todo el grupo (ronda general)
 * - bonus_exclude: Todo el grupo bebiendo excepto 1 o 2 jugadores salvados
 * - bonus_dice: Modo dados interactivo (bloquea el avance hasta tirar el dado de 1 a 6)
 */

import { bonusCards as bonusCardsEsCO } from './es-CO/bonus.es-CO.js';
import { bonusCards as bonusCardsEsMX } from './es-MX/bonus.es-MX.js';
import { bonusCards as bonusCardsEsES } from './es-ES/bonus.es-ES.js';
import { bonusCards as bonusCardsEnUS } from './en-US/bonus.en-US.js';
import { bonusCards as bonusCardsEnGB } from './en-GB/bonus.en-GB.js';
import { bonusCards as bonusCardsPtBR } from './pt-BR/bonus.pt-BR.js';
import { bonusCards as bonusCardsPtPT } from './pt-PT/bonus.pt-PT.js';

export const BONUS_SUBTYPES = Object.freeze({
  SINGLE: 'bonus_single',
  DUO: 'bonus_duo',
  TRIO: 'bonus_trio',
  GROUP: 'bonus_group',
  EXCLUDE: 'bonus_exclude',
  DICE: 'bonus_dice'
});

export const DICE_FACES = Object.freeze([
  './assets/icons/dice/dice_1.svg',
  './assets/icons/dice/dice_2.svg',
  './assets/icons/dice/dice_3.svg',
  './assets/icons/dice/dice_4.svg',
  './assets/icons/dice/dice_5.svg',
  './assets/icons/dice/dice_6.svg'
]);

export const BONUS_CARDS_BY_LOCALE = Object.freeze({
  'es-CO': bonusCardsEsCO,
  'es-MX': bonusCardsEsMX,
  'es-ES': bonusCardsEsES,
  'en-US': bonusCardsEnUS,
  'en-GB': bonusCardsEnGB,
  'pt-BR': bonusCardsPtBR,
  'pt-PT': bonusCardsPtPT
});

/**
 * Obtiene la lista de cartas bonus adaptadas al idioma regional indicado.
 */
export function getBonusCardsForLocale(locale = 'es-CO') {
  return BONUS_CARDS_BY_LOCALE[locale] || BONUS_CARDS_BY_LOCALE['es-CO'];
}

export default BONUS_CARDS_BY_LOCALE;
