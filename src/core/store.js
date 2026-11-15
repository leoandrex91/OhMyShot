import { MAX_PLAYERS, PLAYER_AVATARS, PLAYER_COLORS } from '../config/constants.js';
import { detectDeviceLocale, localeToBaseLang, normalizeSupportedLocale } from './i18n.js';
import { normalizePreviaMixConfig } from '../modes/previa-mix/adapter.js';
import { localDb } from './localDb.js';

const CLIENT_ID_KEY = 'oms_tab_client_id_v1';
const PROFILE_KEY = 'oms_tab_profile_v1';
const ROOM_KEY = 'oms_tab_active_room_v1';
const LOCAL_PLAYERS_KEY = 'oms_local_players_v1';
const LOCAL_SETTINGS_KEY = 'oms_local_settings_v1';
const LOCAL_PREVIA_MIX_CONFIG_KEY = 'oms_previa_mix_config_v3';
const LOCAL_YO_NUNCA_CONFIG_KEY = 'oms_yo_nunca_config_v1';
const LOCAL_QUIEN_CONFIG_KEY = 'oms_quien_config_v1';
const LOCAL_VERDAD_O_RETO_CONFIG_KEY = 'oms_verdad_o_reto_config_v1';

function loadSimpleModeConfig(key, defaultTurns = 45) {
  const saved = loadJsonStorage(window.localStorage, key, null);
  return {
    bonusEnabled: saved?.bonusEnabled !== false,
    customCardsEnabled: saved?.customCardsEnabled !== false,
    targetTurns: Math.max(5, Math.min(900, Number(saved?.targetTurns) || defaultTurns))
  };
}

function loadVorConfig(key, defaultTurns = 45) {
  const saved = loadJsonStorage(window.localStorage, key, null);
  return {
    turnOrder: saved?.turnOrder === 'aleatorio' ? 'aleatorio' : 'secuencial',
    maxConsecutiveTruths:
      typeof saved?.maxConsecutiveTruths === 'number'
        ? Math.max(0, Math.min(10, Math.round(saved.maxConsecutiveTruths)))
        : 3,
    bonusEnabled: saved?.bonusEnabled !== false,
    customCardsEnabled: saved?.customCardsEnabled !== false,
    targetTurns: Math.max(5, Math.min(900, Number(saved?.targetTurns) || defaultTurns))
  };
}

function persistSimpleModeConfig(key, config) {
  try {
    window.localStorage.setItem(key, JSON.stringify(config));
  } catch {
    // ignore
  }
}

function createUuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getOrCreateClientId() {
  let id = window.sessionStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = createUuid();
    window.sessionStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

function loadJsonStorage(storage, key, fallback) {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeAvatarSrc(value, fallbackIdx = 0) {
  const str = String(value || '');
  if (str.startsWith('./assets/imgs/avatars/') && str.endsWith('.webp')) {
    return str;
  }
  return PLAYER_AVATARS[fallbackIdx % PLAYER_AVATARS.length];
}

function loadSavedProfile() {
  const saved = loadJsonStorage(window.sessionStorage, PROFILE_KEY, null);
  if (saved) {
    return {
      ...saved,
      avatarEmoji: normalizeAvatarSrc(saved.avatarEmoji, 0)
    };
  }
  const randomIdx = Math.floor(Math.random() * PLAYER_AVATARS.length);
  return {
    name: '',
    avatarEmoji: PLAYER_AVATARS[randomIdx],
    avatarColor: PLAYER_COLORS[randomIdx % PLAYER_COLORS.length]
  };
}

function loadLocalPlayers() {
  const saved = loadJsonStorage(window.localStorage, LOCAL_PLAYERS_KEY, null);
  if (Array.isArray(saved)) {
    return saved.slice(0, MAX_PLAYERS).map((p, idx) => ({
      ...p,
      avatarEmoji: normalizeAvatarSrc(p.avatarEmoji, idx),
      drinksAlcohol: p.drinksAlcohol !== false
    }));
  }
  return [];
}

function clampVolume(value, fallback = 80) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(0, Math.min(100, Math.round(num)));
}

function normalizeTextScaleMode(rawMode, settingsVersion) {
  if (rawMode === 'xl') return 'large';
  if (rawMode === 'normal') return 'normal';
  if (rawMode === 'large' && Number(settingsVersion) >= 2) return 'large';
  return 'normal';
}

function normalizeAgeGateStatus(rawStatus) {
  if (rawStatus === 'adult' || rawStatus === true) return 'adult';
  if (rawStatus === 'minor' || rawStatus === false) return 'minor';
  return null;
}

function loadLocalSettings() {
  const saved = loadJsonStorage(window.localStorage, LOCAL_SETTINGS_KEY, null);
  const sfxVolume = clampVolume(
    saved?.sfxVolume !== undefined ? saved.sfxVolume : saved?.soundEnabled === false ? 0 : 80,
    80
  );
  const musicVolume = clampVolume(saved?.musicVolume, 50);
  const textScaleMode = normalizeTextScaleMode(saved?.textScaleMode, saved?.settingsVersion);
  const rawLocale = saved?.locale || saved?.lang || detectDeviceLocale();
  const locale = normalizeSupportedLocale(rawLocale);
  const lang = localeToBaseLang(locale);
  const ageGateStatus = normalizeAgeGateStatus(saved?.ageGateStatus);
  const startFullscreen = saved?.startFullscreen !== false;
  return {
    progressiveCurve: saved?.progressiveCurve !== false,
    minIntensity: Math.min(10, Math.max(1, Math.round(Number(saved?.minIntensity) || 1))),
    maxIntensity: Math.min(10, Math.max(1, Math.round(Number(saved?.maxIntensity) || 10))),
    textScaleMode, // 'normal' | 'large' (GRANDE)
    locale,
    lang,
    ageGateStatus,
    startFullscreen,
    musicVolume,
    sfxVolume,
    settingsVersion: 3,
    alcoholMode: true
  };
}

function loadPreviaMixConfig(appLang = 'es', appLocale = 'es-CO', ageGateStatus = null) {
  const saved = loadJsonStorage(window.localStorage, LOCAL_PREVIA_MIX_CONFIG_KEY, null);
  const isAdult = ageGateStatus === 'adult';
  const savedHotOn = isAdult && Boolean(saved?.enableHot);
  const baseTypes = Array.isArray(saved?.enabledTypes) ? saved.enabledTypes : undefined;
  const hasBonusInitialized = saved?.bonusInitialized === true;
  let enabledTypes = baseTypes;
  if (baseTypes && !hasBonusInitialized && !baseTypes.includes('bonus')) {
    enabledTypes = [...baseTypes, 'bonus'];
  }
  if (enabledTypes && !isAdult) {
    enabledTypes = enabledTypes.filter((t) => t !== 'hot');
  }

  return normalizePreviaMixConfig(
    {
      ...(saved || {}),
      ...(enabledTypes ? { enabledTypes } : {}),
      locale: appLocale,
      localeAutoSynced: true,
      enableHot: savedHotOn,
      adultsConfirmed: savedHotOn,
      everyoneConsentsHot: savedHotOn
    },
    { appLang, appLocale }
  );
}

function persistPreviaMixConfig(config, ageGateStatus = null) {
  try {
    const canKeepHot = ageGateStatus === 'adult' && Boolean(config.enableHot);
    const safeToPersist = {
      ...config,
      bonusInitialized: true,
      enabledTypes: canKeepHot
        ? config.enabledTypes || []
        : (config.enabledTypes || []).filter((t) => t !== 'hot'),
      enableHot: canKeepHot,
      adultsConfirmed: canKeepHot,
      everyoneConsentsHot: canKeepHot
    };
    window.localStorage.setItem(LOCAL_PREVIA_MIX_CONFIG_KEY, JSON.stringify(safeToPersist));
  } catch {
    // ignore quota errors
  }
}

const initialSettings = loadLocalSettings();
const initialPreviaMixConfig = loadPreviaMixConfig(
  initialSettings.lang || 'es',
  initialSettings.locale || 'es-CO',
  initialSettings.ageGateStatus
);

const state = {
  clientId: getOrCreateClientId(),
  screen: 'splash', // 'splash' | 'home' | 'players' | 'menu' | 'instructions' | 'play'
  splashProgress: 0,
  locale: initialSettings.locale || 'es-CO',
  lang: initialSettings.lang || 'es',
  ageGateStatus: initialSettings.ageGateStatus || null,
  startFullscreen: initialSettings.startFullscreen !== false,
  textScaleMode: initialSettings.textScaleMode || 'normal',
  musicVolume: initialSettings.musicVolume ?? 50,
  sfxVolume: initialSettings.sfxVolume ?? 80,
  soundEnabled: (initialSettings.sfxVolume ?? 80) > 0,
  wakeLockActive: false,
  connectionMode: 'local', // 'local' | 'demo' | 'live'

  // Fase 1: Jugadores locales (2..32) y sesion de juego
  localPlayers: loadLocalPlayers(),
  alcoholMode: initialSettings.alcoholMode !== false,
  progressiveCurve: initialSettings.progressiveCurve !== false,
  minIntensity: initialSettings.minIntensity ?? 1,
  maxIntensity: initialSettings.maxIntensity ?? 10,
  activeGameModeId: 'classic',
  previaMixConfig: initialPreviaMixConfig,
  yoNuncaConfig: loadSimpleModeConfig(LOCAL_YO_NUNCA_CONFIG_KEY, 45),
  quienConfig: loadSimpleModeConfig(LOCAL_QUIEN_CONFIG_KEY, 45),
  verdadORetoConfig: loadVorConfig(LOCAL_VERDAD_O_RETO_CONFIG_KEY, 45),
  localGame: {
    modeId: 'classic',
    session: null,
    skippedCount: 0,
    lastOptionalNotice: null,
    lastSocialForfeitNotice: null
  },

  // Base multiroom preservada para Fase 4
  profile: loadSavedProfile(),
  selectedMode: 'deck',
  room: null,
  players: [],
  savedRoomRef: loadJsonStorage(window.sessionStorage, ROOM_KEY, null),
  lastDiceResult: null
};

const listeners = new Set();

function buildSettingsSnapshot() {
  return {
    settingsVersion: 3,
    alcoholMode: state.alcoholMode,
    progressiveCurve: state.progressiveCurve,
    minIntensity: state.minIntensity,
    maxIntensity: state.maxIntensity,
    textScaleMode: state.textScaleMode,
    locale: state.locale,
    lang: state.lang,
    ageGateStatus: state.ageGateStatus,
    startFullscreen: state.startFullscreen !== false,
    musicVolume: state.musicVolume,
    sfxVolume: state.sfxVolume
  };
}

function sanitizePlayersList(list) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, MAX_PLAYERS).map((p, idx) => ({
    id: String(p.id || createUuid()),
    name: String(p.name || '').trim().slice(0, 22) || `Jugador ${idx + 1}`,
    avatarEmoji: normalizeAvatarSrc(p.avatarEmoji, idx),
    avatarColor: p.avatarColor || PLAYER_COLORS[idx % PLAYER_COLORS.length],
    drinksAlcohol: p.drinksAlcohol !== false,
    drinksCount: Math.max(0, Number(p.drinksCount) || 0),
    completedCount: Math.max(0, Number(p.completedCount) || 0)
  }));
}

