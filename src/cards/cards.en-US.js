/**
 * Oh My Shot! — Catálogo universal de cartas (en-US)
 * Archivo agregador modular por tipo de carta.
 */

import { clasicoCards } from './en-US/clasico.en-US.js';
import { dueloCards } from './en-US/duelo.en-US.js';
import { yoNuncaCards } from './en-US/yo-nunca.en-US.js';
import { quienEsMasProbableCards } from './en-US/quien-es-mas-probable.en-US.js';
import { verdadCards } from './en-US/verdad.en-US.js';
import { retoCards } from './en-US/reto.en-US.js';
import { retosEspecialesCards } from './en-US/retos-especiales.en-US.js';
import { eventosEspecialesCards } from './en-US/eventos-especiales.en-US.js';
import { hotCards } from './en-US/hot.en-US.js';
import { bonusCards } from './en-US/bonus.en-US.js';

export const locale = "en-US";

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

export { castigos_toma, castigos_notoma } from './castigos.en-US.js';

export default questions;
