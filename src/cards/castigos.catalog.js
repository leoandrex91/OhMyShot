/**
 * Oh My Shot! — Catálogo universal de Castigos y Penitencias por idioma
 * Proporciona acceso directo y síncrono a castigos_toma y castigos_notoma para cada locale.
 */

import { castigos_toma as castigosTomaEsCO, castigos_notoma as castigosNotomaEsCO } from './castigos.es-CO.js';
import { castigos_toma as castigosTomaEsMX, castigos_notoma as castigosNotomaEsMX } from './castigos.es-MX.js';
import { castigos_toma as castigosTomaEsES, castigos_notoma as castigosNotomaEsES } from './castigos.es-ES.js';
import { castigos_toma as castigosTomaEnUS, castigos_notoma as castigosNotomaEnUS } from './castigos.en-US.js';
import { castigos_toma as castigosTomaEnGB, castigos_notoma as castigosNotomaEnGB } from './castigos.en-GB.js';
import { castigos_toma as castigosTomaPtBR, castigos_notoma as castigosNotomaPtBR } from './castigos.pt-BR.js';
import { castigos_toma as castigosTomaPtPT, castigos_notoma as castigosNotomaPtPT } from './castigos.pt-PT.js';

export const CASTIGOS_BY_LOCALE = Object.freeze({
  'es-CO': { castigos_toma: castigosTomaEsCO, castigos_notoma: castigosNotomaEsCO },
  'es-MX': { castigos_toma: castigosTomaEsMX, castigos_notoma: castigosNotomaEsMX },
  'es-ES': { castigos_toma: castigosTomaEsES, castigos_notoma: castigosNotomaEsES },
  'en-US': { castigos_toma: castigosTomaEnUS, castigos_notoma: castigosNotomaEnUS },
  'en-GB': { castigos_toma: castigosTomaEnGB, castigos_notoma: castigosNotomaEnGB },
  'pt-BR': { castigos_toma: castigosTomaPtBR, castigos_notoma: castigosNotomaPtBR },
  'pt-PT': { castigos_toma: castigosTomaPtPT, castigos_notoma: castigosNotomaPtPT }
});

export function getCastigosForLocale(locale = 'es-CO') {
  if (CASTIGOS_BY_LOCALE[locale]) {
    return CASTIGOS_BY_LOCALE[locale];
  }
  const prefix = String(locale || '').toLowerCase();
  if (prefix.startsWith('en')) return CASTIGOS_BY_LOCALE['en-US'];
  if (prefix.startsWith('pt')) return CASTIGOS_BY_LOCALE['pt-BR'];
  return CASTIGOS_BY_LOCALE['es-CO'];
}

export default CASTIGOS_BY_LOCALE;
