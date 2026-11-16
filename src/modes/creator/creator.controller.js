/**
 * Oh My Shot! — Card Creator Controller
 * Controlador de la vista de colección, creación, edición, borrado, importación y exportación de cartas.
 */

import {
  MAX_CUSTOM_CARDS,
  clearAllCustomCards,
  deleteCustomCard,
  exportCustomCardsJson,
  getCustomCards,
  importCustomCardsJson,
  saveCustomCard
} from '../../core/customCards.js';

export class CreatorController {
  constructor() {
    this.cards = [];
    this.filterType = 'all';
    this.filterIntensity = 'all';
    this.searchQuery = '';
    this.isModalOpen = false;
    this.isCreatingNew = false;
    this.editingCard = null;
    this.deleteConfirmCardId = null;
    this.clearConfirmOpen = false;
    this.importModalOpen = false;
    this.exportModalOpen = false;
    this.exportContent = '';
    this.exportFilename = 'oh-my-shot-cartas-personalizadas.json';
  }

  init() {
    this.cards = getCustomCards();
    this.isModalOpen = false;
    this.isCreatingNew = false;
    this.editingCard = null;
    this.deleteConfirmCardId = null;
    this.clearConfirmOpen = false;
    this.importModalOpen = false;
    this.exportModalOpen = false;
  }

  get totalCards() {
    return this.cards.length;
  }

  get maxCards() {
    return MAX_CUSTOM_CARDS;
  }

  get isAtLimit() {
    return this.cards.length >= MAX_CUSTOM_CARDS;
  }

  getFilteredCards() {
    let list = [...this.cards];

    if (this.filterType !== 'all') {
      list = list.filter((c) => c.tipo === this.filterType);
    }

    if (this.filterIntensity !== 'all') {
      const targetInt = Number(this.filterIntensity);
      list = list.filter((c) => c.intensidad === targetInt);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter((c) => (c.texto || '').toLowerCase().includes(q) || (c.tipo || '').toLowerCase().includes(q));
    }

    return list;
  }

  startCreate() {
    if (this.isAtLimit) {
      return { ok: false, error: 'LIMIT_REACHED' };
    }
    this.isCreatingNew = true;
    this.editingCard = {
      id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      tipo: 'clásico',
      intensidad: 5,
      texto: '',
      castigo: 'Quien pierda [castigo_toma{1-3} || castigo_notoma{x}].',
      participantes: 'uno',
      min_jugadores: 2,
      especial: false,
      isCustom: true
    };
    this.isModalOpen = true;
    return { ok: true };
  }

  startEdit(cardId) {
    const found = this.cards.find((c) => String(c.id) === String(cardId));
    if (!found) return { ok: false, error: 'NOT_FOUND' };

    this.isCreatingNew = false;
    this.editingCard = { ...found };
    this.isModalOpen = true;
    return { ok: true, card: this.editingCard };
  }

  updateEditingCard(partial = {}) {
    if (!this.editingCard) return;
    this.editingCard = {
      ...this.editingCard,
      ...partial
    };
  }

  saveEdit(overrideData = null) {
    if (overrideData && this.editingCard) {
      this.editingCard = { ...this.editingCard, ...overrideData };
    }
    if (!this.editingCard) return { ok: false, error: 'NO_ACTIVE_CARD' };
    const res = saveCustomCard(this.editingCard);
    if (res.ok) {
      this.cards = getCustomCards();
      this.isModalOpen = false;
      this.editingCard = null;
      this.isCreatingNew = false;
    }
    return res;
  }

  closeAllModals() {
    this.isModalOpen = false;
    this.editingCard = null;
    this.isCreatingNew = false;
    this.deleteConfirmCardId = null;
    this.clearConfirmOpen = false;
    this.importModalOpen = false;
    this.exportModalOpen = false;
  }

  cancelEdit() {
    this.isModalOpen = false;
    this.editingCard = null;
    this.isCreatingNew = false;
  }

  openDeleteConfirm(cardId) {
    this.startDelete(cardId);
  }

  startDelete(cardId) {
    this.deleteConfirmCardId = String(cardId);
  }

  cancelDeleteConfirm() {
    this.cancelDelete();
  }

  cancelDelete() {
    this.deleteConfirmCardId = null;
  }

  confirmDelete() {
    if (!this.deleteConfirmCardId) return { ok: false };
    const res = deleteCustomCard(this.deleteConfirmCardId);
    this.cards = getCustomCards();
    this.deleteConfirmCardId = null;
    return res;
  }

  openClearConfirm() {
    this.startClearAll();
  }

  startClearAll() {
    this.clearConfirmOpen = true;
  }

  cancelClearConfirm() {
    this.cancelClearAll();
  }

  cancelClearAll() {
    this.clearConfirmOpen = false;
  }

  confirmClearAll() {
    clearAllCustomCards();
    this.cards = getCustomCards();
    this.clearConfirmOpen = false;
  }

  importFromJsonString(str) {
    return this.importJson(str);
  }

  openExport() {
    this.exportContent = exportCustomCardsJson();
    this.exportFilename = `oh-my-shot-cartas-personalizadas-${new Date().toISOString().slice(0, 10)}.json`;
    this.exportModalOpen = true;
  }

  closeExport() {
    this.exportModalOpen = false;
    this.exportContent = '';
  }

  openImport() {
    this.importModalOpen = true;
  }

  closeImport() {
    this.importModalOpen = false;
  }

  importJson(textOrObject) {
    const res = importCustomCardsJson(textOrObject);
    if (res.ok) {
      this.cards = getCustomCards();
      this.importModalOpen = false;
    }
    return res;
  }

  setFilterType(val) {
    this.filterType = val;
  }

  setFilterIntensity(val) {
    this.filterIntensity = val;
  }

  setSearchQuery(val) {
    this.searchQuery = val;
  }
}

export const creatorController = new CreatorController();
