/**
 * Oh My Shot! — Catálogo universal de cartas (es)
 * Archivo agregador modular por tipo de carta.
 */

import { clasicoCards } from './es/clasico.es.js';
import { dueloCards } from './es/duelo.es.js';
import { yoNuncaCards } from './es/yo-nunca.es.js';
import { quienEsMasProbableCards } from './es/quien-es-mas-probable.es.js';
import { verdadCards } from './es/verdad.es.js';
import { retoCards } from './es/reto.es.js';
import { retosEspecialesCards } from './es/retos-especiales.es.js';
import { eventosEspecialesCards } from './es/eventos-especiales.es.js';
import { hotCards } from './es/hot.es.js';
import { bonusCards } from './es/bonus.es.js';

export const locale = "es";

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

export { castigos_toma, castigos_notoma } from './castigos.es.js';

export default questions;
