/**
 * Oh My Shot! — Catálogo universal de cartas (es-ES)
 * Archivo agregador modular por tipo de carta.
 */

import { clasicoCards } from './es-ES/clasico.es-ES.js';
import { dueloCards } from './es-ES/duelo.es-ES.js';
import { yoNuncaCards } from './es-ES/yo-nunca.es-ES.js';
import { quienEsMasProbableCards } from './es-ES/quien-es-mas-probable.es-ES.js';
import { verdadCards } from './es-ES/verdad.es-ES.js';
import { retoCards } from './es-ES/reto.es-ES.js';
import { retosEspecialesCards } from './es-ES/retos-especiales.es-ES.js';
import { eventosEspecialesCards } from './es-ES/eventos-especiales.es-ES.js';
import { hotCards } from './es-ES/hot.es-ES.js';
import { bonusCards } from './es-ES/bonus.es-ES.js';

export const locale = "es-ES";

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

export { castigos_toma, castigos_notoma } from './castigos.es-ES.js';

export default questions;
