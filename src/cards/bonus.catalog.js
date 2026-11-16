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

import { bonusCards as bonusCardsEs } from './es/bonus.es.js';
import { bonusCards as bonusCardsEn } from './en/bonus.en.js';
import { bonusCards as bonusCardsPt } from './pt/bonus.pt.js';

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
  es: bonusCardsEs,
  en: bonusCardsEn,
  pt: bonusCardsPt,
  // Compatibilidad hacia atrás
  'es-CO': bonusCardsEs,
  'es-MX': bonusCardsEs,
  'es-ES': bonusCardsEs,
  'en-US': bonusCardsEn,
  'en-GB': bonusCardsEn,
  'pt-BR': bonusCardsPt,
  'pt-PT': bonusCardsPt
});

/**
 * Obtiene la lista de cartas bonus adaptadas al idioma indicado ('es' | 'en' | 'pt').
 */
export function getBonusCardsForLocale(locale = 'es') {
  if (BONUS_CARDS_BY_LOCALE[locale]) {
    return BONUS_CARDS_BY_LOCALE[locale];
  }
  const prefix = String(locale || '').toLowerCase();
  if (prefix.startsWith('en')) return BONUS_CARDS_BY_LOCALE['en'];
  if (prefix.startsWith('pt')) return BONUS_CARDS_BY_LOCALE['pt'];
  return BONUS_CARDS_BY_LOCALE['es'];
}

export default BONUS_CARDS_BY_LOCALE;
