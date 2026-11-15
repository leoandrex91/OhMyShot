/**
 * Punto de compatibilidad para constantes globales del juego y catálogo de modos registrados.
 * Tokens visuales puros viven en `./themeTokens.js`; los modos viven en `../modes/*`.
 */

export * from './themeTokens.js';
export { GAME_MODES_REGISTRY as LOCAL_GAME_MODES } from '../modes/registry.js';
