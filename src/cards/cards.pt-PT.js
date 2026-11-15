/**
 * Oh My Shot! — Catálogo universal de cartas (pt-PT)
 * Archivo agregador modular por tipo de carta.
 */

import { clasicoCards } from './pt-PT/clasico.pt-PT.js';
import { dueloCards } from './pt-PT/duelo.pt-PT.js';
import { yoNuncaCards } from './pt-PT/yo-nunca.pt-PT.js';
import { quienEsMasProbableCards } from './pt-PT/quien-es-mas-probable.pt-PT.js';
import { verdadCards } from './pt-PT/verdad.pt-PT.js';
import { retoCards } from './pt-PT/reto.pt-PT.js';
import { retosEspecialesCards } from './pt-PT/retos-especiales.pt-PT.js';
import { eventosEspecialesCards } from './pt-PT/eventos-especiales.pt-PT.js';
import { hotCards } from './pt-PT/hot.pt-PT.js';
import { bonusCards } from './pt-PT/bonus.pt-PT.js';

export const locale = "pt-PT";

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

export { castigos_toma, castigos_notoma } from './castigos.pt-PT.js';

export default questions;
