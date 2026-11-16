/**
 * Oh My Shot! — Card Creator UI
 * Genera la vista de Colección de Cartas Personalizadas, formularios y modales.
 */

import { UI_ICONS } from '../../config/constants.js';
import { CUSTOM_CARD_CATEGORIES, MAX_CUSTOM_CARDS } from '../../core/customCards.js';
import { t } from '../../core/i18n.js';
import { creatorController } from './creator.controller.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderUiIconHtml(src, sizeClass = 'ui-icon-md') {
  if (!src) return '';
  return `<img class="ui-icon-img ${escapeHtml(sizeClass)}" src="${escapeHtml(
    src
  )}" alt="" aria-hidden="true" decoding="async" />`;
}

export const CUSTOM_CARD_THEMES = Object.freeze({
  'clásico': {
    themeClass: 'card-theme-clasico',
    gradient: 'linear-gradient(142deg, #FF4FA3 0%, #FF6284 48%, #FF7B59 100%)',
    accent: '#FF4FA3',
    icon: '🍻',
    label: 'Clásico'
  },
  'cultura chupística': {
    themeClass: 'card-theme-cultura',
    gradient: 'linear-gradient(142deg, #06B6D4 0%, #0284C7 50%, #1E40AF 100%)',
    accent: '#06B6D4',
    icon: '🍹',
    label: 'Cultura Chupística'
  },
  'yo nunca': {
    themeClass: 'card-theme-yo-nunca',
    gradient: 'linear-gradient(142deg, #3BEAD0 0%, #1DC5AE 48%, #149688 100%)',
    accent: '#1DC5AE',
    icon: '🙈',
    label: 'Yo nunca'
  },
  'quien es más probable': {
    themeClass: 'card-theme-quien',
    gradient: 'linear-gradient(142deg, #FFE47A 0%, #FFD166 48%, #FF9F4A 100%)',
    accent: '#FFD166',
    icon: '👑',
    label: '¿Quién es más probable?'
  },
  'reto': {
    themeClass: 'card-theme-reto',
    gradient: 'linear-gradient(142deg, #8B5CF6 0%, #754AC1 50%, #9D3493 100%)',
    accent: '#8B5CF6',
    icon: '⚡',
    label: 'Reto'
  },
  'retos especiales': {
    themeClass: 'card-theme-reto-especial',
    gradient: 'linear-gradient(142deg, #F43F5E 0%, #E11D48 50%, #9F1239 100%)',
    accent: '#F43F5E',
    icon: '🌟',
    label: 'Reto especial'
  },
  'verdad': {
    themeClass: 'card-theme-verdad',
    gradient: 'linear-gradient(142deg, #52F2DA 0%, #44B8FF 52%, #6D82FF 100%)',
    accent: '#44B8FF',
    icon: '💬',
    label: 'Verdad'
  },
  'duelo': {
    themeClass: 'card-theme-duelo',
    gradient: 'linear-gradient(142deg, #FF5E6C 0%, #EF6A56 50%, #FF9C52 100%)',
    accent: '#EF6A56',
    icon: '⚔️',
    label: 'Duelo'
  },
  'hot': {
    themeClass: 'card-theme-hot',
    gradient: 'linear-gradient(142deg, #2E0514 0%, #990D2E 48%, #D12B17 100%)',
    accent: '#FF4518',
    icon: '🔥',
    label: 'Hot +18'
  },
  'bonus': {
    themeClass: 'card-theme-bonus',
    gradient: 'linear-gradient(138deg, #FFE066 0%, #F59E0B 45%, #D97706 100%)',
    accent: '#F59E0B',
    icon: '🎁',
    label: 'Bonus'
  },
  'eventos especiales': {
    themeClass: 'card-theme-evento',
    gradient: 'linear-gradient(138deg, #FFE878 0%, #FFAD42 52%, #FF6A95 100%)',
    accent: '#FFAD42',
    icon: '⭐',
    label: 'Evento especial'
  }
});

