/**
 * Oh My Shot! — Catálogo universal de cartas (es-MX)
 * Archivo agregador modular por tipo de carta.
 */

import { clasicoCards } from './es-MX/clasico.es-MX.js';
import { dueloCards } from './es-MX/duelo.es-MX.js';
import { yoNuncaCards } from './es-MX/yo-nunca.es-MX.js';
import { quienEsMasProbableCards } from './es-MX/quien-es-mas-probable.es-MX.js';
import { verdadCards } from './es-MX/verdad.es-MX.js';
import { retoCards } from './es-MX/reto.es-MX.js';
import { retosEspecialesCards } from './es-MX/retos-especiales.es-MX.js';
import { eventosEspecialesCards } from './es-MX/eventos-especiales.es-MX.js';
import { hotCards } from './es-MX/hot.es-MX.js';
import { bonusCards } from './es-MX/bonus.es-MX.js';

export const locale = "es-MX";

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

export { castigos_toma, castigos_notoma } from './castigos.es-MX.js';

export default questions;
