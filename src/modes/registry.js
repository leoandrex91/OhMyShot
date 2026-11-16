import { UI_ICONS } from '../config/themeTokens.js';
import { previaMixAdapter } from './previa-mix/adapter.js';
import { PREVIA_MIX_MODE_DEFINITION, PREVIA_MIX_MODE_ID } from './previa-mix/mode.config.js';
import { yoNuncaAdapter } from './yo-nunca/adapter.js';
import { YO_NUNCA_MODE_DEFINITION, YO_NUNCA_MODE_ID } from './yo-nunca/mode.config.js';
import { quienAdapter } from './quien/adapter.js';
import { QUIEN_MODE_DEFINITION, QUIEN_MODE_ID } from './quien/mode.config.js';
import { verdadORetoAdapter } from './verdad-o-reto/adapter.js';
import { VERDAD_O_RETO_MODE_DEFINITION, VERDAD_O_RETO_MODE_ID } from './verdad-o-reto/mode.config.js';
import { culturaChupisticaAdapter } from './cultura-chupistica/adapter.js';
import { CULTURA_CHUPISTICA_MODE_DEFINITION, CULTURA_CHUPISTICA_MODE_ID } from './cultura-chupistica/mode.config.js';
import { hotAdapter } from './hot/adapter.js';
import { HOT_MODE_DEFINITION, HOT_MODE_ID } from './hot/mode.config.js';

export {
  PREVIA_MIX_MODE_ID,
  YO_NUNCA_MODE_ID,
  QUIEN_MODE_ID,
  VERDAD_O_RETO_MODE_ID,
  CULTURA_CHUPISTICA_MODE_ID,
  HOT_MODE_ID
};

/**
 * Registro central de modos de juego independientes.
 * Cada nuevo modo vive en su propia carpeta bajo `src/modes/<modo>/` con su configuración y motor propios.
 */
export const GAME_MODES_REGISTRY = Object.freeze([
  PREVIA_MIX_MODE_DEFINITION,
  VERDAD_O_RETO_MODE_DEFINITION,
  YO_NUNCA_MODE_DEFINITION,
  QUIEN_MODE_DEFINITION,
  CULTURA_CHUPISTICA_MODE_DEFINITION,
  HOT_MODE_DEFINITION
]);

const ADAPTERS_BY_ID = new Map([
  [PREVIA_MIX_MODE_ID, previaMixAdapter],
  [CULTURA_CHUPISTICA_MODE_ID, culturaChupisticaAdapter],
  [VERDAD_O_RETO_MODE_ID, verdadORetoAdapter],
  [YO_NUNCA_MODE_ID, yoNuncaAdapter],
  [QUIEN_MODE_ID, quienAdapter],
  [HOT_MODE_ID, hotAdapter]
]);

export function getModeDefinition(modeId) {
  return GAME_MODES_REGISTRY.find((m) => m.id === modeId) || GAME_MODES_REGISTRY[0];
}

export function getModeAdapter(modeId) {
  return ADAPTERS_BY_ID.get(modeId) || previaMixAdapter;
}
