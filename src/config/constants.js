/**
 * Punto de compatibilidad para constantes globales del juego y catálogo de modos registrados.
 * Tokens visuales puros viven en `./themeTokens.js`; los modos viven en `../modes/*`.
 */

export * from './themeTokens.js';
export {
  GAME_MODES_REGISTRY as LOCAL_GAME_MODES,
  STANDARD_GAME_MODES,
  HOT_GAME_MODES,
  HOT_MODE_IDS,
  isHotGameMode
} from '../modes/registry.js';