export function getCustomCardTheme(rawTipo) {
  const norm = String(rawTipo || '').toLowerCase().trim();
  if (norm.includes('cultura') || norm.includes('chupistica')) return CUSTOM_CARD_THEMES['cultura chupística'];
  if (norm.includes('retos especiales') || (norm.includes('reto') && norm.includes('especial'))) return CUSTOM_CARD_THEMES['retos especiales'];
  if (norm.includes('nunca')) return CUSTOM_CARD_THEMES['yo nunca'];
  if (norm.includes('quien') || norm.includes('probable')) return CUSTOM_CARD_THEMES['quien es más probable'];
  if (norm.includes('reto')) return CUSTOM_CARD_THEMES['reto'];
  if (norm.includes('verdad')) return CUSTOM_CARD_THEMES['verdad'];
  if (norm.includes('duelo') || norm.includes('versus')) return CUSTOM_CARD_THEMES['duelo'];
  if (norm.includes('hot')) return CUSTOM_CARD_THEMES['hot'];
  if (norm.includes('bonus')) return CUSTOM_CARD_THEMES['bonus'];
  if (norm.includes('evento')) return CUSTOM_CARD_THEMES['eventos especiales'];
  return CUSTOM_CARD_THEMES['clásico'];
}

/**
 * Convierte tokens como [player], [player_x], [all] en badges estilizados
 */
export function renderCardPromptWithTokenBadges(text) {
  if (!text) return '';
  let escaped = escapeHtml(text);

  escaped = escaped
    .replace(
      /\[player\]/gi,
      `<span class="creator-token-badge badge-player" title="Jugador protagonista"><span class="token-icon" aria-hidden="true">👤</span><span class="token-tag">[player]</span></span>`
    )
    .replace(
      /\[player_x\]/gi,
      `<span class="creator-token-badge badge-player-x" title="Segundo jugador"><span class="token-icon" aria-hidden="true">🎯</span><span class="token-tag">[player_x]</span></span>`
    )
    .replace(
      /\[player_x1\]|\[player_y\]/gi,
      `<span class="creator-token-badge badge-player-y" title="Tercer jugador"><span class="token-icon" aria-hidden="true">⚡</span><span class="token-tag">[player_y]</span></span>`
    )
    .replace(
      /\[all\]/gi,
      `<span class="creator-token-badge badge-all" title="Todo el grupo"><span class="token-icon" aria-hidden="true">👥</span><span class="token-tag">[all]</span></span>`
    )
    .replace(
      /\[([a-zA-Z0-9_\-]+)\]/g,
      (match, tag) => `<span class="creator-token-badge badge-generic"><span class="token-tag">[${tag}]</span></span>`
    );

  return escaped;
}

