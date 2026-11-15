/**
 * Oh My Shot! — Card Editor UI Renderer
 * Genera la vista completa del editor de cartas, controles de estudio personalizados,
 * previsualización fidedigna de Previa Mix y modales de edición/exportación.
 */

import { CARD_CATEGORIES, DESIGN_TOKENS, UI_ICONS } from '../../config/themeTokens.js';
import {
  EDITOR_CATEGORIES,
  EDITOR_DECKS,
  EDITOR_SAMPLE_PLAYERS,
  editorController
} from './editor.controller.js';

function escapeHtml(val) {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderUiIcon(iconPath, cssClass = 'ui-icon-xs') {
  if (!iconPath) return '';
  return `<img src="${escapeHtml(iconPath)}" alt="" class="${escapeHtml(cssClass)}" loading="eager" decoding="async" />`;
}

function getCategoryMeta(tipo = 'clásico') {
  const normalized = String(tipo).toLowerCase();
  switch (normalized) {
    case 'duelo':
      return { ...CARD_CATEGORIES.versus, label: 'Duelo' };
    case 'yo nunca':
      return { ...CARD_CATEGORIES.never_have, label: 'Yo nunca' };
    case 'quien es más probable':
      return { ...CARD_CATEGORIES.most_likely, label: '¿Quién es más probable?' };
    case 'verdad':
      return { ...CARD_CATEGORIES.truth, label: 'Verdad' };
    case 'reto':
      return { ...CARD_CATEGORIES.dare, label: 'Reto' };
    case 'retos especiales':
      return { ...CARD_CATEGORIES.special_dare, label: '★ Reto especial' };
    case 'eventos especiales':
      return { ...CARD_CATEGORIES.event, label: '★ Evento especial' };
    case 'hot':
      return { ...CARD_CATEGORIES.hot, label: 'Hot +18' };
    case 'bonus':
      return { ...CARD_CATEGORIES.bonus, label: 'Bonus 🎁' };
    case 'clásico':
    default:
      return { ...CARD_CATEGORIES.drink, label: 'Clásico' };
  }
}

function interpolatePrompt(text = '', players = EDITOR_SAMPLE_PLAYERS, hasResp = false, respText = '') {
  let prompt = escapeHtml(text || '');

  // Tokens de jugadores
  prompt = prompt.replace(
    /\[player\]/g,
    `<span class="prompt-player-chip" style="--chip-accent: #ff4fa3;"><span class="avatar-sample">🦊</span><span>${escapeHtml(
      players[0]?.name || 'Laura'
    )}</span></span>`
  );
  prompt = prompt.replace(
    /\[player_X\]/g,
    `<span class="prompt-player-chip" style="--chip-accent: #47e9d2;"><span class="avatar-sample">🐯</span><span>${escapeHtml(
      players[1]?.name || 'Mateo'
    )}</span></span>`
  );
  prompt = prompt.replace(
    /\[player_Y\]/g,
    `<span class="prompt-player-chip" style="--chip-accent: #ffd166;"><span class="avatar-sample">🐻</span><span>${escapeHtml(
      players[2]?.name || 'Santi'
    )}</span></span>`
  );

  // Token de pregunta trivia [?]
  if (prompt.includes('[?]')) {
    if (hasResp && respText) {
      prompt = prompt.replace(
        /\[\?\]/g,
        `<button type="button" class="btn-card-answer" data-action="open-card-answer" data-answer="${escapeHtml(
          respText
        )}" aria-label="Ver respuesta" title="Ver respuesta"><img src="./assets/icons/ui/icon2_19.webp" alt="Respuesta" class="card-answer-icon" /></button>`
      );
    } else {
      prompt = prompt.replace(
        /\[\?\]/g,
        `<span class="card-answer-placeholder" title="Falta definir 'resp' en esta carta">[?]</span>`
      );
    }
  }

  return prompt;
}

export function buildEditorScreenHtml(state) {
  const ctrl = editorController;
  const currentCard = ctrl.currentCard;
  const totalCards = ctrl.filteredCards.length;
  const currentIndex = ctrl.currentIndex;
  const deckInfo = ctrl.currentDeckInfo;
  const stats = ctrl.deckStats;
  const filterCount = ctrl.activeFilterCount;

  // Opciones de mazos
  const deckOptionsHtml = EDITOR_DECKS.map(
    (d) => `<option value="${escapeHtml(d.id)}" ${d.id === ctrl.deckId ? 'selected' : ''}>${escapeHtml(d.label)}</option>`
  ).join('');

  // Opciones de categorías
  const categoryOptionsHtml = EDITOR_CATEGORIES.map(
    (cat) => `<option value="${escapeHtml(cat.id)}" ${cat.id === ctrl.filterType ? 'selected' : ''}>${escapeHtml(cat.label)}</option>`
  ).join('');

  // Opciones de intensidad
  const intensityOptionsHtml = [
    '<option value="all">Todas las intensidades</option>',
    ...Array.from({ length: 10 }, (_, i) => {
      const val = i + 1;
      return `<option value="${val}" ${String(val) === String(ctrl.filterIntensity) ? 'selected' : ''}>Nivel ${val}</option>`;
    })
  ].join('');

  // Vista de la carta central
  let cardStageHtml = '';
  if (!currentCard || totalCards === 0) {
    cardStageHtml = `
      <div class="editor-empty-state">
        <div class="editor-empty-icon">${renderUiIcon(UI_ICONS.deck, 'ui-icon-lg')}</div>
        <h3 class="editor-empty-title">No hay cartas que coincidan</h3>
        <p class="editor-empty-desc">Prueba ajustando los filtros de categoría, intensidad o el buscador.</p>
        <button type="button" class="btn btn-primary editor-empty-create-btn" data-action="editor-create-new">
          ${renderUiIcon(UI_ICONS.plus, 'ui-icon-xs')}
          <span>Crear nueva carta</span>
        </button>
      </div>
    `;
  } else {
    const meta = getCategoryMeta(currentCard.tipo);
    const rawLevel = Number(currentCard.intensidad);
    const cardLevel = Number.isFinite(rawLevel) && rawLevel >= 1 && rawLevel <= 10 ? Math.round(rawLevel) : 5;
    const cardLevelPadded = String(cardLevel).padStart(2, '0');

    const hasResp = Boolean(currentCard.resp || currentCard.respuesta);
    const respText = currentCard.resp || currentCard.respuesta || '';

    const isGroup = currentCard.participantes === 'grupo';
    const isDuel = currentCard.tipo === 'duelo' || currentCard.tipo === 'versus' || currentCard.min_jugadores > 1;
    const isTrio = currentCard.subtipo === 'bonus_trio';
    const isLightInk = meta.onCardColor === '#181028';
    const isBonusCard = currentCard.tipo === 'bonus' || Boolean(currentCard.isBonus);

    // Spotlight de jugadores
    let spotlightHtml = '';
    if (isTrio) {
      spotlightHtml = `
        <div class="card-duo-spotlight card-trio-spotlight">
          <span class="duo-player-tag">
            <span class="avatar-sample">🦊</span>
            <span>Laura</span>
          </span>
          <span class="duo-player-tag">
            <span class="avatar-sample">🐯</span>
            <span>Mateo</span>
          </span>
          <span class="duo-player-tag">
            <span class="avatar-sample">🐻</span>
            <span>Santi</span>
          </span>
        </div>
      `;
    } else if (isDuel && !isGroup) {
      spotlightHtml = `
        <div class="card-duo-spotlight">
          <span class="duo-player-tag">
            <span class="avatar-sample">🦊</span>
            <span>Laura</span>
          </span>
          <span class="duo-vs-tag duo-vs-icon-tag">${renderUiIcon(UI_ICONS.vs, 'ui-icon-duo-vs')}</span>
          <span class="duo-player-tag">
            <span class="avatar-sample">🐯</span>
            <span>Mateo</span>
          </span>
        </div>
      `;
    }

    // Cabecera de la carta
    let headerPillHtml = '';
    if (isBonusCard) {
      headerPillHtml = `<span class="card-player-pill card-bonus-pill"><span>🎁 Ronda Bonus</span></span>`;
    } else if (isGroup) {
      headerPillHtml = `
        <span class="card-player-pill">
          ${renderUiIcon(UI_ICONS.playersGroup, 'ui-icon-xs')}
          <span>Ronda Grupal</span>
        </span>
      `;
    } else {
      headerPillHtml = `
        <span class="card-player-pill">
          <span class="avatar-sample">🦊</span>
          <span>Laura</span>
        </span>
      `;
    }

    // Castigo
    const castigoText = currentCard.castigo || 'medio trago';

    // Eventos especiales HUD
    let eventInfoHtml = '';
    if (currentCard.tipo === 'eventos especiales') {
      eventInfoHtml = `
        <div class="editor-card-event-badge">
          <span class="event-dot">⚡</span>
          <span><strong>Regla:</strong> ${escapeHtml(currentCard.regla || 'Sin regla')}</span>
          <span>(${escapeHtml(currentCard['duración_turno'] || 3)} turnos)</span>
        </div>
      `;
    }

    // Dados widget preview
    let diceWidgetHtml = '';
    if (currentCard.subtipo === 'bonus_dice' || currentCard.diceThreshold) {
      const threshold = currentCard.diceThreshold ?? 3;
      diceWidgetHtml = `
        <div class="card-dice-widget has-result">
          <div class="dice-box-frame">
            <img class="dice-face-img" src="./assets/icons/dice/dice_4.svg" alt="Dado 4" />
          </div>
          <div class="dice-verdict-badge is-safe">
            🎲 Si saca MÁS DE ${threshold} (${threshold + 1} a 6) · ¡Se salva!
          </div>
        </div>
      `;
    }

    cardStageHtml = `
      <div class="editor-card-stage-wrap">
        <!-- HUD superior de la carta -->
        <div class="editor-hud-row">
          <div class="editor-hud-left">
            <span class="count-pill editor-counter-badge">Carta ${currentIndex + 1}/${totalCards}</span>
            <span class="editor-id-pill">ID: #${escapeHtml(currentCard.id)}</span>
            ${currentCard.isCustom ? '<span class="editor-custom-pill">NUEVA</span>' : ''}
          </div>
          <div class="editor-hud-right">
            <img
              src="./assets/icons/levels/level_${cardLevelPadded}.webp"
              alt="Nivel ${cardLevel}"
              title="Nivel ${cardLevel}"
              class="level-bar-img editor-level-bar-img"
              loading="eager"
            />
          </div>
        </div>

        <!-- Contenedor de la carta Previa Mix -->
        <div class="editor-card-preview-container">
          <div
            class="swipe-card editor-preview-card ${isLightInk ? 'is-light-ink' : ''} ${isBonusCard ? 'fx-bonus' : ''}"
            style="--active-card-bg: ${escapeHtml(meta.cardGradient)}; --active-card-ink: ${escapeHtml(
              meta.onCardColor
            )}; --active-accent: ${escapeHtml(meta.color)};"
          >
            <span class="card-specular-glare" aria-hidden="true"></span>
            <span class="card-holo-rim" aria-hidden="true"></span>

            <div class="card-header-meta">
              ${headerPillHtml}
              <div class="card-header-badges">
                <span class="card-type-badge">${escapeHtml(meta.label)}</span>
              </div>
            </div>

            <div class="card-body-fit">
              <div class="card-decor-emoji" aria-hidden="true">
                ${renderUiIcon(meta.iconImg, 'ui-icon-card')}
              </div>
              ${spotlightHtml}
              <div class="card-prompt-fit">
                <div class="card-prompt-text is-prompt-ready" data-len-tier="medium">
                  ${interpolatePrompt(currentCard.texto, EDITOR_SAMPLE_PLAYERS, hasResp, respText)}
                </div>
              </div>

              ${diceWidgetHtml}
              ${eventInfoHtml}

              <div class="editor-card-forfeit-chip">
                ${renderUiIcon(UI_ICONS.shotFull, 'ui-icon-xs')}
                <span>${escapeHtml(castigoText)}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Callout de trivia si tiene respuesta -->
        ${
          hasResp
            ? `
          <div class="editor-answer-callout">
            <div class="editor-answer-callout-text">
              ${renderUiIcon(UI_ICONS.question, 'ui-icon-xs')}
              <span><strong>Respuesta:</strong> "${escapeHtml(respText)}"</span>
            </div>
            <button
              type="button"
              class="editor-answer-dialog-btn"
              data-action="open-card-answer"
              data-answer="${escapeHtml(respText)}"
              title="Probar cuadro de diálogo de respuesta"
            >
              Probar diálogo
            </button>
          </div>
        `
            : ''
        }

        <!-- Controles de navegación de carta -->
        <div class="editor-stage-controls">
          <button type="button" class="btn btn-secondary editor-nav-btn" data-action="editor-prev-card" title="Carta anterior (←)">
            ${renderUiIcon(UI_ICONS.arrowLeft, 'ui-icon-xs')}
            <span>Anterior</span>
          </button>

          <button type="button" class="btn btn-primary editor-edit-btn" data-action="editor-open-edit" title="Editar carta actual (E)">
            ${renderUiIcon(UI_ICONS.settings, 'ui-icon-xs')}
            <span>Editar carta</span>
          </button>

          <button type="button" class="btn btn-truth editor-new-btn" data-action="editor-create-new" title="Crear nueva carta (N)">
            ${renderUiIcon(UI_ICONS.plus, 'ui-icon-xs')}
            <span>Nueva</span>
          </button>

          <button type="button" class="btn btn-secondary editor-nav-btn" data-action="editor-next-card" title="Siguiente carta (→)">
            <span>Siguiente</span>
            ${renderUiIcon(UI_ICONS.arrowRight, 'ui-icon-xs')}
          </button>
        </div>

        <!-- Barra de salto directo y aleatorio -->
        <div class="editor-jump-bar">
          <button type="button" class="btn btn-ghost editor-jump-rnd-btn" data-action="editor-random-card" title="Saltar a una carta al azar">
            ${renderUiIcon(UI_ICONS.shuffle, 'ui-icon-xs')}
            <span>Al azar</span>
          </button>
          <div class="editor-jump-input-group">
            <label for="editor-jump-input">Ir a #</label>
            <input
              type="number"
              id="editor-jump-input"
              class="editor-custom-input editor-jump-input"
              min="1"
              max="${totalCards}"
              value="${currentIndex + 1}"
            />
            <button type="button" class="btn btn-secondary editor-jump-go-btn" data-action="editor-do-jump">Ir</button>
          </div>
        </div>
      </div>
    `;
  }

  // Modales
  const editModalHtml = ctrl.isEditing ? buildCardEditModalHtml(ctrl.editingCard, ctrl.isNewCard) : '';
  const exportModalHtml = ctrl.exportModalOpen ? buildExportModalHtml(ctrl) : '';

  return `
    <section class="editor-view-stage">
      <!-- Layout de Estudio Responsivo (Sidebar + Canvas) -->
      <div class="editor-studio-layout">

        <!-- Panel de Estudio: Mazos, Filtros y Opciones -->
        <aside class="editor-studio-sidebar">
          <div class="editor-sidebar-panel">
            <div class="editor-sidebar-header">
              <div class="editor-sidebar-title-row">
                <span class="editor-badge-pill">Estudio</span>
                <h2 class="editor-sidebar-title">Mazo & Filtros</h2>
              </div>
              <button
                type="button"
                class="btn btn-secondary editor-mobile-filter-toggle"
                data-action="editor-toggle-mobile-filters"
                aria-expanded="${ctrl.mobileFiltersOpen ? 'true' : 'false'}"
              >
                ${renderUiIcon(UI_ICONS.filter, 'ui-icon-xs')}
                <span>${ctrl.mobileFiltersOpen ? 'Cerrar' : 'Filtros'}</span>
                ${filterCount > 0 ? `<span class="editor-filter-count-badge">${filterCount}</span>` : ''}
              </button>
            </div>

            <!-- Selector de Mazo principal (siempre accesible) -->
            <div class="editor-deck-primary-row">
              <div class="editor-control-field">
                <label for="editor-deck-select" class="editor-field-label">
                  ${renderUiIcon(UI_ICONS.deck, 'ui-icon-xs')}
                  <span>Mazo / Dialecto:</span>
                </label>
                <div class="editor-select-wrap">
                  <select id="editor-deck-select" class="editor-custom-select" data-action="editor-change-deck">
                    ${deckOptionsHtml}
                  </select>
                </div>
              </div>
            </div>

            <!-- Contenido de filtros colapsable en móvil / siempre visible en desktop -->
            <div class="editor-sidebar-body ${ctrl.mobileFiltersOpen ? 'is-open' : ''}">
              <!-- Selector de Orden (Segmented Control Pill) -->
              <div class="editor-control-field">
                <label class="editor-field-label">
                  ${renderUiIcon(UI_ICONS.shuffle, 'ui-icon-xs')}
                  <span>Orden de Cartas:</span>
                </label>
                <div class="editor-segmented-toggle">
                  <button
                    type="button"
                    class="editor-segment-btn ${ctrl.orderMode === 'order' ? 'is-active' : ''}"
                    data-action="editor-set-order"
                    data-order="order"
                  >
                    <span>🔢 En orden</span>
                  </button>
                  <button
                    type="button"
                    class="editor-segment-btn ${ctrl.orderMode === 'random' ? 'is-active' : ''}"
                    data-action="editor-set-order"
                    data-order="random"
                  >
                    <span>🔀 Aleatorio</span>
                  </button>
                </div>
              </div>

              <!-- Filtro de Categoría e Intensidad -->
              <div class="editor-filters-grid">
                <div class="editor-control-field">
                  <label for="editor-category-select" class="editor-field-label">
                    <span>Categoría:</span>
                  </label>
                  <div class="editor-select-wrap">
                    <select id="editor-category-select" class="editor-custom-select" data-action="editor-change-category">
                      ${categoryOptionsHtml}
                    </select>
                  </div>
                </div>

                <div class="editor-control-field">
                  <label for="editor-intensity-select" class="editor-field-label">
                    <span>Intensidad:</span>
                  </label>
                  <div class="editor-select-wrap">
                    <select id="editor-intensity-select" class="editor-custom-select" data-action="editor-change-intensity">
                      ${intensityOptionsHtml}
                    </select>
                  </div>
                </div>
              </div>

              <!-- Buscador Personalizado con Lupa y Limpiador -->
              <div class="editor-control-field">
                <label for="editor-search-input" class="editor-field-label">
                  <span>Buscar:</span>
                </label>
                <div class="editor-search-wrap">
                  <span class="editor-search-icon" aria-hidden="true">${renderUiIcon(UI_ICONS.search, 'ui-icon-xs')}</span>
                  <input
                    type="text"
                    id="editor-search-input"
                    class="editor-custom-input editor-search-input"
                    placeholder="Texto, ID o castigo..."
                    value="${escapeHtml(ctrl.searchQuery)}"
                    autocomplete="off"
                  />
                  ${
                    ctrl.searchQuery
                      ? `<button type="button" class="editor-search-clear-btn" data-action="editor-clear-search" aria-label="Limpiar búsqueda">✕</button>`
                      : ''
                  }
                </div>
              </div>

              <!-- Tarjeta de Estadísticas del Mazo -->
              <div class="editor-deck-stats-card">
                <div class="editor-stat-box">
                  <span class="editor-stat-num">${totalCards}</span>
                  <span class="editor-stat-tag">Visibles</span>
                </div>
                <div class="editor-stat-sep"></div>
                <div class="editor-stat-box">
                  <span class="editor-stat-num">${stats.total}</span>
                  <span class="editor-stat-tag">Total</span>
                </div>
                <div class="editor-stat-sep"></div>
                <div class="editor-stat-box">
                  <span class="editor-stat-num ${stats.modified > 0 ? 'is-highlight' : ''}">${stats.modified}</span>
                  <span class="editor-stat-tag">Editadas</span>
                </div>
              </div>

              <!-- Acciones Globales del Mazo -->
              <div class="editor-sidebar-actions-row">
                <button type="button" class="btn btn-secondary editor-action-btn" data-action="editor-open-export" data-format="json">
                  ${renderUiIcon(UI_ICONS.saveDisk, 'ui-icon-xs')}
                  <span>Exportar</span>
                </button>
                <button type="button" class="btn btn-ghost editor-action-btn" data-action="editor-reset-deck" title="Restablecer cartas a su versión original">
                  ${renderUiIcon(UI_ICONS.trash, 'ui-icon-xs')}
                  <span>Restablecer</span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        <!-- Columna del Escenario de la Carta -->
        <main class="editor-card-stage-column">
          ${cardStageHtml}
        </main>
      </div>

      ${editModalHtml}
      ${exportModalHtml}
    </section>
  `;
}

function buildCardEditModalHtml(card, isNew = false) {
  if (!card) return '';

  const tipo = card.tipo || 'clásico';
  const intensidad = Math.max(1, Math.min(10, Math.round(Number(card.intensidad) || 1)));
  const levelPadded = String(intensidad).padStart(2, '0');

  const categoryOptionsHtml = EDITOR_CATEGORIES.filter((c) => c.id !== 'all')
    .map((c) => `<option value="${escapeHtml(c.id)}" ${c.id === tipo ? 'selected' : ''}>${escapeHtml(c.label)}</option>`)
    .join('');

  const isHot = tipo === 'hot';
  const isEvent = tipo === 'eventos especiales';
  const isBonus = tipo === 'bonus' || card.isBonus;

  return `
    <div
      id="editor-edit-modal-backdrop"
      class="oms-modal-backdrop editor-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="editor-modal-title"
    >
      <div class="oms-modal-card editor-modal-card">
        <header class="editor-modal-header">
          <div class="editor-modal-title-wrap">
            <h2 id="editor-modal-title" class="oms-modal-title">
              ${isNew ? '➕ Crear Nueva Carta' : `✏️ Editar Carta #${escapeHtml(card.id)}`}
            </h2>
            <p class="editor-modal-subtitle">Modifica los parámetros y textos en tiempo real con diseño Oh My Shot.</p>
          </div>
          <button type="button" class="editor-modal-close-btn" data-action="editor-cancel-edit" aria-label="Cerrar modal">
            ${renderUiIcon(UI_ICONS.closeX, 'ui-icon-sm')}
          </button>
        </header>

        <form id="editor-card-form" class="editor-form-scroll" data-action="editor-submit-form" onsubmit="return false;">
          <!-- Categoría -->
          <div class="editor-form-row">
            <label for="edit-card-tipo" class="editor-form-label">Categoría / Tipo de Carta:</label>
            <div class="editor-select-wrap">
              <select id="edit-card-tipo" class="editor-custom-select" data-action="editor-field-change" data-field="tipo">
                ${categoryOptionsHtml}
              </select>
            </div>
          </div>

          <!-- Texto de la pregunta o reto -->
          <div class="editor-form-row">
            <div class="editor-label-with-tools">
              <label for="edit-card-texto" class="editor-form-label">Texto de la carta:</label>
              <div class="editor-token-inserters">
                <span class="editor-token-label">Insertar:</span>
                <button type="button" class="editor-token-chip chip-player" data-action="editor-insert-token" data-token="[player]" title="Jugador principal">+ [player]</button>
                <button type="button" class="editor-token-chip chip-player-x" data-action="editor-insert-token" data-token="[player_X]" title="Segundo jugador (Duelo)">+ [player_X]</button>
                <button type="button" class="editor-token-chip chip-player-y" data-action="editor-insert-token" data-token="[player_Y]" title="Tercer jugador (Trío)">+ [player_Y]</button>
                <button type="button" class="editor-token-chip chip-trivia" data-action="editor-insert-token" data-token=" [?] " title="Icono para respuesta trivia">+ [?]</button>
              </div>
            </div>
            <textarea
              id="edit-card-texto"
              class="editor-custom-textarea editor-texto-textarea"
              rows="4"
              data-action="editor-field-change"
              data-field="texto"
              placeholder="Escribe el texto de la carta..."
            >${escapeHtml(card.texto || '')}</textarea>
          </div>

          <!-- Respuesta de trivia (opcional) -->
          <div class="editor-form-row">
            <label for="edit-card-resp" class="editor-form-label">
              <span>Respuesta de Trivia (opcional):</span>
            </label>
            <input
              type="text"
              id="edit-card-resp"
              class="editor-custom-input"
              data-action="editor-field-change"
              data-field="resp"
              value="${escapeHtml(card.resp || card.respuesta || '')}"
              placeholder="Ej: Buenos Aires / Francia / Marte"
            />
            <span class="editor-field-hint">Al ingresar una respuesta, la carta mostrará el icono interactivo [?] y al tocarlo abrirá el cuadro de diálogo de marca con la respuesta.</span>
          </div>

          <!-- Intensidad / Nivel -->
          <div class="editor-form-row">
            <div class="editor-intensity-header">
              <label for="edit-card-intensidad" class="editor-form-label">
                Intensidad / Nivel: <strong id="editor-intensity-val">${intensidad} / 10</strong>
              </label>
              <img
                id="editor-intensity-preview-img"
                src="./assets/icons/levels/level_${levelPadded}.webp"
                alt="Nivel ${intensidad}"
                class="editor-form-level-img"
              />
            </div>
            <input
              type="range"
              id="edit-card-intensidad"
              class="editor-custom-range"
              min="1"
              max="10"
              step="1"
              value="${intensidad}"
              data-action="editor-intensity-slider"
            />
          </div>

          <!-- Participantes y Mínimo de jugadores -->
          <div class="editor-form-split-row">
            <div class="editor-form-col">
              <label for="edit-card-participantes" class="editor-form-label">Participantes:</label>
              <div class="editor-select-wrap">
                <select id="edit-card-participantes" class="editor-custom-select" data-action="editor-field-change" data-field="participantes">
                  <option value="uno" ${card.participantes === 'uno' ? 'selected' : ''}>uno (Individual)</option>
                  <option value="dos" ${card.participantes === 'dos' ? 'selected' : ''}>dos (Duelo / Dúo)</option>
                  <option value="grupo" ${card.participantes === 'grupo' ? 'selected' : ''}>grupo (Todos)</option>
                </select>
              </div>
            </div>
            <div class="editor-form-col">
              <label for="edit-card-min-jugadores" class="editor-form-label">Mín. Jugadores:</label>
              <input
                type="number"
                id="edit-card-min-jugadores"
                class="editor-custom-input"
                min="2"
                max="24"
                value="${card.min_jugadores || 2}"
                data-action="editor-field-change"
                data-field="min_jugadores"
              />
            </div>
          </div>

          <!-- Castigo / Penitencia -->
          <div class="editor-form-row">
            <label for="edit-card-castigo" class="editor-form-label">Castigo / Penitencia:</label>
            <input
              type="text"
              id="edit-card-castigo"
              class="editor-custom-input"
              data-action="editor-field-change"
              data-field="castigo"
              value="${escapeHtml(card.castigo || 'medio trago')}"
              placeholder="Ej: sorbo, medio trago, 1 trago, o texto personalizado"
            />
          </div>

          <!-- Campos condicionales para Hot -->
          ${
            isHot
              ? `
            <div class="editor-conditional-box">
              <label class="settings-switch-row" for="edit-card-consentimiento">
                <span class="settings-switch-copy">
                  <span><strong>Consentimiento Hot +18</strong></span>
                  <small>Requiere confirmación de consentimiento mutuo.</small>
                </span>
                <input
                  type="checkbox"
                  id="edit-card-consentimiento"
                  class="settings-switch-input"
                  ${card.consentimiento !== false ? 'checked' : ''}
                  data-action="editor-field-change"
                  data-field="consentimiento"
                />
                <span class="settings-switch-track" aria-hidden="true"><span class="settings-switch-thumb"></span></span>
              </label>
            </div>
          `
              : ''
          }

          <!-- Campos condicionales para Eventos Especiales -->
          ${
            isEvent
              ? `
            <div class="editor-conditional-box">
              <div class="editor-form-row">
                <label for="edit-card-duracion" class="editor-form-label">Duración del evento (turnos):</label>
                <input
                  type="number"
                  id="edit-card-duracion"
                  class="editor-custom-input"
                  min="1"
                  max="8"
                  value="${card['duración_turno'] || 3}"
                  data-action="editor-field-change"
                  data-field="duración_turno"
                />
              </div>
              <div class="editor-form-row">
                <label for="edit-card-regla" class="editor-form-label">Regla activa del evento:</label>
                <textarea
                  id="edit-card-regla"
                  class="editor-custom-textarea"
                  rows="2"
                  data-action="editor-field-change"
                  data-field="regla"
                >${escapeHtml(card.regla || '')}</textarea>
              </div>
              <div class="editor-form-row">
                <label for="edit-card-penitencia-social" class="editor-form-label">Penitencia social (no bebedores):</label>
                <textarea
                  id="edit-card-penitencia-social"
                  class="editor-custom-textarea"
                  rows="2"
                  data-action="editor-field-change"
                  data-field="penitencia_social"
                >${escapeHtml(card.penitencia_social || '')}</textarea>
              </div>
            </div>
          `
              : ''
          }

          <!-- Campos condicionales para Bonus -->
          ${
            isBonus
              ? `
            <div class="editor-conditional-box">
              <div class="editor-form-row">
                <label for="edit-card-subtipo" class="editor-form-label">Subtipo de Bonus:</label>
                <div class="editor-select-wrap">
                  <select id="edit-card-subtipo" class="editor-custom-select" data-action="editor-field-change" data-field="subtipo">
                    <option value="bonus_single" ${card.subtipo === 'bonus_single' ? 'selected' : ''}>bonus_single (Individual)</option>
                    <option value="bonus_duo" ${card.subtipo === 'bonus_duo' ? 'selected' : ''}>bonus_duo (Pareja / Combo)</option>
                    <option value="bonus_trio" ${card.subtipo === 'bonus_trio' ? 'selected' : ''}>bonus_trio (Trío dinamita)</option>
                    <option value="bonus_group" ${card.subtipo === 'bonus_group' ? 'selected' : ''}>bonus_group (Ronda general de la casa)</option>
                    <option value="bonus_exclude" ${card.subtipo === 'bonus_exclude' ? 'selected' : ''}>bonus_exclude (Inmunidad / Salvados)</option>
                    <option value="bonus_dice" ${card.subtipo === 'bonus_dice' ? 'selected' : ''}>bonus_dice (Ruleta de dados interactiva)</option>
                  </select>
                </div>
              </div>
              ${
                card.subtipo === 'bonus_dice'
                  ? `
                <div class="editor-form-split-row">
                  <div class="editor-form-col">
                    <label for="edit-card-dice-threshold" class="editor-form-label">Umbral del dado (1-5):</label>
                    <input
                      type="number"
                      id="edit-card-dice-threshold"
                      class="editor-custom-input"
                      min="1"
                      max="5"
                      value="${card.diceThreshold ?? 3}"
                      data-action="editor-field-change"
                      data-field="diceThreshold"
                    />
                  </div>
                  <div class="editor-form-col">
                    <label for="edit-card-dice-condition" class="editor-form-label">Condición para beber:</label>
                    <div class="editor-select-wrap">
                      <select id="edit-card-dice-condition" class="editor-custom-select" data-action="editor-field-change" data-field="diceCondition">
                        <option value="greater" ${card.diceCondition !== 'less' ? 'selected' : ''}>Mayor que el umbral (> X)</option>
                        <option value="less" ${card.diceCondition === 'less' ? 'selected' : ''}>Menor que el umbral (< X)</option>
                      </select>
                    </div>
                  </div>
                </div>
              `
                  : ''
              }
            </div>
          `
              : ''
          }
        </form>

        <footer class="editor-modal-footer">
          <div class="editor-footer-left">
            ${
              !isNew
                ? `
              <button type="button" class="btn btn-ghost editor-btn-delete" data-action="editor-delete-card">
                ${renderUiIcon(UI_ICONS.trash, 'ui-icon-xs')}
                <span>Eliminar</span>
              </button>
            `
                : ''
            }
          </div>
          <div class="editor-footer-right">
            <button type="button" class="btn btn-secondary" data-action="editor-cancel-edit">
              <span>Cancelar y seguir</span>
            </button>
            <button type="button" class="btn btn-primary" data-action="editor-save-card">
              ${renderUiIcon(UI_ICONS.saveDisk, 'ui-icon-xs')}
              <span>Guardar cambios</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  `;
}

function buildExportModalHtml(ctrl) {
  return `
    <div
      id="editor-export-modal-backdrop"
      class="oms-modal-backdrop editor-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="editor-export-title"
    >
      <div class="oms-modal-card editor-modal-card editor-export-card">
        <header class="editor-modal-header">
          <div class="editor-modal-title-wrap">
            <h2 id="editor-export-title" class="oms-modal-title">💾 Exportar Mazo de Cartas</h2>
            <p class="editor-modal-subtitle">${escapeHtml(ctrl.currentDeckInfo.label)} (${ctrl.allCards.length} cartas)</p>
          </div>
          <button type="button" class="editor-modal-close-btn" data-action="editor-close-export" aria-label="Cerrar modal">
            ${renderUiIcon(UI_ICONS.closeX, 'ui-icon-sm')}
          </button>
        </header>

        <div class="editor-export-format-tabs">
          <button
            type="button"
            class="btn ${ctrl.exportFormat === 'json' ? 'btn-primary' : 'btn-secondary'} editor-tab-btn"
            data-action="editor-switch-export-format"
            data-format="json"
          >
            Formato JSON
          </button>
          <button
            type="button"
            class="btn ${ctrl.exportFormat === 'js' ? 'btn-primary' : 'btn-secondary'} editor-tab-btn"
            data-action="editor-switch-export-format"
            data-format="js"
          >
            Código JavaScript (.js ESM)
          </button>
        </div>

        <div class="editor-export-code-wrap">
          <textarea
            id="editor-export-textarea"
            class="editor-export-textarea"
            readonly
            rows="14"
          >${escapeHtml(ctrl.exportContent)}</textarea>
        </div>

        <footer class="editor-modal-footer">
          <div class="editor-footer-left">
            <button type="button" class="btn btn-secondary" data-action="editor-download-file">
              <span>📥 Descargar (${escapeHtml(ctrl.exportFilename)})</span>
            </button>
          </div>
          <div class="editor-footer-right">
            <button type="button" class="btn btn-primary" data-action="editor-copy-clipboard">
              ${renderUiIcon(UI_ICONS.saveDisk, 'ui-icon-xs')}
              <span>Copiar código</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  `;
}
