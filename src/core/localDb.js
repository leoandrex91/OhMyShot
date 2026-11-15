/**
 * Base de datos local 100% en navegador con IndexedDB (`oms_local_db_v1`).
 * Garantiza persistencia offline de jugadores, configuracion y estadisticas de partida
 * en Android, iPhone (Safari PWA) y PC sin ningun servicio externo.
 */

const DB_NAME = 'oms_local_db_v1';
const DB_VERSION = 1;

export const STORE_PLAYERS = 'players';
export const STORE_SETTINGS = 'settings';
export const STORE_SESSION_STATS = 'session_stats';

const SETTINGS_RECORD_KEY = 'app_settings';
const MAX_SESSION_EVENTS = 50;

let openDbPromise = null;

function openDatabase() {
  if (openDbPromise) return openDbPromise;

  if (typeof indexedDB === 'undefined') {
    return Promise.resolve(null);
  }

  openDbPromise = new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target?.result;
        if (!db) return;
        if (!db.objectStoreNames.contains(STORE_PLAYERS)) {
          db.createObjectStore(STORE_PLAYERS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
          db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(STORE_SESSION_STATS)) {
          db.createObjectStore(STORE_SESSION_STATS, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        const db = event.target?.result || null;
        if (db) {
          db.onversionchange = () => {
            db.close();
            openDbPromise = null;
          };
        }
        resolve(db);
      };

      request.onerror = () => {
        openDbPromise = null;
        resolve(null);
      };

      request.onblocked = () => {
        openDbPromise = null;
        resolve(null);
      };
    } catch {
      openDbPromise = null;
      resolve(null);
    }
  });

  return openDbPromise;
}

function requestToPromise(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export const localDb = {
  async init() {
    const db = await openDatabase();
    return Boolean(db);
  },

  async loadAll() {
    const db = await openDatabase();
    if (!db) return { players: null, settings: null };

    try {
      const tx = db.transaction([STORE_PLAYERS, STORE_SETTINGS], 'readonly');
      const playersStore = tx.objectStore(STORE_PLAYERS);
      const settingsStore = tx.objectStore(STORE_SETTINGS);

      const [rawPlayers, settingsDoc] = await Promise.all([
        requestToPromise(playersStore.getAll()),
        requestToPromise(settingsStore.get(SETTINGS_RECORD_KEY))
      ]);

      const players = Array.isArray(rawPlayers)
        ? [...rawPlayers].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        : [];

      return {
        players,
        settings: settingsDoc || null
      };
    } catch {
      return { players: null, settings: null };
    }
  },

  async savePlayers(players) {
    const db = await openDatabase();
    if (!db || !Array.isArray(players)) return false;

    try {
      const tx = db.transaction(STORE_PLAYERS, 'readwrite');
      const storeObj = tx.objectStore(STORE_PLAYERS);
      storeObj.clear();
      players.forEach((player, idx) => {
        if (!player?.id) return;
        storeObj.put({
          ...player,
          order: idx
        });
      });

      return await new Promise((resolve) => {
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
        tx.onabort = () => resolve(false);
      });
    } catch {
      return false;
    }
  },

  async saveSettings(settings) {
    const db = await openDatabase();
    if (!db || !settings) return false;

    try {
      const tx = db.transaction(STORE_SETTINGS, 'readwrite');
      const storeObj = tx.objectStore(STORE_SETTINGS);
      storeObj.put({
        ...settings,
        key: SETTINGS_RECORD_KEY,
        updatedAt: Date.now()
      });

      return await new Promise((resolve) => {
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
        tx.onabort = () => resolve(false);
      });
    } catch {
      return false;
    }
  },

  async recordSessionEvent(event = {}) {
    const db = await openDatabase();
    if (!db) return false;

    try {
      const tx = db.transaction(STORE_SESSION_STATS, 'readwrite');
      const storeObj = tx.objectStore(STORE_SESSION_STATS);
      const allReq = storeObj.getAll();
      allReq.onsuccess = () => {
        const existing = Array.isArray(allReq.result) ? allReq.result : [];
        if (existing.length >= MAX_SESSION_EVENTS) {
          existing.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
          const toDelete = existing.slice(0, existing.length - MAX_SESSION_EVENTS + 1);
          for (const item of toDelete) {
            if (item?.id) storeObj.delete(item.id);
          }
        }
        storeObj.put({
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          createdAt: Date.now(),
          ...event
        });
      };

      return await new Promise((resolve) => {
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  }
};

