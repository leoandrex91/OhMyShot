/**
 * Oh My Shot! — Catálogo universal de cartas (en)
 * Archivo agregador modular por tipo de carta.
 */

import { clasicoCards } from './en/clasico.en.js';
import { dueloCards } from './en/duelo.en.js';
import { yoNuncaCards } from './en/yo-nunca.en.js';
import { quienEsMasProbableCards } from './en/quien-es-mas-probable.en.js';
import { verdadCards } from './en/verdad.en.js';
import { retoCards } from './en/reto.en.js';
import { retosEspecialesCards } from './en/retos-especiales.en.js';
import { eventosEspecialesCards } from './en/eventos-especiales.en.js';
import { hotCards } from './en/hot.en.js';
import { bonusCards } from './en/bonus.en.js';

export const locale = "en";

export const questions = [
  ...clasicoCards,
  ...dueloCards,
  ...yoNuncaCards,
  ...quienEsMasProbableCards,
  ...verdadCards,
  ...retoCards,
  ...retosEspecialesCards,
  ...eventosEspecialesCards,
  ...hotCards
];

export {
  clasicoCards,
  dueloCards,
  yoNuncaCards,
  quienEsMasProbableCards,
  verdadCards,
  retoCards,
  retosEspecialesCards,
  eventosEspecialesCards,
  hotCards,
  bonusCards
};

export { castigos_toma, castigos_notoma } from './castigos.en.js';

export default questions;
