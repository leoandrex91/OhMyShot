/**
 * Oh My Shot! — Card Editor Storage & Persistence
 * Gestiona el guardado de modificaciones locales, cartas nuevas y exportaciones.
 */

const STORAGE_KEY = 'oms_editor_overrides_v1';

function readAllStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.warn('[Card Editor] No se pudo leer el almacenamiento local:', err);
    return {};
  }
}

function writeAllStorage(data) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('[Card Editor] No se pudo persistir en almacenamiento local:', err);
  }
}

export function loadDeckOverrides(deckKey) {
  const all = readAllStorage();
  const entry = all[deckKey] || {};
  return {
    modified: entry.modified && typeof entry.modified === 'object' ? entry.modified : {},
    created: Array.isArray(entry.created) ? entry.created : [],
    deleted: Array.isArray(entry.deleted) ? entry.deleted : []
  };
}

export function saveCardOverride(deckKey, card) {
  const all = readAllStorage();
  const current = all[deckKey] || { modified: {}, created: [], deleted: [] };
  const modified = current.modified || {};
  const created = current.created || [];
  const deleted = (current.deleted || []).filter((id) => String(id) !== String(card.id));

  const isCustom = Boolean(card.isCustom) || String(card.id).startsWith('custom_');

  if (isCustom) {
    const existingIdx = created.findIndex((c) => String(c.id) === String(card.id));
    if (existingIdx >= 0) {
      created[existingIdx] = { ...card, isCustom: true };
    } else {
      created.push({ ...card, isCustom: true });
    }
  } else {
    modified[card.id] = { ...card };
  }

  all[deckKey] = { modified, created, deleted };
  writeAllStorage(all);
}

export function deleteCardOverride(deckKey, cardId) {
  const all = readAllStorage();
  const current = all[deckKey] || { modified: {}, created: [], deleted: [] };
  const modified = { ...(current.modified || {}) };
  delete modified[cardId];

  let created = (current.created || []).filter((c) => String(c.id) !== String(cardId));
  const deleted = Array.from(new Set([...(current.deleted || []), cardId]));

  all[deckKey] = { modified, created, deleted };
  writeAllStorage(all);
}

export function resetDeckOverrides(deckKey) {
  const all = readAllStorage();
  delete all[deckKey];
  writeAllStorage(all);
}

export function applyOverridesToCards(deckKey, baseCards = []) {
  const { modified, created, deleted } = loadDeckOverrides(deckKey);
  const deletedSet = new Set(deleted.map(String));

  // Aplicar modificaciones y exclusiones
  const working = baseCards
    .filter((c) => !deletedSet.has(String(c.id)))
    .map((c) => {
      const mod = modified[c.id];
      if (mod) {
        return { ...c, ...mod };
      }
      return { ...c };
    });

  // Agregar cartas creadas por el usuario
  for (const newCard of created) {
    if (!deletedSet.has(String(newCard.id))) {
      working.push({ ...newCard, isCustom: true });
    }
  }

  // Preservar metadatos y listas de castigos del array base
  if (baseCards.castigos_toma) working.castigos_toma = baseCards.castigos_toma;
  if (baseCards.castigos_notoma) working.castigos_notoma = baseCards.castigos_notoma;
  if (baseCards.verdadCards) working.verdadCards = baseCards.verdadCards;
  if (baseCards.retoCards) working.retoCards = baseCards.retoCards;
  if (baseCards.retosEspecialesCards) working.retosEspecialesCards = baseCards.retosEspecialesCards;
  if (baseCards.bonusCards) working.bonusCards = baseCards.bonusCards;

  return working;
}

export function exportDeckJson(cards) {
  return JSON.stringify(cards, null, 2);
}

export function exportDeckJs(cards, locale = 'es-CO') {
  const json = JSON.stringify(cards, null, 2);
  return `export const locale = ${JSON.stringify(locale)};\nexport const questions = ${json};\n`;
}

