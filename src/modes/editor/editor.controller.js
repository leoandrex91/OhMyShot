/**
 * Oh My Shot! — Card Editor Controller
 * Controla la carga de mazos, filtrado, paginación, navegación y edición.
 */

import { getBonusCardsForLocale } from '../../config/bonusCards.catalog.js';
import { loadPreviaMixLocale } from '../previa-mix/previa-mix.locales.js';
import {
  applyOverridesToCards,
  deleteCardOverride,
  exportDeckJs,
  exportDeckJson,
  loadDeckOverrides,
  resetDeckOverrides,
  saveCardOverride
} from './editor.storage.js';

export const EDITOR_DECKS = Object.freeze([
  { id: 'previa-mix:es-CO', label: 'Previa Mix · Colombia (es-CO)', mode: 'previa-mix', locale: 'es-CO' },
  { id: 'previa-mix:es-MX', label: 'Previa Mix · México (es-MX)', mode: 'previa-mix', locale: 'es-MX' },
  { id: 'previa-mix:es-ES', label: 'Previa Mix · España (es-ES)', mode: 'previa-mix', locale: 'es-ES' },
  { id: 'previa-mix:en-US', label: 'Previa Mix · EE. UU. (en-US)', mode: 'previa-mix', locale: 'en-US' },
  { id: 'previa-mix:en-GB', label: 'Previa Mix · Reino Unido (en-GB)', mode: 'previa-mix', locale: 'en-GB' },
  { id: 'previa-mix:pt-BR', label: 'Previa Mix · Brasil (pt-BR)', mode: 'previa-mix', locale: 'pt-BR' },
  { id: 'previa-mix:pt-PT', label: 'Previa Mix · Portugal (pt-PT)', mode: 'previa-mix', locale: 'pt-PT' },
  { id: 'bonus:all', label: 'Cartas Bonus 🎁 (Universal)', mode: 'bonus', locale: 'es-CO' }
]);

export const EDITOR_CATEGORIES = Object.freeze([
  { id: 'all', label: 'Todas las categorías' },
  { id: 'clásico', label: 'Clásico' },
  { id: 'duelo', label: 'Duelo' },
  { id: 'yo nunca', label: 'Yo nunca' },
  { id: 'quien es más probable', label: '¿Quién es más probable?' },
  { id: 'verdad', label: 'Verdad' },
  { id: 'reto', label: 'Reto' },
  { id: 'retos especiales', label: '★ Reto especial' },
  { id: 'eventos especiales', label: '★ Evento especial' },
  { id: 'hot', label: 'Hot +18' },
  { id: 'bonus', label: 'Bonus 🎁' }
]);

export const EDITOR_SAMPLE_PLAYERS = Object.freeze([
  { id: 'p1', name: 'Laura', avatarEmoji: '🦊', avatarColor: '#ff4fa3', drinksAlcohol: true },
  { id: 'p2', name: 'Mateo', avatarEmoji: '🐯', avatarColor: '#47e9d2', drinksAlcohol: true },
  { id: 'p3', name: 'Santi', avatarEmoji: '🐻', avatarColor: '#ffd166', drinksAlcohol: true },
  { id: 'p4', name: 'Sofía', avatarEmoji: '🦄', avatarColor: '#a78bfa', drinksAlcohol: false }
]);

export class EditorController {
  constructor() {
    this.deckId = 'previa-mix:es-CO';
    this.rawDeckCards = [];
    this.allCards = [];
    this.filteredCards = [];
    this.filterType = 'all';
    this.filterIntensity = 'all';
    this.searchQuery = '';
    this.orderMode = 'order'; // 'order' | 'random'
    this.shuffledOrder = [];
    this.currentIndex = 0;
    this.history = [];
    this.isEditing = false;
    this.editingCard = null;
    this.isNewCard = false;
    this.exportModalOpen = false;
    this.exportContent = '';
    this.exportFormat = 'json';
    this.isLoading = false;
    this.mobileFiltersOpen = false;
  }

  get currentDeckInfo() {
    return EDITOR_DECKS.find((d) => d.id === this.deckId) || EDITOR_DECKS[0];
  }

  get currentCard() {
    if (!this.filteredCards || this.filteredCards.length === 0) return null;
    const safeIdx = Math.max(0, Math.min(this.filteredCards.length - 1, this.currentIndex));
    return this.filteredCards[safeIdx] || null;
  }

  get deckStats() {
    const overrides = loadDeckOverrides(this.deckId);
    const modCount = Object.keys(overrides.modified || {}).length;
    const customCount = (overrides.created || []).length;
    return {
      total: this.allCards.length,
      filtered: this.filteredCards.length,
      modified: modCount,
      custom: customCount,
      totalChanges: modCount + customCount
    };
  }