export function buildCreatorScreenHtml(state) {
  const { lang = 'es' } = state;
  const total = creatorController.totalCards;
  const filteredCards = creatorController.getFilteredCards();
  const isAtLimit = creatorController.isAtLimit;

  // Modals HTML
  const editModalHtml = creatorController.isModalOpen ? buildEditModalHtml(lang) : '';
  const deleteModalHtml = creatorController.deleteConfirmCardId ? buildDeleteConfirmModalHtml(lang) : '';
  const clearModalHtml = creatorController.clearConfirmOpen ? buildClearConfirmModalHtml(lang) : '';
  const exportModalHtml = creatorController.exportModalOpen ? buildExportModalHtml(lang) : '';
  const importModalHtml = creatorController.importModalOpen ? buildImportModalHtml(lang) : '';

  // Category options
  const categoryFilterOptions = [
    `<option value="all" ${creatorController.filterType === 'all' ? 'selected' : ''}>Categoría: Todas</option>`,
    ...CUSTOM_CARD_CATEGORIES.map(
      (cat) =>
        `<option value="${cat.id}" ${creatorController.filterType === cat.id ? 'selected' : ''}>${cat.icon} ${escapeHtml(
          cat.label
        )}</option>`
    )
  ].join('');

  // Intensity options
  const intensityFilterOptions = [
    `<option value="all" ${creatorController.filterIntensity === 'all' ? 'selected' : ''}>Intensidad: Todas</option>`,
    ...Array.from({ length: 10 }, (_, i) => i + 1).map(
      (lvl) =>
        `<option value="${lvl}" ${creatorController.filterIntensity === String(lvl) ? 'selected' : ''}>Nivel ${lvl}</option>`
    )
  ].join('');

  // Cards list
  let collectionBodyHtml = '';
  if (total === 0) {
    collectionBodyHtml = `
      <div class="creator-empty-collection-card glass-panel">
        <div class="creator-empty-icon" aria-hidden="true">🃏</div>
        <h2 class="creator-empty-title">¡Tu colección está vacía!</h2>
        <p class="creator-empty-desc">
          Crea tus propias cartas con tus preguntas, retos, penitencias o bromas entre amigos.
          Podrás activarlas en cualquier modo de juego (Previa Mix, Yo Nunca y Quién es más probable).
        </p>
        <button
          type="button"
          class="btn btn-primary creator-empty-btn"
          data-action="creator-open-create"
        >
          ${renderUiIconHtml(UI_ICONS.plus, 'ui-icon-sm')}
          <span>Crear mi primera carta</span>
        </button>
      </div>
    `;
  } else if (filteredCards.length === 0) {
    collectionBodyHtml = `
      <div class="creator-empty-filter-state">
        <p>No se encontraron cartas con los filtros actuales.</p>
        <button type="button" class="btn btn-secondary btn-sm" data-action="creator-clear-filters">
          <span>Limpiar filtros</span>
        </button>
      </div>
    `;
  } else {
    const cardsItemsHtml = filteredCards
      .map((card) => {
        const theme = getCustomCardTheme(card.tipo);
        const formattedPrompt = renderCardPromptWithTokenBadges(card.texto);
        const partLabel =
          card.participantes === 'duo'
            ? '2 jugadores'
            : card.participantes === 'trio'
              ? '3 jugadores'
              : card.participantes === 'grupo'
                ? 'Todo el grupo'
                : '1 jugador';

        return `
          <article
            class="creator-card-item ${theme.themeClass}"
            data-card-id="${escapeHtml(card.id)}"
            style="--card-bg: ${theme.gradient}; --card-accent: ${theme.accent};"
          >
            <div class="creator-card-item-top">
              <span class="creator-card-type-tag">
                <span aria-hidden="true">${theme.icon}</span>
                <span>${escapeHtml(theme.label)}</span>
              </span>
              <span class="creator-card-intensity-tag">
                <img
                  src="./assets/icons/levels/level_${String(card.intensidad).padStart(2, '0')}.webp"
                  alt=""
                  class="creator-level-mini-img"
                  aria-hidden="true"
                />
                <span>Nivel ${card.intensidad}</span>
              </span>
            </div>

            <div class="creator-card-item-prompt">${formattedPrompt}</div>

            <div class="creator-card-item-meta">
              <span class="creator-meta-pill" title="Castigo o trago">
                <span aria-hidden="true">🍺</span>
                <span>${escapeHtml(card.castigo || 'medio trago')}</span>
              </span>
              <span class="creator-meta-pill" title="Participantes">
                <span aria-hidden="true">👥</span>
                <span>${escapeHtml(partLabel)}</span>
              </span>
              <span class="creator-meta-pill" title="Mínimo de jugadores en mesa">
                <span>Mín. ${card.min_jugadores || 2}</span>
              </span>
            </div>

            <div class="creator-card-item-actions">
              <button
                type="button"
                class="btn btn-secondary btn-sm creator-item-btn"
                data-action="creator-open-edit"
                data-card-id="${escapeHtml(card.id)}"
                title="Editar esta carta"
              >
                ${renderUiIconHtml(UI_ICONS.settings, 'ui-icon-xs')}
                <span>Editar</span>
              </button>
              <button
                type="button"
                class="btn btn-danger-soft btn-sm creator-item-btn"
                data-action="creator-start-delete"
                data-card-id="${escapeHtml(card.id)}"
                title="Eliminar esta carta"
              >
                <span>🗑️ Borrar</span>
              </button>
            </div>
          </article>
        `;
      })
      .join('');

    collectionBodyHtml = `
      <div class="creator-collection-grid">
        ${cardsItemsHtml}
      </div>
    `;
  }

  return `
    <section class="creator-stage">
      <!-- Encabezado compacto del creador -->
      <div class="creator-header-card glass-panel">
        <div class="creator-header-top-row">
          <div class="creator-header-brand">
            <span class="creator-header-icon" aria-hidden="true">🎨</span>
            <h1 class="creator-main-title">Creador de Cartas</h1>
          </div>
          <div class="creator-header-badge-col">
            <span class="creator-counter-badge ${isAtLimit ? 'is-limit' : ''}">
              <strong>${total}</strong> / ${MAX_CUSTOM_CARDS} cartas
            </span>
            ${isAtLimit ? '<small class="creator-limit-notice">Límite alcanzado</small>' : ''}
          </div>
        </div>
        <p class="creator-main-subtitle">
          Crea tus propias cartas para jugar en tus previas. Podrás activarlas en el menú de configuración de cada modo.
        </p>
      </div>

      <!-- Barra de acciones: organizada para móvil vertical como la foto -->
      <div class="creator-toolbar glass-panel">
        <button
          type="button"
          class="btn btn-primary creator-new-btn ${isAtLimit ? 'is-disabled' : ''}"
          data-action="creator-open-create"
          ${isAtLimit ? 'disabled' : ''}
          title="${isAtLimit ? 'Has alcanzado el límite máximo de 500 cartas' : 'Crear una nueva carta personalizada'}"
        >
          ${renderUiIconHtml(UI_ICONS.plus, 'ui-icon-sm')}
          <span>+ Nueva Carta</span>
        </button>

        <div class="creator-toolbar-secondary ${total > 0 ? 'has-clear' : ''}">
          <button
            type="button"
            class="btn btn-secondary creator-tool-btn"
            data-action="creator-open-import"
            title="Importar cartas desde archivo JSON"
          >
            <span>📥 Importar</span>
          </button>

          <button
            type="button"
            class="btn btn-secondary creator-tool-btn"
            data-action="creator-open-export"
            ${total === 0 ? 'disabled' : ''}
            title="Exportar colección a archivo JSON"
          >
            <span>📤 Exportar</span>
          </button>

          ${
            total > 0
              ? `
            <button
              type="button"
              class="btn btn-secondary creator-clear-btn"
              data-action="creator-open-clear"
              title="Eliminar todas las cartas de la colección"
            >
              <span>🗑️ Limpiar Todo</span>
            </button>
          `
              : ''
          }
        </div>
      </div>

      <!-- Barra de filtros organizada -->
      <div class="creator-filters-bar glass-panel">
        <div class="creator-search-wrap">
          <span class="creator-search-icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            id="creator-search-input"
            class="creator-search-input"
            placeholder="Buscar por texto o categoría..."
            value="${escapeHtml(creatorController.searchQuery)}"
            data-action="creator-search-input"
          />
          ${
            creatorController.searchQuery
              ? `<button type="button" class="creator-search-clear-btn" data-action="creator-clear-search" aria-label="Limpiar búsqueda">✕</button>`
              : ''
          }
        </div>

        <div class="creator-selects-row">
          <div class="creator-select-field">
            <select id="creator-category-select" class="creator-custom-select" data-action="creator-filter-category">
              ${categoryFilterOptions}
            </select>
          </div>

          <div class="creator-select-field">
            <select id="creator-intensity-select" class="creator-custom-select" data-action="creator-filter-intensity">
              ${intensityFilterOptions}
            </select>
          </div>
        </div>
      </div>

      <!-- Sección de Colección: SIEMPRE VISIBLE en pantalla -->
      <div class="creator-collection-section">
        <div class="creator-collection-header-row">
          <h2 class="creator-collection-heading">
            <span>🃏 Tu Colección</span>
            <span class="creator-collection-count-pill">${filteredCards.length}</span>
          </h2>
          ${filteredCards.length < total ? `<span class="creator-filter-hint">Filtradas de ${total}</span>` : ''}
        </div>
        ${collectionBodyHtml}
      </div>
    </section>

    ${editModalHtml}
    ${deleteModalHtml}
    ${clearModalHtml}
    ${exportModalHtml}
    ${importModalHtml}
  `;
}

