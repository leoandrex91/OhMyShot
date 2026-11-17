import {
  castigos_toma as defaultToma,
  castigos_notoma as defaultNotoma
} from './castigos.es.js';
import { getCastigosForLocale } from './castigos.catalog.js';

export const DEFAULT_CASTIGOS_TOMA = Object.freeze(defaultToma);
export const DEFAULT_CASTIGOS_NOTOMA = Object.freeze(defaultNotoma);

export const SUPPORTED_CARD_LOCALES = Object.freeze([
  'es',
  'en',
  'pt'
]);

function normalizeCardLocale(rawLocale = 'es') {
  const p = String(rawLocale || '').toLowerCase();
  if (p.startsWith('en')) return 'en';
  if (p.startsWith('pt')) return 'pt';
  return 'es';
}

/**
 * Carga perezosa del catálogo completo de cartas para un idioma ('es' | 'en' | 'pt').
 * @param {string} locale
 * @returns {Promise<Array>}
 */
export async function loadCardsLocale(locale = 'es') {
  const safeLang = normalizeCardLocale(locale);
  let mod;
  switch (safeLang) {
    case 'en':
      mod = await import('./cards.en.js');
      break;
    case 'pt':
      mod = await import('./cards.pt.js');
      break;
    case 'es':
    default:
      mod = await import('./cards.es.js');
      break;
  }

  const questions = mod.questions || mod.default || [];
  const fallbackCastigos = getCastigosForLocale(safeLang);
  questions.castigos_toma = Array.isArray(mod.castigos_toma) && mod.castigos_toma.length
    ? mod.castigos_toma
    : fallbackCastigos.castigos_toma;
  questions.castigos_notoma = Array.isArray(mod.castigos_notoma) && mod.castigos_notoma.length
    ? mod.castigos_notoma
    : fallbackCastigos.castigos_notoma;

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

/**
 * Carga perezosa del catálogo de cartas de Cultura Chupística para un idioma ('es' | 'en' | 'pt').
 * @param {string} locale
 * @returns {Promise<Array>}
 */
export async function loadCulturaChupisticaCards(locale = 'es') {
  const safeLang = normalizeCardLocale(locale);
  let mod;
  switch (safeLang) {
    case 'en':
      mod = await import('./en/cultura-chupistica.en.js');
      break;
    case 'pt':
      mod = await import('./pt/cultura-chupistica.pt.js');
      break;
    case 'es':
    default:
      mod = await import('./es/cultura-chupistica.es.js');
      break;
  }
  return mod.culturaChupisticaCards || mod.default || [];
}

/**
 * Carga perezosa del paquete completo de cartas HOT adicionales
 * (verdad_hot, reto_hot, yo_nunca_hot, quien_hot, cultura_hot).
 * @param {string} locale
 * @returns {Promise<{ verdadHot: Array, retoHot: Array, yoNuncaHot: Array, quienHot: Array, culturaHot: Array }>}
 */
export async function loadHotCardsLocale(locale = 'es') {
  const safeLang = normalizeCardLocale(locale);
  let verdadMod, retoMod, yoNuncaMod, quienMod, culturaMod;
  switch (safeLang) {
    case 'en':
      [verdadMod, retoMod, yoNuncaMod, quienMod, culturaMod] = await Promise.all([
        import('./en/verdad-hot.en.js'),
        import('./en/reto-hot.en.js'),
        import('./en/yo-nunca-hot.en.js'),
        import('./en/quien-hot.en.js'),
        import('./en/cultura-hot.en.js')
      ]);
      break;
    case 'pt':
      [verdadMod, retoMod, yoNuncaMod, quienMod, culturaMod] = await Promise.all([
        import('./pt/verdad-hot.pt.js'),
        import('./pt/reto-hot.pt.js'),
        import('./pt/yo-nunca-hot.pt.js'),
        import('./pt/quien-hot.pt.js'),
        import('./pt/cultura-hot.pt.js')
      ]);
      break;
    case 'es':
    default:
      [verdadMod, retoMod, yoNuncaMod, quienMod, culturaMod] = await Promise.all([
        import('./es/verdad-hot.es.js'),
        import('./es/reto-hot.es.js'),
        import('./es/yo-nunca-hot.es.js'),
        import('./es/quien-hot.es.js'),
        import('./es/cultura-hot.es.js')
      ]);
      break;
  }

  return {
    verdadHot: verdadMod.verdadHotCards || [],
    retoHot: retoMod.retoHotCards || [],
    yoNuncaHot: yoNuncaMod.yoNuncaHotCards || [],
    quienHot: quienMod.quienHotCards || [],
    culturaHot: culturaMod.culturaHotCards || []
  };
}

/**
 * Carga los temas de Cultura Chupística Hot para un idioma.
 * @param {string} locale
 * @returns {Promise<Array>}
 */
export async function loadCulturaHotCards(locale = 'es') {
  const bundle = await loadHotCardsLocale(locale);
  return bundle.culturaHot || [];
}
