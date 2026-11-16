/**
 * Oh My Shot! — Catálogo universal de cartas (pt)
 * Archivo agregador modular por tipo de carta.
 */

import { clasicoCards } from './pt/clasico.pt.js';
import { dueloCards } from './pt/duelo.pt.js';
import { yoNuncaCards } from './pt/yo-nunca.pt.js';
import { quienEsMasProbableCards } from './pt/quien-es-mas-probable.pt.js';
import { verdadCards } from './pt/verdad.pt.js';
import { retoCards } from './pt/reto.pt.js';
import { retosEspecialesCards } from './pt/retos-especiales.pt.js';
import { eventosEspecialesCards } from './pt/eventos-especiales.pt.js';
import { hotCards } from './pt/hot.pt.js';
import { bonusCards } from './pt/bonus.pt.js';

export const locale = "pt";

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

export { castigos_toma, castigos_notoma } from './castigos.pt.js';

export default questions;