function buildEditModalHtml(lang) {
  const card = creatorController.editingCard;
  if (!card) return '';

  const isNew = creatorController.isCreatingNew;
  const modalTitle = isNew ? '✨ Crear Nueva Carta' : '✏️ Editar Carta';
  const currentIntensity = card.intensidad || 5;

  const categoryOptionsHtml = CUSTOM_CARD_CATEGORIES.map(
    (cat) =>
      `<option value="${cat.id}" ${card.tipo === cat.id ? 'selected' : ''}>${cat.icon} ${escapeHtml(cat.label)}</option>`
  ).join('');

  return `
    <div id="creator-edit-modal-backdrop" class="creator-modal-backdrop oms-modal-backdrop">
      <div class="creator-edit-dialog glass-panel" role="dialog" aria-modal="true" aria-labelledby="creator-modal-title">
        <div class="editor-modal-header creator-dialog-header">
          <div class="editor-modal-title-wrap">
            <h2 id="creator-modal-title" class="editor-modal-title">${escapeHtml(modalTitle)}</h2>
            <span class="editor-modal-subtitle">Personaliza todos los parámetros de la carta</span>
          </div>
          <button type="button" class="editor-modal-close-btn" data-action="creator-cancel-edit" aria-label="Cerrar modal">✕</button>
        </div>

        <form id="creator-card-form" class="editor-form-scroll creator-modal-scroll" onsubmit="return false;">
          <div class="editor-form-row">
            <div class="editor-label-with-tools">
              <label for="creator-edit-texto" class="editor-form-label">Texto / Pregunta / Desafío *</label>
              <div class="editor-token-inserters">
                <span class="editor-token-label">Tokens:</span>
                <button type="button" class="editor-token-chip chip-player" data-action="creator-insert-token" data-token="[player]" title="Inserta el jugador protagonista">+ 👤 [player]</button>
                <button type="button" class="editor-token-chip chip-player-x" data-action="creator-insert-token" data-token="[player_x]" title="Inserta un segundo jugador">+ 🎯 [player_x]</button>
                <button type="button" class="editor-token-chip chip-trivia" data-action="creator-insert-token" data-token="[all]" title="Inserta 'Todos'">+ 👥 [all]</button>
              </div>
            </div>
            <textarea
              id="creator-edit-texto"
              name="texto"
              class="editor-custom-textarea creator-form-textarea"
              rows="3"
              placeholder="Ej: [player] debe confesar... / Cultura Chupística: Marcas de tequila / Yo nunca he fingido..."
              required
            >${escapeHtml(card.texto || '')}</textarea>
          </div>

          <div class="editor-form-split-row">
            <div class="editor-form-field">
              <label for="creator-edit-tipo" class="editor-form-label">Categoría / Tipo de Carta</label>
              <select id="creator-edit-tipo" name="tipo" class="editor-custom-select">
                ${categoryOptionsHtml}
              </select>
            </div>

            <div class="editor-form-field">
              <label for="creator-edit-castigo" class="editor-form-label">Castigo / Penitencia</label>
              <input
                type="text"
                id="creator-edit-castigo"
                name="castigo"
                class="editor-custom-input"
                placeholder="Ej: 1 trago, medio trago, fondo"
                value="${escapeHtml(card.castigo || 'medio trago')}"
              />
            </div>
          </div>

          <div class="editor-form-row">
            <div class="editor-intensity-header">
              <label for="creator-edit-intensidad" class="editor-form-label">
                Nivel de Intensidad: <strong id="creator-intensity-val">${currentIntensity} / 10</strong>
              </label>
              <img
                id="creator-intensity-preview-img"
                src="./assets/icons/levels/level_${String(currentIntensity).padStart(2, '0')}.webp"
                alt="Nivel ${currentIntensity}"
                class="editor-form-level-img"
              />
            </div>
            <input
              type="range"
              id="creator-edit-intensidad"
              name="intensidad"
              class="editor-custom-range"
              min="1"
              max="10"
              step="1"
              value="${currentIntensity}"
            />
          </div>

          <div class="editor-form-split-row">
            <div class="editor-form-field">
              <label for="creator-edit-participantes" class="editor-form-label">Participantes</label>
              <select id="creator-edit-participantes" name="participantes" class="editor-custom-select">
                <option value="uno" ${card.participantes === 'uno' ? 'selected' : ''}>1 jugador (Individual)</option>
                <option value="duo" ${card.participantes === 'duo' ? 'selected' : ''}>2 jugadores (Dúo / Pareja)</option>
                <option value="trio" ${card.participantes === 'trio' ? 'selected' : ''}>3 jugadores (Trío)</option>
                <option value="grupo" ${card.participantes === 'grupo' ? 'selected' : ''}>Todo el grupo (General)</option>
              </select>
            </div>

            <div class="editor-form-field">
              <label for="creator-edit-min-jugadores" class="editor-form-label">Mínimo de Jugadores</label>
              <input
                type="number"
                id="creator-edit-min-jugadores"
                name="min_jugadores"
                class="editor-custom-input"
                min="2"
                max="8"
                value="${card.min_jugadores || 2}"
              />
            </div>
          </div>
        </form>

        <div class="editor-modal-footer">
          <button type="button" class="btn btn-secondary" data-action="creator-cancel-edit">Cancelar</button>
          <button type="button" class="btn btn-primary" data-action="creator-save-card">
            <span>💾 Guardar Carta</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function buildDeleteConfirmModalHtml(lang) {
  return `
    <div id="creator-delete-modal-backdrop" class="creator-modal-backdrop oms-modal-backdrop">
      <div class="creator-confirm-dialog glass-panel" role="dialog" aria-modal="true">
        <div class="creator-confirm-icon" aria-hidden="true">🗑️</div>
        <h2 class="creator-confirm-title">¿Eliminar esta carta?</h2>
        <p class="creator-confirm-desc">Esta acción no se puede deshacer. La carta se eliminará permanentemente de tu colección local.</p>
        <div class="creator-confirm-actions">
          <button type="button" class="btn btn-secondary" data-action="creator-cancel-delete">Cancelar</button>
          <button type="button" class="btn btn-danger" data-action="creator-confirm-delete">Sí, eliminar</button>
        </div>
      </div>
    </div>
  `;
}

function buildClearConfirmModalHtml(lang) {
  return `
    <div id="creator-clear-modal-backdrop" class="creator-modal-backdrop oms-modal-backdrop">
      <div class="creator-confirm-dialog glass-panel" role="dialog" aria-modal="true">
        <div class="creator-confirm-icon is-danger" aria-hidden="true">⚠️</div>
        <h2 class="creator-confirm-title">¿Borrar toda la colección?</h2>
        <p class="creator-confirm-desc">
          Se eliminarán <strong>todas las cartas personalizadas</strong> creadas en este dispositivo.
          Te recomendamos exportar tu colección antes de limpiarla si deseas conservarla.
        </p>
        <div class="creator-confirm-actions">
          <button type="button" class="btn btn-secondary" data-action="creator-cancel-clear">Cancelar</button>
          <button type="button" class="btn btn-danger" data-action="creator-confirm-clear">Sí, borrar todo</button>
        </div>
      </div>
    </div>
  `;
}

function buildExportModalHtml(lang) {
  const content = creatorController.exportContent;
  const filename = creatorController.exportFilename;

  return `
    <div id="creator-export-modal-backdrop" class="creator-modal-backdrop oms-modal-backdrop">
      <div class="creator-export-dialog glass-panel" role="dialog" aria-modal="true">
        <div class="editor-modal-header">
          <div class="editor-modal-title-wrap">
            <h2 class="editor-modal-title">Exportar Colección</h2>
            <span class="editor-modal-subtitle">Descarga tus cartas en formato JSON para respaldarlas o compartirlas</span>
          </div>
          <button type="button" class="editor-modal-close-btn" data-action="creator-close-export" aria-label="Cerrar modal">✕</button>
        </div>

        <div class="editor-export-code-wrap">
          <textarea class="editor-export-textarea" readonly rows="9">${escapeHtml(content)}</textarea>
        </div>

        <div class="editor-modal-footer">
          <button type="button" class="btn btn-secondary" data-action="creator-copy-export">
            <span>📋 Copiar JSON</span>
          </button>
          <button type="button" class="btn btn-primary" data-action="creator-download-export" data-filename="${escapeHtml(filename)}">
            <span>💾 Descargar Archivo (.json)</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function buildImportModalHtml(lang) {
  return `
    <div id="creator-import-modal-backdrop" class="creator-modal-backdrop oms-modal-backdrop">
      <div class="creator-import-dialog glass-panel" role="dialog" aria-modal="true">
        <div class="editor-modal-header">
          <div class="editor-modal-title-wrap">
            <h2 class="editor-modal-title">Importar Cartas</h2>
            <span class="editor-modal-subtitle">Selecciona un archivo .json o pega el contenido para agregarlo a tu colección</span>
          </div>
          <button type="button" class="editor-modal-close-btn" data-action="creator-close-import" aria-label="Cerrar modal">✕</button>
        </div>

        <div class="creator-import-dropzone" onclick="document.querySelector('#creator-file-input')?.click()">
          <span class="creator-import-drop-icon" aria-hidden="true">📁</span>
          <p class="creator-import-drop-text">Haz clic aquí para seleccionar un archivo <strong>.json</strong></p>
          <input type="file" id="creator-file-input" accept=".json,application/json" style="display:none;" />
        </div>

        <div class="creator-import-or-sep">
          <span>O pega el JSON directamente</span>
        </div>

        <div class="editor-export-code-wrap">
          <textarea id="creator-import-textarea" class="editor-export-textarea" placeholder="Pega el contenido JSON aquí..." rows="6"></textarea>
        </div>

        <div class="editor-modal-footer">
          <button type="button" class="btn btn-secondary" data-action="creator-close-import">Cancelar</button>
          <button type="button" class="btn btn-primary" data-action="creator-submit-import-text">
            <span>📥 Importar Cartas</span>
          </button>
        </div>
      </div>
    </div>
  `;
}
