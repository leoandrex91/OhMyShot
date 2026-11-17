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
import { verdadORetoHotAdapter } from './verdad-o-reto-hot/adapter.js';
import { VERDAD_O_RETO_HOT_MODE_DEFINITION, VERDAD_O_RETO_HOT_MODE_ID } from './verdad-o-reto-hot/mode.config.js';
import { culturaChupisticaHotAdapter } from './cultura-chupistica-hot/adapter.js';
import { CULTURA_CHUPISTICA_HOT_MODE_DEFINITION, CULTURA_CHUPISTICA_HOT_MODE_ID } from './cultura-chupistica-hot/mode.config.js';
import { mixHotAdapter } from './mix-hot/adapter.js';
import { MIX_HOT_MODE_DEFINITION, MIX_HOT_MODE_ID } from './mix-hot/mode.config.js';

export {
  PREVIA_MIX_MODE_ID,
  YO_NUNCA_MODE_ID,
  QUIEN_MODE_ID,
  VERDAD_O_RETO_MODE_ID,
  CULTURA_CHUPISTICA_MODE_ID,
  HOT_MODE_ID,
  VERDAD_O_RETO_HOT_MODE_ID,
  CULTURA_CHUPISTICA_HOT_MODE_ID,
  MIX_HOT_MODE_ID
};

/**
 * Registro central de modos de juego independientes.
 * Cada modo vive en su propia carpeta bajo `src/modes/<modo>/` con su configuración y motor propios.
 */
export const GAME_MODES_REGISTRY = Object.freeze([
  PREVIA_MIX_MODE_DEFINITION,
  VERDAD_O_RETO_MODE_DEFINITION,
  YO_NUNCA_MODE_DEFINITION,
  QUIEN_MODE_DEFINITION,
  CULTURA_CHUPISTICA_MODE_DEFINITION,
  HOT_MODE_DEFINITION,
  VERDAD_O_RETO_HOT_MODE_DEFINITION,
  CULTURA_CHUPISTICA_HOT_MODE_DEFINITION,
  MIX_HOT_MODE_DEFINITION
]);

const ADAPTERS_BY_ID = new Map([
  [PREVIA_MIX_MODE_ID, previaMixAdapter],
  [CULTURA_CHUPISTICA_MODE_ID, culturaChupisticaAdapter],
  [VERDAD_O_RETO_MODE_ID, verdadORetoAdapter],
  [YO_NUNCA_MODE_ID, yoNuncaAdapter],
  [QUIEN_MODE_ID, quienAdapter],
  [HOT_MODE_ID, hotAdapter],
  [VERDAD_O_RETO_HOT_MODE_ID, verdadORetoHotAdapter],
  [CULTURA_CHUPISTICA_HOT_MODE_ID, culturaChupisticaHotAdapter],
  [MIX_HOT_MODE_ID, mixHotAdapter]
]);

export const HOT_MODE_IDS = new Set([
  HOT_MODE_ID,
  VERDAD_O_RETO_HOT_MODE_ID,
  CULTURA_CHUPISTICA_HOT_MODE_ID,
  MIX_HOT_MODE_ID
]);

export function isHotGameMode(modeId) {
  return HOT_MODE_IDS.has(modeId);
}

export const STANDARD_GAME_MODES = Object.freeze(
  GAME_MODES_REGISTRY.filter((m) => !isHotGameMode(m.id))
);

export const HOT_GAME_MODES = Object.freeze(
  GAME_MODES_REGISTRY.filter((m) => isHotGameMode(m.id))
);

export function getModeDefinition(modeId) {
  return GAME_MODES_REGISTRY.find((m) => m.id === modeId) || GAME_MODES_REGISTRY[0];
}

export function getModeAdapter(modeId) {
  return ADAPTERS_BY_ID.get(modeId) || previaMixAdapter;
}
