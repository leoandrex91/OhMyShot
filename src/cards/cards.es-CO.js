/**
 * Oh My Shot! — Catálogo universal de cartas (es-CO)
 * Archivo agregador modular por tipo de carta.
 */

import { clasicoCards } from './es-CO/clasico.es-CO.js';
import { dueloCards } from './es-CO/duelo.es-CO.js';
import { yoNuncaCards } from './es-CO/yo-nunca.es-CO.js';
import { quienEsMasProbableCards } from './es-CO/quien-es-mas-probable.es-CO.js';
import { verdadCards } from './es-CO/verdad.es-CO.js';
import { retoCards } from './es-CO/reto.es-CO.js';
import { retosEspecialesCards } from './es-CO/retos-especiales.es-CO.js';
import { eventosEspecialesCards } from './es-CO/eventos-especiales.es-CO.js';
import { hotCards } from './es-CO/hot.es-CO.js';
import { bonusCards } from './es-CO/bonus.es-CO.js';

export const locale = "es-CO";

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

export { castigos_toma, castigos_notoma } from './castigos.es-CO.js';

export default questions;
