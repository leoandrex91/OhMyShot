/**
 * Oh My Shot! — Catálogo universal de cartas (en-GB)
 * Archivo agregador modular por tipo de carta.
 */

import { clasicoCards } from './en-GB/clasico.en-GB.js';
import { dueloCards } from './en-GB/duelo.en-GB.js';
import { yoNuncaCards } from './en-GB/yo-nunca.en-GB.js';
import { quienEsMasProbableCards } from './en-GB/quien-es-mas-probable.en-GB.js';
import { verdadCards } from './en-GB/verdad.en-GB.js';
import { retoCards } from './en-GB/reto.en-GB.js';
import { retosEspecialesCards } from './en-GB/retos-especiales.en-GB.js';
import { eventosEspecialesCards } from './en-GB/eventos-especiales.en-GB.js';
import { hotCards } from './en-GB/hot.en-GB.js';
import { bonusCards } from './en-GB/bonus.en-GB.js';

export const locale = "en-GB";

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

export { castigos_toma, castigos_notoma } from './castigos.en-GB.js';

export default questions;
