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

export {
  PREVIA_MIX_MODE_ID,
  YO_NUNCA_MODE_ID,
  QUIEN_MODE_ID,
  VERDAD_O_RETO_MODE_ID,
  CULTURA_CHUPISTICA_MODE_ID
};

export const EDITOR_MODE_ID = 'editor';

export const EDITOR_MODE_DEFINITION = Object.freeze({
  id: EDITOR_MODE_ID,
  version: '1.0',
  folder: 'src/modes/editor',
  icon: '🛠️',
  iconImg: UI_ICONS.settings,
  accent: '#06b6d4',
  surfaceBg: 'linear-gradient(135deg, #091e3a 0%, #102a4e 52%, #081528 100%)',
  borderColor: 'rgba(56, 189, 248, 0.5)',
  inkColor: 'var(--oms-white)',
  playable: true,
  minPlayers: 1,
  maxPlayers: 24,
  badgeEs: 'Temporal',
  badgeEn: 'Temporary',
  badgePt: 'Temporário',
  titleEs: 'Editor de Cartas',
  titleEn: 'Card Editor',
  titlePt: 'Editor de Cartas',
  descEs: 'Herramienta para filtrar, inspeccionar, editar textos, respuestas y crear cartas.',
  descEn: 'Tool to filter, inspect, edit texts, answers, and create cards.',
  descPt: 'Ferramenta para filtrar, inspecionar, editar textos, respostas e criar cartas.',
  howToPlayEs: [
    'Selecciona el modo o idioma de cartas que deseas inspeccionar y editar.',
    'Navega en orden secuencial o aleatorio, y filtra por categoría o intensidad.',
    'Edita textos, respuestas, castigos, parámetros o crea nuevas cartas en tiempo real.'
  ]
});

/**
 * Registro central de modos de juego independientes.
 * Cada nuevo modo vive en su propia carpeta bajo `src/modes/<modo>/` con su configuración y motor propios.
 */
export const GAME_MODES_REGISTRY = Object.freeze([
  PREVIA_MIX_MODE_DEFINITION,
  CULTURA_CHUPISTICA_MODE_DEFINITION,
  VERDAD_O_RETO_MODE_DEFINITION,
  YO_NUNCA_MODE_DEFINITION,
  QUIEN_MODE_DEFINITION
]);

const ADAPTERS_BY_ID = new Map([
  [PREVIA_MIX_MODE_ID, previaMixAdapter],
  [CULTURA_CHUPISTICA_MODE_ID, culturaChupisticaAdapter],
  [VERDAD_O_RETO_MODE_ID, verdadORetoAdapter],
  [YO_NUNCA_MODE_ID, yoNuncaAdapter],
  [QUIEN_MODE_ID, quienAdapter]
]);

export function getModeDefinition(modeId) {
  if (modeId === EDITOR_MODE_ID) return EDITOR_MODE_DEFINITION;
  return GAME_MODES_REGISTRY.find((m) => m.id === modeId) || GAME_MODES_REGISTRY[0];
}

export function getModeAdapter(modeId) {
  return ADAPTERS_BY_ID.get(modeId) || previaMixAdapter;
}
