import {
  castigos_toma as defaultToma,
  castigos_notoma as defaultNotoma
} from './castigos.es-CO.js';

export const DEFAULT_CASTIGOS_TOMA = Object.freeze(defaultToma);
export const DEFAULT_CASTIGOS_NOTOMA = Object.freeze(defaultNotoma);

export const SUPPORTED_CARD_LOCALES = Object.freeze([
  'es-CO',
  'es-MX',
  'es-ES',
  'en-US',
  'en-GB',
  'pt-BR',
  'pt-PT'
]);

/**
 * Carga perezosa del catálogo completo de cartas para un idioma/región.
 * @param {string} locale
 * @returns {Promise<Array>}
 */
export async function loadCardsLocale(locale = 'es-CO') {
  let mod;
  switch (locale) {
    case 'en-US':
      mod = await import('./cards.en-US.js');
      break;
    case 'en-GB':
      mod = await import('./cards.en-GB.js');
      break;
    case 'es-CO':
      mod = await import('./cards.es-CO.js');
      break;
    case 'es-MX':
      mod = await import('./cards.es-MX.js');
      break;
    case 'es-ES':
      mod = await import('./cards.es-ES.js');
      break;
    case 'pt-BR':
      mod = await import('./cards.pt-BR.js');
      break;
    case 'pt-PT':
      mod = await import('./cards.pt-PT.js');
      break;
    default:
      mod = await import('./cards.es-CO.js');
      break;
  }

  const questions = mod.questions || mod.default || [];
  questions.castigos_toma = Array.isArray(mod.castigos_toma) && mod.castigos_toma.length
    ? mod.castigos_toma
    : DEFAULT_CASTIGOS_TOMA;
  questions.castigos_notoma = Array.isArray(mod.castigos_notoma) && mod.castigos_notoma.length
    ? mod.castigos_notoma
    : DEFAULT_CASTIGOS_NOTOMA;

  questions.verdadCards = Array.isArray(mod.verdadCards) && mod.verdadCards.length
    ? mod.verdadCards
    : questions.filter((c) => c.tipo === 'verdad');
  questions.retoCards = Array.isArray(mod.retoCards) && mod.retoCards.length
    ? mod.retoCards
    : questions.filter((c) => c.tipo === 'reto');
  questions.retosEspecialesCards = Array.isArray(mod.retosEspecialesCards) && mod.retosEspecialesCards.length
    ? mod.retosEspecialesCards
    : questions.filter((c) => c.tipo === 'retos especiales');
  questions.bonusCards = Array.isArray(mod.bonusCards) && mod.bonusCards.length
    ? mod.bonusCards
    : questions.filter((c) => c.tipo === 'bonus');
  questions.clasicoCards = Array.isArray(mod.clasicoCards) && mod.clasicoCards.length
    ? mod.clasicoCards
    : questions.filter((c) => c.tipo === 'clásico');
  questions.dueloCards = Array.isArray(mod.dueloCards) && mod.dueloCards.length
    ? mod.dueloCards
    : questions.filter((c) => c.tipo === 'duelo');
  questions.yoNuncaCards = Array.isArray(mod.yoNuncaCards) && mod.yoNuncaCards.length
    ? mod.yoNuncaCards
    : questions.filter((c) => c.tipo === 'yo nunca');
  questions.quienEsMasProbableCards = Array.isArray(mod.quienEsMasProbableCards) && mod.quienEsMasProbableCards.length
    ? mod.quienEsMasProbableCards
    : questions.filter((c) => c.tipo === 'quién es más probable');
  questions.eventosEspecialesCards = Array.isArray(mod.eventosEspecialesCards) && mod.eventosEspecialesCards.length
    ? mod.eventosEspecialesCards
    : questions.filter((c) => c.tipo === 'eventos especiales');
  questions.hotCards = Array.isArray(mod.hotCards) && mod.hotCards.length
    ? mod.hotCards
    : questions.filter((c) => c.tipo === 'hot');

  return questions;
}