  get activeFilterCount() {
    let count = 0;
    if (this.filterType !== 'all') count++;
    if (this.filterIntensity !== 'all') count++;
    if (this.searchQuery && this.searchQuery.trim().length > 0) count++;
    return count;
  }

  toggleMobileFilters() {
    this.mobileFiltersOpen = !this.mobileFiltersOpen;
  }

  async init(deckId = 'previa-mix:es-CO') {
    this.deckId = deckId;
    await this.loadDeck(deckId);
  }

  async loadDeck(deckId) {
    this.isLoading = true;
    this.deckId = deckId;
    const deckInfo = this.currentDeckInfo;

    try {
      if (deckInfo.mode === 'bonus') {
        const bonusCards = getBonusCardsForLocale(deckInfo.locale || 'es-CO');
        this.rawDeckCards = bonusCards;
      } else {
        const localeCards = await loadPreviaMixLocale(deckInfo.locale || 'es-CO');
        this.rawDeckCards = Array.isArray(localeCards) ? localeCards : [];
      }

      this.refreshCardsWithOverrides();
      this.applyFilters(true);
    } catch (err) {
      console.error('[EditorController] Error cargando mazo:', err);
    } finally {
      this.isLoading = false;
    }
  }

  refreshCardsWithOverrides() {
    this.allCards = applyOverridesToCards(this.deckId, this.rawDeckCards);
  }

  applyFilters(resetIndex = false) {
    let list = [...this.allCards];

    // Filtro por tipo
    if (this.filterType !== 'all') {
      list = list.filter((c) => c.tipo === this.filterType || (this.filterType === 'bonus' && c.isBonus));
    }

    // Filtro por intensidad
    if (this.filterIntensity !== 'all') {
      const targetInt = Number(this.filterIntensity);
      list = list.filter((c) => Number(c.intensidad) === targetInt);
    }

    // Filtro por texto / búsqueda
    const q = (this.searchQuery || '').trim().toLowerCase();
    if (q) {
      list = list.filter((c) => {
        const idMatch = String(c.id).toLowerCase().includes(q);
        const textMatch = (c.texto || '').toLowerCase().includes(q);
        const respMatch = (c.resp || c.respuesta || '').toLowerCase().includes(q);
        const castigoMatch = (c.castigo || '').toLowerCase().includes(q);
        return idMatch || textMatch || respMatch || castigoMatch;
      });
    }

    // Orden secuencial o aleatorio
    if (this.orderMode === 'order') {
      // Orden por ID ascendente numérico si es posible
      list.sort((a, b) => {
        const numA = Number(a.id);
        const numB = Number(b.id);
        if (Number.isFinite(numA) && Number.isFinite(numB)) return numA - numB;
        return String(a.id).localeCompare(String(b.id));
      });
    } else {
      // Barajado determinista
      list = this.#shuffleArray([...list]);
    }

    this.filteredCards = list;

    if (resetIndex || this.currentIndex >= this.filteredCards.length) {
      this.currentIndex = 0;
      this.history = [];
    }
  }

