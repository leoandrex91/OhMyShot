/**
 * Oh My Shot! — Gestor de Cartas Personalizadas (Custom Cards)
 * Almacenamiento local persistente con límite máximo de 500 cartas.
 * Permite crear, editar, borrar, exportar e importar cartas creadas por los usuarios.
 */

export const CUSTOM_CARDS_STORAGE_KEY = 'oms_custom_cards_v1';
export const MAX_CUSTOM_CARDS = 500;

export const CUSTOM_CARD_CATEGORIES = Object.freeze([
  { id: 'clásico', label: 'Clásico', icon: '🍻' },
  { id: 'yo nunca', label: 'Yo nunca', icon: '🙈' },
  { id: 'quien es más probable', label: '¿Quién es más probable?', icon: '👑' },
  { id: 'reto', label: 'Reto', icon: '⚡' },
  { id: 'verdad', label: 'Verdad', icon: '💬' },
  { id: 'duelo', label: 'Duelo', icon: '⚔️' },
  { id: 'hot', label: 'Hot +18', icon: '🔥' },
  { id: 'bonus', label: 'Bonus', icon: '🎁' },
  { id: 'eventos especiales', label: 'Evento especial', icon: '⭐' }
]);

function readCustomCardsRaw() {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_CARDS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[Custom Cards] Error leyendo de localStorage:', err);
    return [];
  }
}

function writeCustomCardsRaw(cards) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const safeSlice = Array.isArray(cards) ? cards.slice(0, MAX_CUSTOM_CARDS) : [];
    window.localStorage.setItem(CUSTOM_CARDS_STORAGE_KEY, JSON.stringify(safeSlice));
  } catch (err) {
    console.warn('[Custom Cards] Error guardando en localStorage:', err);
  }
}

/**
 * Normaliza y valida una carta personalizada.
 */