function persistLocalPlayers(players) {
  try {
    window.localStorage.setItem(LOCAL_PLAYERS_KEY, JSON.stringify(players));
  } catch {
    // ignore quota errors
  }
  localDb.savePlayers(players);
}

function persistLocalSettings() {
  const snapshot = buildSettingsSnapshot();
  try {
    window.localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(snapshot));
  } catch {
    // ignore quota errors
  }
  localDb.saveSettings(snapshot);
}

export const store = {
  getState() {
    return state;
  },

  async hydrateFromLocalDb() {
    const initialized = await localDb.init();
    if (!initialized) return false;

    const { players: dbPlayers, settings: dbSettings } = await localDb.loadAll();
    let changed = false;

    if (dbSettings) {
      const hasLocalSettings = Boolean(loadJsonStorage(window.localStorage, LOCAL_SETTINGS_KEY, null));
      if (!hasLocalSettings) {
        const sfxVolume = clampVolume(dbSettings.sfxVolume, state.sfxVolume);
        const musicVolume = clampVolume(dbSettings.musicVolume, state.musicVolume);
        const locale = normalizeSupportedLocale(dbSettings.locale || dbSettings.lang || state.locale);
        const lang = localeToBaseLang(locale);
        const ageGateStatus = normalizeAgeGateStatus(dbSettings.ageGateStatus) || state.ageGateStatus;
        Object.assign(state, {
          locale,
          lang,
          ageGateStatus,
          textScaleMode: normalizeTextScaleMode(dbSettings.textScaleMode, dbSettings.settingsVersion),
          musicVolume,
          sfxVolume,
          soundEnabled: sfxVolume > 0,
          progressiveCurve: dbSettings.progressiveCurve !== false,
          minIntensity: dbSettings.minIntensity ?? 1,
          maxIntensity: dbSettings.maxIntensity ?? 10,
          alcoholMode: dbSettings.alcoholMode !== false
        });
        state.previaMixConfig = normalizePreviaMixConfig(
          { ...state.previaMixConfig, locale, localeAutoSynced: true },
          { appLang: state.lang, appLocale: state.locale }
        );
        try {
          window.localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(buildSettingsSnapshot()));
        } catch {
          // ignore
        }
        changed = true;
      }
    } else {
      await localDb.saveSettings(buildSettingsSnapshot());
    }

    if (Array.isArray(dbPlayers) && dbPlayers.length > 0 && state.localPlayers.length === 0) {
      const normalized = sanitizePlayersList(dbPlayers);
      state.localPlayers = normalized;
      try {
        window.localStorage.setItem(LOCAL_PLAYERS_KEY, JSON.stringify(normalized));
      } catch {
        // ignore
      }
      changed = true;
    } else if (state.localPlayers.length > 0 && (!dbPlayers || dbPlayers.length === 0)) {
      await localDb.savePlayers(state.localPlayers);
    }

    if (changed) {
      for (const fn of listeners) {
        fn(state);
      }
    }
    return true;
  },

  recordSessionEvent(event) {
    return localDb.recordSessionEvent(event);
  },

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  setState(updater, { silent = false } = {}) {
    const patch = typeof updater === 'function' ? updater(state) : updater;
    const normalizedPatch = { ...patch };
    if ('musicVolume' in normalizedPatch) {
      normalizedPatch.musicVolume = clampVolume(normalizedPatch.musicVolume, state.musicVolume);
    }
    if ('startFullscreen' in normalizedPatch) {
      normalizedPatch.startFullscreen = Boolean(normalizedPatch.startFullscreen);
    }
    if ('sfxVolume' in normalizedPatch) {
      normalizedPatch.sfxVolume = clampVolume(normalizedPatch.sfxVolume, state.sfxVolume);
      normalizedPatch.soundEnabled = normalizedPatch.sfxVolume > 0;
    } else if ('soundEnabled' in normalizedPatch) {
      normalizedPatch.sfxVolume = normalizedPatch.soundEnabled ? Math.max(60, state.sfxVolume || 80) : 0;
    }
    if ('locale' in normalizedPatch || 'lang' in normalizedPatch) {
      const nextLocale = normalizeSupportedLocale(normalizedPatch.locale || normalizedPatch.lang);
      const nextLang = localeToBaseLang(nextLocale);
      normalizedPatch.locale = nextLocale;
      normalizedPatch.lang = nextLang;
      if (!('previaMixConfig' in normalizedPatch)) {
        normalizedPatch.previaMixConfig = normalizePreviaMixConfig(
          { ...state.previaMixConfig, locale: nextLocale, localeAutoSynced: true },
          { appLang: nextLang, appLocale: nextLocale }
        );
        persistPreviaMixConfig(normalizedPatch.previaMixConfig, state.ageGateStatus);
      }
    }
    Object.assign(state, normalizedPatch);
    if (
      'alcoholMode' in normalizedPatch ||
      'progressiveCurve' in normalizedPatch ||
      'minIntensity' in normalizedPatch ||
      'maxIntensity' in normalizedPatch ||
      'textScaleMode' in normalizedPatch ||
      'locale' in normalizedPatch ||
      'lang' in normalizedPatch ||
      'ageGateStatus' in normalizedPatch ||
      'startFullscreen' in normalizedPatch ||
      'musicVolume' in normalizedPatch ||
      'sfxVolume' in normalizedPatch ||
      'soundEnabled' in normalizedPatch
    ) {
      persistLocalSettings();
    }
    if (!silent) {
      for (const fn of listeners) {
        fn(state);
      }
    }
  },

  setLocale(nextLocaleOrLang, { silent = false } = {}) {
    const nextLocale = normalizeSupportedLocale(nextLocaleOrLang);
    const nextLang = localeToBaseLang(nextLocale);
    const nextConfig = normalizePreviaMixConfig(
      { ...state.previaMixConfig, locale: nextLocale, localeAutoSynced: true },
      { appLang: nextLang, appLocale: nextLocale }
    );
    persistPreviaMixConfig(nextConfig, state.ageGateStatus);
    this.setState(
      {
        locale: nextLocale,
        lang: nextLang,
        previaMixConfig: nextConfig
      },
      { silent }
    );
    return nextLocale;
  },

  setAgeVerification(isAdult) {
    const adult = Boolean(isAdult);
    const ageGateStatus = adult ? 'adult' : 'minor';
    const filtered = (state.previaMixConfig?.enabledTypes || []).filter((t) => t !== 'hot');
    const nextConfig = normalizePreviaMixConfig(
      {
        ...state.previaMixConfig,
        locale: state.locale,
        localeAutoSynced: true,
        enableHot: adult,
        adultsConfirmed: adult,
        everyoneConsentsHot: adult,
        enabledTypes: adult ? [...filtered, 'hot'] : filtered
      },
      { appLang: state.lang, appLocale: state.locale }
    );
    persistPreviaMixConfig(nextConfig, ageGateStatus);
    this.setState({
      ageGateStatus,
      previaMixConfig: nextConfig
    });
    return ageGateStatus;
  },

  updatePreviaMixConfig(updater, { silent = false } = {}) {
    const patch = typeof updater === 'function' ? updater(state.previaMixConfig) : updater;
    const nextConfig = normalizePreviaMixConfig(
      { ...state.previaMixConfig, ...(patch || {}), locale: state.locale, localeAutoSynced: true },
      { appLang: state.lang, appLocale: state.locale }
    );
    persistPreviaMixConfig(nextConfig, state.ageGateStatus);
    this.setState({ previaMixConfig: nextConfig }, { silent });
    return nextConfig;
  },

  updateYoNuncaConfig(updater, { silent = false } = {}) {
    const patch = typeof updater === 'function' ? updater(state.yoNuncaConfig) : updater;
    const nextConfig = {
      ...state.yoNuncaConfig,
      ...(patch || {}),
      bonusEnabled: (patch?.bonusEnabled !== undefined) ? patch.bonusEnabled : state.yoNuncaConfig.bonusEnabled !== false,
      customCardsEnabled: (patch?.customCardsEnabled !== undefined) ? patch.customCardsEnabled : state.yoNuncaConfig.customCardsEnabled !== false,
      targetTurns: Math.max(5, Math.min(900, Number(patch?.targetTurns ?? state.yoNuncaConfig.targetTurns) || 45))
    };
    persistSimpleModeConfig(LOCAL_YO_NUNCA_CONFIG_KEY, nextConfig);
    this.setState({ yoNuncaConfig: nextConfig }, { silent });
    return nextConfig;
  },

  updateQuienConfig(updater, { silent = false } = {}) {
    const patch = typeof updater === 'function' ? updater(state.quienConfig) : updater;
    const nextConfig = {
      ...state.quienConfig,
      ...(patch || {}),
      bonusEnabled: (patch?.bonusEnabled !== undefined) ? patch.bonusEnabled : state.quienConfig.bonusEnabled !== false,
      customCardsEnabled: (patch?.customCardsEnabled !== undefined) ? patch.customCardsEnabled : state.quienConfig.customCardsEnabled !== false,
      targetTurns: Math.max(5, Math.min(900, Number(patch?.targetTurns ?? state.quienConfig.targetTurns) || 45))
    };
    persistSimpleModeConfig(LOCAL_QUIEN_CONFIG_KEY, nextConfig);
    this.setState({ quienConfig: nextConfig }, { silent });
    return nextConfig;
  },

  updateVerdadORetoConfig(updater, { silent = false } = {}) {
    const patch = typeof updater === 'function' ? updater(state.verdadORetoConfig) : updater;
    const current = state.verdadORetoConfig || {};
    const nextConfig = {
      ...current,
      ...(patch || {}),
      turnOrder:
        patch?.turnOrder === 'aleatorio'
          ? 'aleatorio'
          : patch?.turnOrder === 'secuencial'
            ? 'secuencial'
            : current.turnOrder || 'secuencial',
      maxConsecutiveTruths:
        patch?.maxConsecutiveTruths !== undefined
          ? Math.max(0, Math.min(10, Math.round(Number(patch.maxConsecutiveTruths) || 0)))
          : current.maxConsecutiveTruths ?? 3,
      bonusEnabled: (patch?.bonusEnabled !== undefined) ? patch.bonusEnabled : current.bonusEnabled !== false,
      customCardsEnabled: (patch?.customCardsEnabled !== undefined) ? patch.customCardsEnabled : current.customCardsEnabled !== false,
      targetTurns: Math.max(5, Math.min(900, Number(patch?.targetTurns ?? current.targetTurns) || 45))
    };
    persistSimpleModeConfig(LOCAL_VERDAD_O_RETO_CONFIG_KEY, nextConfig);
    this.setState({ verdadORetoConfig: nextConfig }, { silent });
    return nextConfig;
  },

  addLocalPlayer(name, avatarEmoji = null, drinksAlcohol = null) {
    const clean = (name || '').trim().slice(0, 22);
    if (!clean) return { ok: false, reason: 'EMPTY_NAME' };
    if (state.localPlayers.length >= MAX_PLAYERS) {
      return { ok: false, reason: 'MAX_REACHED' };
    }

    const idx = state.localPlayers.length;
    const player = {
      id: createUuid(),
      name: clean,
      avatarEmoji: avatarEmoji || PLAYER_AVATARS[idx % PLAYER_AVATARS.length],
      avatarColor: PLAYER_COLORS[idx % PLAYER_COLORS.length],
      drinksAlcohol: drinksAlcohol !== null ? Boolean(drinksAlcohol) : state.alcoholMode !== false,
      drinksCount: 0,
      completedCount: 0
    };
    const next = [...state.localPlayers, player];
    persistLocalPlayers(next);
    this.setState({ localPlayers: next });
    return { ok: true, player };
  },

  updateLocalPlayer(playerId, { name, avatarEmoji, drinksAlcohol } = {}) {
    const clean = (name || '').trim().slice(0, 22);
    if (!clean) return { ok: false, reason: 'EMPTY_NAME' };

    let updatedPlayer = null;
    const next = state.localPlayers.map((p) => {
      if (p.id !== playerId) return p;
      updatedPlayer = {
        ...p,
        name: clean,
        avatarEmoji: avatarEmoji || p.avatarEmoji,
        drinksAlcohol:
          drinksAlcohol !== undefined ? Boolean(drinksAlcohol) : p.drinksAlcohol !== false
      };
      return updatedPlayer;
    });
    if (!updatedPlayer) return { ok: false, reason: 'NOT_FOUND' };

    persistLocalPlayers(next);
    this.setState({ localPlayers: next });
    return { ok: true, player: updatedPlayer };
  },

  toggleLocalPlayerAlcohol(playerId) {
    const next = state.localPlayers.map((p) =>
      p.id === playerId ? { ...p, drinksAlcohol: !(p.drinksAlcohol !== false) } : p
    );
    persistLocalPlayers(next);
    this.setState({ localPlayers: next });
  },

  removeLocalPlayer(playerId) {
    const next = state.localPlayers.filter((p) => p.id !== playerId);
    persistLocalPlayers(next);
    this.setState({ localPlayers: next });
  },

  updateLocalPlayerScore(playerId, deltaDrinks = 1) {
    const next = state.localPlayers.map((p) =>
      p.id === playerId ? { ...p, drinksCount: Math.max(0, (p.drinksCount || 0) + deltaDrinks) } : p
    );
    persistLocalPlayers(next);
    this.setState({ localPlayers: next });
  },

  updateProfile(partial, { silent = false } = {}) {
    const nextProfile = { ...state.profile, ...partial };
    window.sessionStorage.setItem(PROFILE_KEY, JSON.stringify(nextProfile));
    if (silent) {
      state.profile = nextProfile;
      return;
    }
    this.setState({ profile: nextProfile });
  },

  persistActiveRoomRef(ref) {
    if (ref) {
      window.sessionStorage.setItem(ROOM_KEY, JSON.stringify(ref));
    } else {
      window.sessionStorage.removeItem(ROOM_KEY);
    }
    this.setState({ savedRoomRef: ref });
  }
};
