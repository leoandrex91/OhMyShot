/**
 * Oh My Shot! — Catálogo universal de Castigos y Penitencias por idioma
 * Proporciona acceso directo y síncrono a castigos_toma y castigos_notoma para cada locale.
 */

import { castigos_toma as castigosTomaEs, castigos_notoma as castigosNotomaEs } from './castigos.es.js';
import { castigos_toma as castigosTomaEn, castigos_notoma as castigosNotomaEn } from './castigos.en.js';
import { castigos_toma as castigosTomaPt, castigos_notoma as castigosNotomaPt } from './castigos.pt.js';

export const CASTIGOS_BY_LOCALE = Object.freeze({
  es: { castigos_toma: castigosTomaEs, castigos_notoma: castigosNotomaEs },
  en: { castigos_toma: castigosTomaEn, castigos_notoma: castigosNotomaEn },
  pt: { castigos_toma: castigosTomaPt, castigos_notoma: castigosNotomaPt },
  // Compatibilidad hacia atrás
  'es-CO': { castigos_toma: castigosTomaEs, castigos_notoma: castigosNotomaEs },
  'es-MX': { castigos_toma: castigosTomaEs, castigos_notoma: castigosNotomaEs },
  'es-ES': { castigos_toma: castigosTomaEs, castigos_notoma: castigosNotomaEs },
  'en-US': { castigos_toma: castigosTomaEn, castigos_notoma: castigosNotomaEn },
  'en-GB': { castigos_toma: castigosTomaEn, castigos_notoma: castigosNotomaEn },
  'pt-BR': { castigos_toma: castigosTomaPt, castigos_notoma: castigosNotomaPt },
  'pt-PT': { castigos_toma: castigosTomaPt, castigos_notoma: castigosNotomaPt }
});

export function getCastigosForLocale(locale = 'es') {
  if (CASTIGOS_BY_LOCALE[locale]) {
    return CASTIGOS_BY_LOCALE[locale];
  }
  const prefix = String(locale || '').toLowerCase();
  if (prefix.startsWith('en')) return CASTIGOS_BY_LOCALE['en'];
  if (prefix.startsWith('pt')) return CASTIGOS_BY_LOCALE['pt'];
  return CASTIGOS_BY_LOCALE['es'];
}

export default CASTIGOS_BY_LOCALE;