export function normalizeCustomCard(raw = {}) {
  const id = String(raw.id || `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
  const texto = String(raw.texto || raw.prompt || '').trim();
  const intensidad = Math.min(10, Math.max(1, Math.round(Number(raw.intensidad) || 5)));
  let tipo = String(raw.tipo || 'clásico').toLowerCase().trim();
  if (tipo === 'clasico') tipo = 'clásico';
  const subtipo = raw.subtipo ? String(raw.subtipo).trim() : null;
  const castigo = String(raw.castigo || 'medio trago').trim();
  const participantes = ['uno', 'duo', 'trio', 'grupo'].includes(String(raw.participantes).toLowerCase())
    ? String(raw.participantes).toLowerCase()
    : 'uno';
  const min_jugadores = Math.min(8, Math.max(2, Math.round(Number(raw.min_jugadores) || 2)));
  const createdAt = Number(raw.createdAt) || Date.now();
  const updatedAt = Number(raw.updatedAt) || Date.now();

  return {
    id,
    texto,
    intensidad,
    tipo,
    subtipo,
    castigo,
    participantes,
    min_jugadores,
    especial: Boolean(raw.especial || tipo === 'bonus' || tipo === 'eventos especiales'),
    isCustom: true,
    createdAt,
    updatedAt
  };
}

/**
 * Obtiene todas las cartas personalizadas guardadas.
 * @returns {Array} Lista de cartas ordenadas por fecha de actualización desc.
 */
export function getCustomCards() {
  const rawList = readCustomCardsRaw();
  return rawList.map(normalizeCustomCard).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

/**
 * Guarda o actualiza una carta personalizada.
 * Respeta el límite de 500 cartas.
 * @param {Object} cardData
 * @returns {{ ok: boolean, card?: Object, error?: string, total: number }}
 */
export function saveCustomCard(cardData = {}) {
  const cards = getCustomCards();
  const normalized = normalizeCustomCard(cardData);

  if (!normalized.texto) {
    return { ok: false, error: 'EMPTY_TEXT', total: cards.length };
  }

  const existingIdx = cards.findIndex((c) => String(c.id) === String(normalized.id));

  if (existingIdx >= 0) {
    // Actualización de carta existente
    normalized.createdAt = cards[existingIdx].createdAt || normalized.createdAt;
    normalized.updatedAt = Date.now();
    cards[existingIdx] = normalized;
    writeCustomCardsRaw(cards);
    return { ok: true, card: normalized, total: cards.length };
  }

  // Creación de carta nueva: verificar límite
  if (cards.length >= MAX_CUSTOM_CARDS) {
    return { ok: false, error: 'LIMIT_REACHED', total: cards.length };
  }

  normalized.createdAt = Date.now();
  normalized.updatedAt = Date.now();
  cards.unshift(normalized);
  writeCustomCardsRaw(cards);

  return { ok: true, card: normalized, total: cards.length };
}

/**
 * Elimina una carta personalizada por su ID.
 * @param {string} cardId
 * @returns {{ ok: boolean, total: number }}
 */
export function deleteCustomCard(cardId) {
  const cards = getCustomCards();
  const filtered = cards.filter((c) => String(c.id) !== String(cardId));
  writeCustomCardsRaw(filtered);
  return { ok: true, total: filtered.length };
}

/**
 * Borra todas las cartas personalizadas.
 */
export function clearAllCustomCards() {
  writeCustomCardsRaw([]);
  return { ok: true, total: 0 };
}

/**
 * Exporta la colección de cartas a un string JSON formateado y descargable.
 */
export function exportCustomCardsJson() {
  const cards = getCustomCards();
  const payload = {
    app: 'Oh My Shot!',
    type: 'custom_cards_collection',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    total: cards.length,
    cards
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Importa cartas desde un string JSON o un objeto array.
 * Une con las existentes sin duplicar IDs y respeta el límite máximo de 500 cartas.
 * @param {string|Object} rawInput
 * @returns {{ ok: boolean, imported: number, total: number, error?: string, limitCapped: boolean }}
 */
export function importCustomCardsJson(rawInput) {
  let parsed;
  try {
    if (typeof rawInput === 'string') {
      parsed = JSON.parse(rawInput);
    } else {
      parsed = rawInput;
    }
  } catch (err) {
    return { ok: false, error: 'INVALID_JSON', imported: 0, total: getCustomCards().length, limitCapped: false };
  }

  const incomingCards = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.cards)
      ? parsed.cards
      : null;

  if (!incomingCards || incomingCards.length === 0) {
    return { ok: false, error: 'NO_CARDS_FOUND', imported: 0, total: getCustomCards().length, limitCapped: false };
  }

  const currentCards = getCustomCards();
  const currentIds = new Set(currentCards.map((c) => String(c.id)));
  let importedCount = 0;
  let limitCapped = false;

  for (const raw of incomingCards) {
    if (currentCards.length >= MAX_CUSTOM_CARDS) {
      limitCapped = true;
      break;
    }

    const norm = normalizeCustomCard(raw);
    if (!norm.texto) continue;

    if (currentIds.has(String(norm.id))) {
      // Reemplaza o actualiza existente
      const idx = currentCards.findIndex((c) => String(c.id) === String(norm.id));
      if (idx >= 0) {
        currentCards[idx] = norm;
        importedCount++;
      }
    } else {
      // Nueva carta
      currentCards.push(norm);
      currentIds.add(String(norm.id));
      importedCount++;
    }
  }

  writeCustomCardsRaw(currentCards);
  return {
    ok: true,
    imported: importedCount,
    total: currentCards.length,
    limitCapped
  };
}

/**
 * Obtiene las cartas personalizadas compatibles con un modo de juego dado.
 * @param {string} modeId
 * @param {Object} options
 * @returns {Array}
 */
export function getCustomCardsForMode(modeId, { enabledTypes = null, minIntensity = 1, maxIntensity = 10 } = {}) {
  const all = getCustomCards();
  const minI = Math.min(10, Math.max(1, Number(minIntensity) || 1));
  const maxI = Math.min(10, Math.max(minI, Number(maxIntensity) || 10));

  return all.filter((c) => {
    // Comprobación de intensidad dentro del rango configurado
    if (c.intensidad < minI || c.intensidad > maxI) return false;

    // Filtro por modo
    if (modeId === 'yo-nunca') {
      return c.tipo === 'yo nunca';
    }
    if (modeId === 'quien') {
      return c.tipo === 'quien es más probable';
    }
    if (modeId === 'verdad-o-reto') {
      const allowed = Array.isArray(enabledTypes) && enabledTypes.length > 0
        ? enabledTypes
        : ['verdad', 'reto', 'bonus'];
      return allowed.includes(c.tipo);
    }
    if (modeId === 'previa-mix') {
      if (Array.isArray(enabledTypes) && enabledTypes.length > 0) {
        const normTypes = enabledTypes.map((t) => (t === 'clasico' ? 'clásico' : t));
        return normTypes.includes(c.tipo) || (c.tipo === 'clásico' && normTypes.includes('clasico'));
      }
      return true;
    }
    return true;
  });
}