  #shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  setFilterType(type) {
    this.filterType = type;
    this.applyFilters(true);
  }

  setFilterIntensity(intensity) {
    this.filterIntensity = intensity;
    this.applyFilters(true);
  }

  setSearchQuery(query) {
    this.searchQuery = query;
    this.applyFilters(true);
  }

  setOrderMode(mode) {
    this.orderMode = mode;
    this.applyFilters(true);
  }

  nextCard() {
    if (this.filteredCards.length === 0) return;
    this.history.push(this.currentIndex);
    if (this.currentIndex < this.filteredCards.length - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0;
    }
  }

  prevCard() {
    if (this.filteredCards.length === 0) return;
    if (this.history.length > 0) {
      this.currentIndex = this.history.pop();
    } else if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.filteredCards.length - 1;
    }
  }

  jumpToIndex(index) {
    if (this.filteredCards.length === 0) return;
    const clean = Math.max(0, Math.min(this.filteredCards.length - 1, Number(index) || 0));
    this.history.push(this.currentIndex);
    this.currentIndex = clean;
  }

  jumpToCardId(cardId) {
    const idx = this.filteredCards.findIndex((c) => String(c.id) === String(cardId));
    if (idx >= 0) {
      this.history.push(this.currentIndex);
      this.currentIndex = idx;
      return true;
    }
    return false;
  }

  randomCard() {
    if (this.filteredCards.length <= 1) return;
    let nextIdx = this.currentIndex;
    while (nextIdx === this.currentIndex) {
      nextIdx = Math.floor(Math.random() * this.filteredCards.length);
    }
    this.history.push(this.currentIndex);
    this.currentIndex = nextIdx;
  }

  startEdit(card = null) {
    const target = card || this.currentCard;
    if (!target) return;
    this.isEditing = true;
    this.isNewCard = false;
    this.editingCard = JSON.parse(JSON.stringify(target));
  }

  startCreateNew() {
    this.isEditing = true;
    this.isNewCard = true;

    // Calcular siguiente ID único
    const maxNumId = this.allCards.reduce((max, c) => {
      const n = Number(c.id);
      return Number.isFinite(n) && n > max ? n : max;
    }, 0);
    const newId = maxNumId > 0 ? maxNumId + 1 : `custom_${Date.now()}`;

    const defaultTipo = this.filterType !== 'all' ? this.filterType : 'clásico';

    this.editingCard = {
      id: newId,
      tipo: defaultTipo,
      texto: 'Escribe el texto de tu pregunta o reto aquí... [player]',
      resp: '',
      intensidad: 5,
      participantes: 'uno',
      min_jugadores: 2,
      castigo: 'medio trago',
      especial: false,
      consentimiento: defaultTipo === 'hot',
      isCustom: true
    };

    if (defaultTipo === 'eventos especiales') {
      this.editingCard['duración_turno'] = 3;
      this.editingCard.regla = 'Regla del evento grupal aquí...';
      this.editingCard.penitencia_social = 'Penitencia social sin alcohol aquí...';
      this.editingCard.participacion_obligatoria = true;
      this.editingCard.participantes = 'grupo';
      this.editingCard.especial = true;
    } else if (defaultTipo === 'bonus') {
      this.editingCard.subtipo = 'bonus_single';
      this.editingCard.isBonus = true;
      this.editingCard.especial = true;
    }
  }

  updateEditingCard(patch = {}) {
    if (!this.editingCard) return;
    this.editingCard = { ...this.editingCard, ...patch };

    // Si cambia el tipo, ajustar parámetros específicos
    if (patch.tipo) {
      if (patch.tipo === 'hot') {
        this.editingCard.consentimiento = true;
      } else if (patch.tipo === 'eventos especiales') {
        this.editingCard.participantes = 'grupo';
        this.editingCard.especial = true;
        this.editingCard['duración_turno'] = this.editingCard['duración_turno'] || 3;
        this.editingCard.regla = this.editingCard.regla || 'Regla del evento grupal';
        this.editingCard.penitencia_social = this.editingCard.penitencia_social || 'Penitencia alternativa';
        this.editingCard.participacion_obligatoria = true;
      } else if (patch.tipo === 'bonus') {
        this.editingCard.isBonus = true;
        this.editingCard.especial = true;
        this.editingCard.subtipo = this.editingCard.subtipo || 'bonus_single';
      }
    }
  }

  cancelEdit() {
    this.isEditing = false;
    this.editingCard = null;
    this.isNewCard = false;
  }

  saveEdit() {
    if (!this.editingCard) return false;
    const card = { ...this.editingCard };

    // Sanitización
    card.texto = (card.texto || '').trim();
    card.intensidad = Math.max(1, Math.min(10, Math.round(Number(card.intensidad) || 1)));
    card.min_jugadores = Math.max(2, Math.min(24, Math.round(Number(card.min_jugadores) || 2)));
    card.especial = Boolean(card.especial);

    if (card.resp) {
      card.resp = String(card.resp).trim();
      // Si tiene resp y el texto no incluye [?], añadimos [?] al final
      if (card.resp && !card.texto.includes('[?]')) {
        card.texto = `${card.texto} [?]`;
      }
    } else {
      delete card.resp;
      delete card.respuesta;
    }

    if (this.isNewCard) {
      card.isCustom = true;
    }

    saveCardOverride(this.deckId, card);
    this.refreshCardsWithOverrides();
    this.applyFilters(false);

    // Seleccionar la carta recién editada o creada
    this.jumpToCardId(card.id);

    this.isEditing = false;
    this.editingCard = null;
    this.isNewCard = false;
    return true;
  }

  deleteCurrentCard() {
    const card = this.currentCard;
    if (!card) return false;
    deleteCardOverride(this.deckId, card.id);
    this.refreshCardsWithOverrides();
    this.applyFilters(false);
    this.isEditing = false;
    this.editingCard = null;
    return true;
  }

  resetCurrentDeck() {
    resetDeckOverrides(this.deckId);
    this.refreshCardsWithOverrides();
    this.applyFilters(true);
    this.isEditing = false;
    this.editingCard = null;
  }

  openExport(format = 'json') {
    this.exportFormat = format;
    this.exportModalOpen = true;
    const deckInfo = this.currentDeckInfo;
    if (format === 'js') {
      this.exportContent = exportDeckJs(this.allCards, deckInfo.locale || 'es-CO');
      this.exportFilename = `previa-mix.${deckInfo.locale || 'es-CO'}.js`;
    } else {
      this.exportContent = exportDeckJson(this.allCards);
      this.exportFilename = `cartas_${this.deckId.replace(':', '_')}.json`;
    }
  }

  closeExport() {
    this.exportModalOpen = false;
    this.exportContent = '';
  }
}

export const editorController = new EditorController();

