/**
 * Oh My Shot! — Catálogo universal de cartas (pt-BR)
 * Archivo agregador modular por tipo de carta.
 */

import { clasicoCards } from './pt-BR/clasico.pt-BR.js';
import { dueloCards } from './pt-BR/duelo.pt-BR.js';
import { yoNuncaCards } from './pt-BR/yo-nunca.pt-BR.js';
import { quienEsMasProbableCards } from './pt-BR/quien-es-mas-probable.pt-BR.js';
import { verdadCards } from './pt-BR/verdad.pt-BR.js';
import { retoCards } from './pt-BR/reto.pt-BR.js';
import { retosEspecialesCards } from './pt-BR/retos-especiales.pt-BR.js';
import { eventosEspecialesCards } from './pt-BR/eventos-especiales.pt-BR.js';
import { hotCards } from './pt-BR/hot.pt-BR.js';
import { bonusCards } from './pt-BR/bonus.pt-BR.js';

export const locale = "pt-BR";

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

export { castigos_toma, castigos_notoma } from './castigos.pt-BR.js';

export default questions;
