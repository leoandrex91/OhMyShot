import {
  CARD_CATEGORIES,
  COUNTDOWN_MEDIA,
  DESIGN_TOKENS,
  LOCAL_GAME_MODES,
  MAX_PLAYERS,
  MIN_PLAYERS,
  PLAYER_AVATARS,
  PROJECT_META,
  SHOT_ICONS,
  SPECIAL_CARD_FX,
  SWIPE_FEEDBACK_MEDIA,
  UI_ICONS,
  resolveCardFxMode
} from '../config/constants.js';
import {
  enterAppFullscreen,
  exitAppFullscreen,
  initPwaInstallWatcher,
  installAppGuards,
  isPwaInstalled,
  promptPwaInstall
} from '../core/appGuard.js';
import { audioFx } from '../core/audioFx.js';
import { pickLocalizedText, t } from '../core/i18n.js';
import { store } from '../core/store.js';
import { disableWakeLock, enableWakeLock } from '../core/wakeLock.js';
import { attachCardSwipe } from '../fx/swipeController.js';
import { visualFx } from '../fx/visualFx.js';
import { getEffectiveDrinkSettings } from '../modes/previa-mix/adapter.js';
import {
  PREVIA_MIX_LOCALE_OPTIONS,
  PREVIA_MIX_MAX_PLAYERS,
  PREVIA_MIX_PACE_PRESETS,
  PREVIA_MIX_TYPE_CONFIG
} from '../modes/previa-mix/mode.config.js';
import { getModeAdapter, getModeDefinition } from '../modes/registry.js';
import { stage3d } from '../scenes3d/stage3d.js';
import { buildCreatorScreenHtml } from '../modes/creator/creator.ui.js';
import { creatorController } from '../modes/creator/creator.controller.js';
import { getCustomCards, getCustomCardsForMode } from '../core/customCards.js';
import { invalidatePreviaMixCatalogCache } from '../modes/previa-mix/adapter.js';
import {
  INTENSITY_LEVELS,
  getIntensityLevel,
  getLocalizedIntensityInfo,
  getLocalizedIntensityRangeInfo
} from '../config/intensityLevels.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderAvatarHtml(avatarValue, className = 'avatar-img', alt = '') {
  const val = String(avatarValue ?? '');
  if (val.includes('/') || val.endsWith('.webp') || val.endsWith('.png')) {
    return `<img class="${escapeHtml(className)}" src="${escapeHtml(val)}" alt="${escapeHtml(
      alt
    )}" decoding="async" />`;
  }
  return `<span>${escapeHtml(val)}</span>`;
}

function renderShotIconHtml(drinks = true, variant = 'btn') {
  const src = drinks ? SHOT_ICONS.on : SHOT_ICONS.off;
  const sizeClass = variant === 'mini' ? 'is-mini' : 'is-btn';
  return `<span class="shot-icon-frame ${sizeClass}" aria-hidden="true"><img src="${escapeHtml(
    src
  )}" alt="" decoding="async" /></span>`;
}

function renderUiIconHtml(src, sizeClass = 'ui-icon-md') {
  if (!src) return '';
  return `<img class="ui-icon-img ${escapeHtml(sizeClass)}" src="${escapeHtml(
    src
  )}" alt="" aria-hidden="true" decoding="async" />`;
}

const COFFEE_CUP_SVG = `
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 10H16V14.5C16 17.5376 13.5376 20 10.5 20C7.46243 20 5 17.5376 5 14.5V10Z" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round" fill="rgba(255, 209, 102, 0.2)"/>
    <path d="M16 11H17.8C19.2912 11 20.5 12.2088 20.5 13.7C20.5 15.1912 19.2912 16.4 17.8 16.4H16" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/>
    <path d="M8.2 4.5C8.2 5.9 9.4 6.1 9.4 7.5M12 4.2C12 5.6 13.2 5.8 13.2 7.2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>
`;

const INSTALL_APP_SVG = `
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 4V14.5M12 14.5L7.5 10M12 14.5L16.5 10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M5 16.5V18.5C5 19.3284 5.67157 20 6.5 20H17.5C18.3284 20 19 19.3284 19 18.5V16.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
  </svg>
`;

const GITHUB_SVG = `
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
`;

export class AppShell {
  constructor(rootEl) {
    this.rootEl = rootEl;
    this.draftAvatarIdx = 0;
    this.draftPlayerName = '';
    this.draftDrinksAlcohol = store.getState().alcoholMode !== false;
    this.lastAnimatedCardKey = '';
    this.detachSwipe = null;
    this.uninstallAppGuards = null;
    this.unsubscribeStore = null;
    this.keyHandler = null;
    this.fullscreenHandler = null;
    this.isTransitioning = false;
    this.isCountdownLaunching = false;
    this.isPreparingLaunch = false;
    this.isAdvancingCard = false;
    this.transitionTimers = [];
    this.preloaderTimers = [];
    this.launchTimers = [];
    this.exitConfirmOpen = false;
    this.modeSettingsModalOpen = false;
    this.newPlayerModalOpen = false;
    this.homeSettingsModalOpen = false;
    this.coffeeModalOpen = false;
    this.settingsModalOpen = false;
    this.localeDropdownOpen = false;
    this.creditsModalOpen = false;
    this.creditsOpenedFromSettings = false;
    this.cardAnswerModal = null;
    this.editingPlayerId = null;
    this.longPressTimer = null;
    this.longPressVisualTimer = null;
    this.longPressCardEl = null;
    this.diceRolling = false;
    this.diceRolledForCardKey = {};
    this.diceCurrentFace = 1;
    this.diceRollInterval = null;
    this.intensityAnchor = null;
    this.creditsSecretTapCount = 0;
    this.creditsSecretTapTimer = null;
    this.culturaScoreboardOpen = false;
    this.culturaTimerInterval = null;
    this.culturaTimeRemaining = 0;
    this.culturaTimeTotal = 0;
  }

  mount() {
    this.unsubscribeStore = store.subscribe(() => this.render());
    this.keyHandler = (e) => this.#handleKeyDown(e);
    window.addEventListener('keydown', this.keyHandler);
    this.uninstallInstallWatcher = initPwaInstallWatcher(() => {
      if (store.getState().screen === 'home') {
        this.render();
      }
    });
    this.uninstallAppGuards = installAppGuards({
      onBack: () => this.#handleSystemBack(),
      shouldWarnUnload: () => {
        const scr = store.getState().screen;
        return scr !== 'splash' && scr !== 'home';
      }
    });
    this.render();
  }

  #clearTransitionTimers() {
    this.#stopCulturaTimer();
    while (this.transitionTimers.length) {
      clearTimeout(this.transitionTimers.pop());
    }
  }

  #startCulturaTimerIfNeeded(session) {
    this.#stopCulturaTimer();
    const state = store.getState();
    if (state.screen !== 'play' || state.activeGameModeId !== 'cultura-chupistica') return;
    if (!session || session.roundState !== 'active') return;

    const timerMode = session.config?.timerMode || 'infinite';
    if (timerMode === 'infinite') return;

    let totalSeconds = 10;
    if (timerMode === 'custom') {
      totalSeconds = Math.max(1, Math.min(60, Number(session.config?.customTimerSeconds) || 20));
    } else {
      totalSeconds = parseInt(timerMode, 10) || 10;
    }
    this.culturaTimeTotal = totalSeconds;
    this.culturaTimeRemaining = totalSeconds;

    const timerEl = document.querySelector('#cultura-timer-display');
    if (timerEl) timerEl.textContent = `${this.culturaTimeRemaining}s`;

    this.culturaTimerInterval = setInterval(() => {
      this.culturaTimeRemaining -= 1;
      const el = document.querySelector('#cultura-timer-display');
      if (el) el.textContent = `${this.culturaTimeRemaining}s`;

      if (this.culturaTimeRemaining <= 0) {
        this.#stopCulturaTimer();
        audioFx.bad();
        const adapter = getModeAdapter('cultura-chupistica');
        adapter?.openFailModal(session);
        this.render();
      }
    }, 1000);
  }

  #stopCulturaTimer() {
    if (this.culturaTimerInterval) {
      clearInterval(this.culturaTimerInterval);
      this.culturaTimerInterval = null;
    }
  }

  #resetCulturaTimer() {
    if (this.culturaTimeTotal > 0 && this.culturaTimerInterval) {
      this.culturaTimeRemaining = this.culturaTimeTotal;
      const el = document.querySelector('#cultura-timer-display');
      if (el) el.textContent = `${this.culturaTimeRemaining}s`;
    }
  }

  #handleCulturaCardSwipe(session) {
    if (!session || this.isAdvancingCard) return;
    const state = store.getState();
    const trackFails = session.config?.trackFails !== false;
    this.#stopCulturaTimer();

    if (trackFails) {
      audioFx.tap();
      const adapter = getModeAdapter('cultura-chupistica');
      adapter?.openFailModal(session);
      store.setState({
        localGame: {
          ...state.localGame,
          session
        }
      });
    } else {
      this.#advanceCulturaNoFails(session);
    }
  }

  #advanceCulturaNoFails(session) {
    if (!session) return;
    const state = store.getState();
    audioFx.god();
    visualFx.triggerLensFlare?.(DESIGN_TOKENS.shotMint);
    stage3d.pulse(0x47e9d2);
    const adapter = getModeAdapter('cultura-chupistica');
    adapter?.advanceToNextRound(session, state.localPlayers);
    if (session.roundState === 'game_over') {
      audioFx.partyBurst();
      visualFx.triggerConfetti('party');
    } else {
      this.#resetCulturaTimer();
      this.#startCulturaTimerIfNeeded(session);
    }
    store.setState({
      localGame: {
        ...state.localGame,
        session
      }
    });
  }

  #clearPreloaderTimers() {
    while (this.preloaderTimers.length) {
      clearTimeout(this.preloaderTimers.pop());
    }
  }

  #showScreenLoader(loaderKey = 'loaderPlay', customText = null) {
    const state = store.getState();
    const lang = state.lang || 'es';
    const loaderEl = document.querySelector('#screen-loader');
    if (!loaderEl) return;

    document.body.classList.add('is-loading-view');
    const text = customText || t(loaderKey, lang) || 'Cargando...';
    loaderEl.innerHTML = `
      <div class="screen-loader-card">
        <div class="screen-loader-ring-wrap">
          <div class="screen-loader-ring" aria-hidden="true"></div>
          <img class="screen-loader-logo" src="./assets/imgs/logo_secundario.webp" alt="Oh My Shot!" />
        </div>
        <div class="screen-loader-eyebrow">${escapeHtml(t('loaderSub', lang) || 'OH MY SHOT!')}</div>
        <div class="screen-loader-text">${escapeHtml(text)}</div>
        <div class="screen-loader-bar" aria-hidden="true"><span></span></div>
      </div>
    `;
    loaderEl.hidden = false;
    loaderEl.classList.remove('is-fading');
    loaderEl.classList.add('is-visible');
  }

  #hideScreenLoader() {
    const loaderEl = document.querySelector('#screen-loader');
    if (!loaderEl) return;
    loaderEl.classList.remove('is-visible');
    loaderEl.classList.add('is-fading');
    const hideTimer = setTimeout(() => {
      loaderEl.hidden = true;
      loaderEl.classList.remove('is-fading');
      document.body.classList.toggle(
        'is-loading-view',
        store.getState().screen === 'preloader' || this.isCountdownLaunching
      );
    }, 150);
    this.transitionTimers.push(hideTimer);
  }

  async #startPreloaderToPlayers() {
    this.#clearPreloaderTimers();
    store.setState({ screen: 'preloader', splashProgress: 12 });

    const state = store.getState();
    const locale = state.locale || 'es';

    const p1 = setTimeout(() => {
      if (store.getState().screen === 'preloader') {
        store.setState({ splashProgress: 35 });
      }
    }, 180);
    this.preloaderTimers.push(p1);

    try {
      // Precarga real en segundo plano de catálogos y módulos centrales
      const preloadPromise = Promise.all([
        import('../cards/cards.loader.js').then(async (m) => {
          await Promise.all([
            m.loadCardsLocale(locale).catch(() => []),
            m.loadCulturaChupisticaCards(locale).catch(() => [])
          ]);
        }).catch((err) => console.warn('[Preloader] Advertencia de precarga:', err)),
        // Tiempo mínimo agradable para ver el logo/botella (1.1s)
        new Promise((res) => {
          const id = setTimeout(res, 1100);
          this.preloaderTimers.push(id);
        })
      ]);

      const p2 = setTimeout(() => {
        if (store.getState().screen === 'preloader') {
          store.setState({ splashProgress: 75 });
        }
      }, 550);
      this.preloaderTimers.push(p2);

      await preloadPromise;

      if (store.getState().screen !== 'preloader') return;
      store.setState({ splashProgress: 100 });

      // Pausa breve al 100% para feedback natural
      await new Promise((res) => {
        const id = setTimeout(res, 180);
        this.preloaderTimers.push(id);
      });

      if (store.getState().screen !== 'preloader') return;
      stage3d.pulse(0xff4fa3);
      visualFx.triggerLensFlare('#FF4FA3');
      store.setState({ screen: 'players', splashProgress: 100 });
    } catch (err) {
      console.warn('[Preloader] Error en flujo de preloader:', err);
      if (store.getState().screen === 'preloader') {
        store.setState({ screen: 'players', splashProgress: 100 });
      }
    }
  }

  #clearLaunchTimers({ resetOverlay = true } = {}) {
    while (this.launchTimers.length) {
      clearTimeout(this.launchTimers.pop());
    }
    if (!resetOverlay) return;
    this.isCountdownLaunching = false;
    document.body.classList.remove('is-countdown-blur');
    const overlay = document.querySelector('#launch-countdown-overlay');
    if (overlay) {
      overlay.hidden = true;
      overlay.classList.remove('is-visible');
      overlay.innerHTML = '';
    }
  }

  #clearLongPress() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    if (this.longPressVisualTimer) {
      clearTimeout(this.longPressVisualTimer);
      this.longPressVisualTimer = null;
    }
    if (this.longPressCardEl) {
      this.longPressCardEl.classList.remove('is-holding');
      this.longPressCardEl = null;
    }
  }

  async #navigateWithLoader(
    nextScreen,
    loaderKey,
    { beforeSwitch = null, afterShow = null, durationMs = 450, task = null } = {}
  ) {
    if (this.isTransitioning || this.isCountdownLaunching) return;

    this.#clearTransitionTimers();
    this.#clearLaunchTimers();
    this.#clearLongPress();
    this.exitConfirmOpen = false;
    this.modeSettingsModalOpen = false;
    this.newPlayerModalOpen = false;
    this.homeSettingsModalOpen = false;
    this.coffeeModalOpen = false;
    this.settingsModalOpen = false;
    this.localeDropdownOpen = false;
    this.creditsModalOpen = false;
    this.creditsOpenedFromSettings = false;
    this.cardAnswerModal = null;
    this.editingPlayerId = null;
    this.isTransitioning = true;

    this.#showScreenLoader(loaderKey);

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const minMs = reducedMotion ? 200 : durationMs;
    const swapDelay = Math.round(minMs * 0.45);

    try {
      const taskPromise = task ? (typeof task === 'function' ? task() : task) : null;

      // Espera inicial para el swap visual
      await new Promise((res) => {
        const id = setTimeout(res, swapDelay);
        this.transitionTimers.push(id);
      });

      window.scrollTo(0, 0);
      const patch = beforeSwitch ? beforeSwitch() : null;
      store.setState({
        ...(patch && typeof patch === 'object' ? patch : {}),
        screen: nextScreen
      });

      // Si hay una tarea asíncrona real, se espera a que termine
      if (taskPromise) {
        await taskPromise;
      }

      const remainingMs = Math.max(0, minMs - swapDelay);
      if (remainingMs > 0) {
        await new Promise((res) => {
          const id = setTimeout(res, remainingMs);
          this.transitionTimers.push(id);
        });
      }
    } catch (err) {
      console.error('[navigateWithLoader] Error durante la navegación:', err);
    } finally {
      this.isTransitioning = false;
      visualFx.triggerLensFlare(DESIGN_TOKENS.shotPink);
      this.#hideScreenLoader();
      afterShow?.();
    }
  }

  #closeCreditsModal() {
    this.creditsModalOpen = false;
    this.creditsSecretTapCount = 0;
    if (this.creditsSecretTapTimer) {
      clearTimeout(this.creditsSecretTapTimer);
      this.creditsSecretTapTimer = null;
    }
    if (this.creditsOpenedFromSettings) {
      this.settingsModalOpen = true;
      this.creditsOpenedFromSettings = false;
    }
    this.render();
  }

  #isAgeGateBlocking(state = store.getState()) {
    return Boolean(state && state.screen !== 'splash' && !state.ageGateStatus);
  }

  #handleSystemBack() {
    if (
      this.isCountdownLaunching ||
      this.isTransitioning ||
      this.isPreparingLaunch ||
      this.#isAgeGateBlocking() ||
      store.getState().screen === 'preloader'
    ) {
      return;
    }

    if (this.localeDropdownOpen) {
      this.localeDropdownOpen = false;
      this.render();
      return;
    }

    if (this.cardAnswerModal) {
      audioFx.tap();
      this.cardAnswerModal = null;
      this.render();
      return;
    }

    if (this.creditsModalOpen) {
      audioFx.tap();
      this.#closeCreditsModal();
      return;
    }

    if (this.coffeeModalOpen) {
      audioFx.tap();
      this.coffeeModalOpen = false;
      this.render();
      return;
    }

    if (this.homeSettingsModalOpen) {
      audioFx.tap();
      this.homeSettingsModalOpen = false;
      this.render();
      return;
    }

    if (this.settingsModalOpen) {
      audioFx.tap();
      this.settingsModalOpen = false;
      this.render();
      return;
    }

    if (this.modeSettingsModalOpen) {
      audioFx.tap();
      this.modeSettingsModalOpen = false;
      this.render();
      return;
    }

    if (this.exitConfirmOpen) {
      audioFx.tap();
      this.exitConfirmOpen = false;
      this.render();
      return;
    }

    if (this.newPlayerModalOpen) {
      audioFx.tap();
      this.newPlayerModalOpen = false;
      this.editingPlayerId = null;
      this.render();
      return;
    }

    const { screen } = store.getState();
    if (screen === 'play') {
      audioFx.tap();
      this.exitConfirmOpen = true;
      this.render();
      return;
    }

    if (screen === 'instructions') {
      audioFx.tap();
      this.#navigateWithLoader('intensity', 'loaderIntensity');
      return;
    }

    if (screen === 'intensity') {
      audioFx.tap();
      this.#navigateWithLoader('menu', 'loaderReturning');
      return;
    }

    if (screen === 'menu') {
      audioFx.tap();
      this.#navigateWithLoader('players', 'loaderPlayers');
      return;
    }

    if (screen === 'players') {
      audioFx.tap();
      this.#navigateWithLoader('home', 'loaderHome');
      return;
    }
    // En 'splash', 'preloader' y 'home', se mantiene bloqueado sin retroceder ni omitir carga
  }

  #handleKeyDown(e) {
    const state = store.getState();
    if (this.isCountdownLaunching || this.#isAgeGateBlocking(state)) {
      if (e.key === 'Escape') e.preventDefault();
      return;
    }
    if (this.isTransitioning) return;

    if (this.creditsModalOpen || this.coffeeModalOpen || this.homeSettingsModalOpen) {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.#handleSystemBack();
      }
      return;
    }

    if (this.settingsModalOpen) {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.#handleSystemBack();
      }
      return;
    }

    if (this.modeSettingsModalOpen) {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.#handleSystemBack();
      }
      return;
    }

    if (this.cardAnswerModal) {
      if (e.key === 'Escape') {
        e.preventDefault();
        audioFx.tap();
        this.cardAnswerModal = null;
        this.render();
      }
      return;
    }

    if (this.exitConfirmOpen) {
      if (e.key === 'Escape') {
        e.preventDefault();
        audioFx.tap();
        this.exitConfirmOpen = false;
        this.render();
      }
      return;
    }

    if (this.newPlayerModalOpen) {
      if (e.key === 'Escape') {
        e.preventDefault();
        audioFx.tap();
        this.newPlayerModalOpen = false;
        this.editingPlayerId = null;
        this.render();
      }
      return;
    }

    if (state.screen === 'intensity') {
      if (e.key === 'Escape') {
        e.preventDefault();
        audioFx.tap();
        this.#navigateWithLoader('menu', 'loaderReturning');
      } else if (e.key === 'Enter') {
        if (!['BUTTON', 'A', 'INPUT'].includes(document.activeElement?.tagName)) {
          e.preventDefault();
          const btn = document.querySelector('#btn-confirm-intensity');
          btn?.click();
        }
      }
      return;
    }

    if (state.screen === 'instructions') {
      if (e.key === 'Escape') {
        e.preventDefault();
        audioFx.tap();
        this.#navigateWithLoader('intensity', 'loaderIntensity');
      } else if (e.key === 'Enter') {
        if (!['BUTTON', 'A'].includes(document.activeElement?.tagName)) {
          e.preventDefault();
          const btn = document.querySelector('#btn-start-mode');
          btn?.click();
        }
      }
      return;
    }

    if (state.screen === 'play' && e.key === 'Escape') {
      e.preventDefault();
      audioFx.tap();
      this.exitConfirmOpen = true;
      this.render();
      return;
    }

    if (state.screen !== 'play') return;
    if (
      this.exitConfirmOpen ||
      this.settingsModalOpen ||
      this.homeSettingsModalOpen ||
      this.coffeeModalOpen ||
      this.creditsModalOpen ||
      this.isTransitioning ||
      this.isCountdownLaunching ||
      this.isPreparingLaunch
    ) {
      return;
    }
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

    const adapter = getModeAdapter(state.activeGameModeId);
    const vm = adapter?.buildTurnViewModel?.(state.localGame?.session, state.localPlayers);
    const card = vm?.card || null;
    const animKey = `${vm?.turnNumber || 0}-${card?.id || ''}`;
    const isDiceBlocked = Boolean(vm?.isDiceCard && !this.diceRolledForCardKey[animKey]);

    if (state.activeGameModeId === 'cultura-chupistica') {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || (e.key === ' ' && document.activeElement?.tagName !== 'BUTTON')) {
        e.preventDefault();
        this.#handleCulturaCardSwipe(state.localGame?.session);
        return;
      }
    }

    if (e.key === 'ArrowRight' || (e.key === ' ' && document.activeElement?.tagName !== 'BUTTON')) {
      e.preventDefault();
      if (isDiceBlocked) {
        audioFx.tap();
        visualFx.showToast('¡Debes lanzar el dado primero! 🎲');
        return;
      }
      if (vm && !vm.canComplete) {
        this.#notifyBlockedTurn(vm, 'right');
        return;
      }
      this.#advanceCard({ skipped: false });
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (isDiceBlocked) {
        audioFx.tap();
        visualFx.showToast('¡Debes lanzar el dado primero! 🎲');
        return;
      }
      if (vm?.isEventActivation) {
        if (!vm.canComplete) {
          this.#notifyBlockedTurn(vm, 'left');
          return;
        }
        this.#advanceCard({ skipped: false, feedbackType: 'god' });
        return;
      }
      if (vm && !vm.canSkip) {
        this.#notifyBlockedTurn(vm, 'left');
        return;
      }
      this.#advanceCard({ skipped: true });
    }
  }

  #isHotModeActive(state) {
    if (state?.screen === 'play' && state?.localGame?.session) {
      const cfg = state.localGame.session.config || {};
      return Boolean(cfg.hotAllowed && Array.isArray(cfg.enabledTypes) && cfg.enabledTypes.includes('hot'));
    }
    const cfg = state?.previaMixConfig || {};
    return Boolean(cfg.enableHot && Array.isArray(cfg.enabledTypes) && cfg.enabledTypes.includes('hot'));
  }

  #buildTopbar(state) {
    const { lang, screen, activeGameModeId } = state;
    const modeInfo = LOCAL_GAME_MODES.find((m) => m.id === activeGameModeId);
    const subText =
      screen === 'play' && modeInfo
        ? `${pickLocalizedText(modeInfo, 'title', lang)}`
        : screen === 'creator'
          ? (t('cardCreatorBtn', lang) || 'Creador de Cartas')
          : '';

    let backBtnHtml = '';
    if (screen === 'play') {
      backBtnHtml = `<button class="pill-btn" data-action="request-exit-game" type="button">${renderUiIconHtml(
        UI_ICONS.arrowLeft,
        'ui-icon-xs'
      )}<span>${escapeHtml(t('backToMenuBtn', lang))}</span></button>`;
    } else if (screen === 'intensity') {
      backBtnHtml = `<button class="pill-btn" data-action="back-from-intensity" type="button">${renderUiIconHtml(
        UI_ICONS.arrowLeft,
        'ui-icon-xs'
      )}<span>${escapeHtml(t('backToModesBtn', lang))}</span></button>`;
    } else if (screen === 'instructions') {
      backBtnHtml = `<button class="pill-btn" data-action="back-from-instructions" type="button">${renderUiIconHtml(
        UI_ICONS.arrowLeft,
        'ui-icon-xs'
      )}<span>${escapeHtml(t('backBtn', lang) || 'Volver')}</span></button>`;
    } else if (screen === 'creator') {
      backBtnHtml = `<button class="pill-btn" data-action="exit-creator-to-menu" type="button">${renderUiIconHtml(
        UI_ICONS.arrowLeft,
        'ui-icon-xs'
      )}<span>${escapeHtml(t('backToModesBtn', lang) || 'Volver')}</span></button>`;
    } else if (screen === 'menu') {
      backBtnHtml = `<button id="btn-menu-exit-game" class="pill-btn menu-exit-pill" data-action="exit-to-home" type="button" aria-label="${escapeHtml(
        t('exitGameBtn', lang)
      )}">${renderUiIconHtml(UI_ICONS.closeX, 'ui-icon-xs')}<span>${escapeHtml(
        t('exitGameBtn', lang)
      )}</span></button>`;
    } else if (screen === 'players') {
      backBtnHtml = `<button class="pill-btn" data-action="go-home" type="button">${renderUiIconHtml(
        UI_ICONS.home,
        'ui-icon-xs'
      )}<span>${escapeHtml(t('backToHomeBtn', lang))}</span></button>`;
    }

    return `
      <header class="topbar">
        <div class="brand">
          <img class="brand-logo-secondary" src="./assets/imgs/logo_secundario.webp" alt="Oh My Shot!" />
          ${subText
        ? `<span class="mode-pill brand-mode-pill">${modeInfo?.iconImg
          ? renderUiIconHtml(modeInfo.iconImg, 'ui-icon-xs')
          : escapeHtml(modeInfo?.icon || '🎉')
        } ${escapeHtml(subText)}</span>`
        : ''
      }
        </div>

        <div class="topbar-controls">
          ${backBtnHtml}
          <button
            class="pill-btn settings-trigger-btn"
            data-action="open-settings-modal"
            type="button"
            aria-label="${escapeHtml(t('settingsBtnAria', lang))}"
            title="${escapeHtml(t('settingsTitle', lang))}"
          >
            ${renderUiIconHtml(UI_ICONS.settings, 'ui-icon-md')}
          </button>
        </div>
      </header>
    `;
  }

  #renderLocaleDropdownHtml(state) {
    const { lang, locale } = state;
    const activeLocale = locale || state.previaMixConfig?.locale || 'es';
    const activeOpt =
      PREVIA_MIX_LOCALE_OPTIONS.find((opt) => opt.code === activeLocale) || PREVIA_MIX_LOCALE_OPTIONS[0];
    const localeItemsHtml = PREVIA_MIX_LOCALE_OPTIONS.map((opt) => {
      const isSelected = activeLocale === opt.code;
      const optionLabel = opt.nativeLabel || `${opt.shortCode} · ${pickLocalizedText(opt, 'label', lang)}`;
      return `
        <button
          type="button"
          class="oms-dropdown-option ${isSelected ? 'is-selected' : ''}"
          role="option"
          aria-selected="${isSelected ? 'true' : 'false'}"
          data-action="select-locale-option"
          data-locale="${escapeHtml(opt.code)}"
        >
          <span class="oms-dropdown-code">${escapeHtml(opt.shortCode)}</span>
          <span class="oms-dropdown-text">${escapeHtml(optionLabel)}</span>
          ${isSelected ? '<span class="oms-dropdown-check" aria-hidden="true">✓</span>' : ''}
        </button>
      `;
    }).join('');

    return `
      <div class="settings-item">
        <div class="settings-item-head">
          <span class="settings-item-label" id="settings-locale-label">${escapeHtml(
      t('languageLabel', lang)
    )}</span>
          <span class="settings-val-pill is-mint">${escapeHtml(activeOpt.shortCode)}</span>
        </div>
        <div
          class="oms-dropdown ${this.localeDropdownOpen ? 'is-open' : ''}"
          id="settings-locale-dropdown"
        >
          <button
            type="button"
            id="settings-locale-trigger"
            class="oms-dropdown-trigger"
            data-action="toggle-locale-dropdown"
            aria-haspopup="listbox"
            aria-expanded="${this.localeDropdownOpen ? 'true' : 'false'}"
            aria-labelledby="settings-locale-label settings-locale-current"
          >
            <span class="oms-dropdown-current" id="settings-locale-current">
              <span class="oms-dropdown-code">${escapeHtml(activeOpt.shortCode)}</span>
              <span class="oms-dropdown-text">${escapeHtml(
      activeOpt.nativeLabel || `${activeOpt.shortCode} · ${pickLocalizedText(activeOpt, 'label', lang)}`
    )}</span>
            </span>
            <span class="oms-dropdown-chevron" aria-hidden="true">
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </button>
          ${this.localeDropdownOpen
        ? `
                <div
                  id="settings-locale-menu"
                  class="oms-dropdown-menu"
                  role="listbox"
                  aria-labelledby="settings-locale-label"
                >
                  ${localeItemsHtml}
                </div>
              `
        : ''
      }
        </div>
      </div>
    `;
  }

  #renderHotSwitchHtml(state, inputId = 'settings-hot-check') {
    const { lang } = state;
    const isHotActive = this.#isHotModeActive(state);
    return `
      <label class="settings-switch-row is-hot-setting" for="${escapeHtml(inputId)}">
        <span class="settings-switch-copy">
          ${renderUiIconHtml(CARD_CATEGORIES.hot.iconImg, 'ui-icon-sm')}
          <span>
            <strong>${escapeHtml(t('hotSettingTitle', lang))}</strong>
            <small>${escapeHtml(t('hotSettingDesc', lang))}</small>
          </span>
        </span>
        <span class="oms-switch-wrap">
          <input
            id="${escapeHtml(inputId)}"
            class="oms-switch-input"
            type="checkbox"
            role="switch"
            ${isHotActive ? 'checked' : ''}
          />
          <span class="oms-switch-track" aria-hidden="true"></span>
        </span>
      </label>
    `;
  }

  #renderAudioControlsHtml(state, idPrefix = 'settings') {
    const { lang, musicVolume = 50, sfxVolume = 80 } = state;
    const sfxIconSrc = sfxVolume > 0 ? UI_ICONS.soundOn : UI_ICONS.soundOff;

    return `
      <div class="settings-item">
        <div class="settings-item-head">
          <span class="settings-item-label">
            ${renderUiIconHtml(UI_ICONS.music, 'ui-icon-sm')}
            <span>${escapeHtml(t('musicVolumeLabel', lang))}</span>
          </span>
          <span id="${escapeHtml(idPrefix)}-music-val" class="settings-val-pill">${musicVolume}%</span>
        </div>
        <input
          id="${escapeHtml(idPrefix)}-music-range"
          class="oms-range-slider"
          type="range"
          min="0"
          max="100"
          step="5"
          value="${musicVolume}"
          style="--range-pct: ${musicVolume}%;"
          aria-label="${escapeHtml(t('musicVolumeLabel', lang))}"
        />
      </div>

      <div class="settings-item">
        <div class="settings-item-head">
          <span class="settings-item-label">
            <img
              id="${escapeHtml(idPrefix)}-sfx-icon"
              class="ui-icon-img ui-icon-sm"
              src="${escapeHtml(sfxIconSrc)}"
              alt=""
              aria-hidden="true"
            />
            <span>${escapeHtml(t('sfxVolumeLabel', lang))}</span>
          </span>
          <span id="${escapeHtml(idPrefix)}-sfx-val" class="settings-val-pill is-mint">${sfxVolume}%</span>
        </div>
        <input
          id="${escapeHtml(idPrefix)}-sfx-range"
          class="oms-range-slider is-mint"
          type="range"
          min="0"
          max="100"
          step="5"
          value="${sfxVolume}"
          style="--range-pct: ${sfxVolume}%;"
          aria-label="${escapeHtml(t('sfxVolumeLabel', lang))}"
        />
      </div>
    `;
  }

  #renderFullscreenSwitchHtml(state, inputId = 'home-settings-fullscreen-check') {
    const { lang } = state;
    const isEnabled = state.startFullscreen !== false;
    return `
      <label class="settings-switch-row" for="${escapeHtml(inputId)}">
        <span class="settings-switch-copy">
          ${renderUiIconHtml(UI_ICONS.phone, 'ui-icon-sm')}
          <span>
            <strong>${escapeHtml(t('homeFullscreenTitle', lang))}</strong>
            <small>${escapeHtml(t('homeFullscreenDesc', lang))}</small>
          </span>
        </span>
        <span class="oms-switch-wrap">
          <input
            id="${escapeHtml(inputId)}"
            class="oms-switch-input"
            type="checkbox"
            role="switch"
            ${isEnabled ? 'checked' : ''}
          />
          <span class="oms-switch-track" aria-hidden="true"></span>
        </span>
      </label>
    `;
  }

  #buildHomeSettingsModal(state) {
    const { lang } = state;
    return `
      <div
        id="home-settings-backdrop"
        class="oms-modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="home-settings-title"
      >
        <div class="oms-modal-card settings-modal-card">
          <div class="new-player-modal-head">
            <div class="settings-title-wrap">
              ${renderUiIconHtml(UI_ICONS.settings, 'ui-icon-lg')}
              <div>
                <h2 id="home-settings-title" class="oms-modal-title">
                  ${escapeHtml(t('homeSettingsTitle', lang))}
                </h2>
                <p class="settings-modal-subtitle">${escapeHtml(t('homeSettingsSubtitle', lang))}</p>
              </div>
            </div>
            <button
              type="button"
              class="modal-close-btn"
              data-action="close-home-settings"
              aria-label="${escapeHtml(t('cancelBtn', lang))}"
            >${renderUiIconHtml(UI_ICONS.closeX, 'ui-icon-sm')}</button>
          </div>

          <div class="settings-list">
            ${this.#renderAudioControlsHtml(state, 'home-settings')}
            ${this.#renderLocaleDropdownHtml(state)}
            ${this.#renderFullscreenSwitchHtml(state, 'home-settings-fullscreen-check')}
            ${this.#renderHotSwitchHtml(state, 'home-settings-hot-check')}
          </div>

          <button class="btn btn-primary" data-action="close-home-settings" type="button">
            ${renderUiIconHtml(UI_ICONS.checkMint, 'ui-icon-sm')}
            <span>${escapeHtml(t('settingsDoneBtn', lang))}</span>
          </button>
        </div>
      </div>
    `;
  }

  #buildCoffeeModal(state) {
    const { lang } = state;
    const coffeeUrl = PROJECT_META.supportCoffeeUrl;
    const actionButtonHtml = coffeeUrl
      ? `
        <a
          class="btn home-coffee-btn"
          href="${escapeHtml(coffeeUrl)}"
          target="_blank"
          rel="noopener noreferrer"
          data-action="trigger-coffee-support"
        >
          <span class="home-coffee-icon" aria-hidden="true">${COFFEE_CUP_SVG}</span>
          <span>${escapeHtml(t('coffeeActionReadyBtn', lang))}</span>
        </a>
      `
      : `
        <button
          class="btn home-coffee-btn"
          data-action="trigger-coffee-support"
          type="button"
        >
          <span class="home-coffee-icon" aria-hidden="true">${COFFEE_CUP_SVG}</span>
          <span>${escapeHtml(t('coffeeActionReadyBtn', lang))}</span>
        </button>
      `;

    return `
      <div
        id="coffee-modal-backdrop"
        class="oms-modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="coffee-modal-title"
      >
        <div class="oms-modal-card coffee-modal-card">
          <div class="new-player-modal-head">
            <div class="settings-title-wrap">
              <span class="coffee-badge-orb" aria-hidden="true">${COFFEE_CUP_SVG}</span>
              <div>
                <h2 id="coffee-modal-title" class="oms-modal-title">
                  ${escapeHtml(t('coffeeModalTitle', lang))}
                </h2>
                <p class="settings-modal-subtitle">${escapeHtml(t('coffeeModalSubtitle', lang))}</p>
              </div>
            </div>
            <button
              type="button"
              class="modal-close-btn"
              data-action="close-coffee-modal"
              aria-label="${escapeHtml(t('creditsCloseBtn', lang))}"
            >${renderUiIconHtml(UI_ICONS.closeX, 'ui-icon-sm')}</button>
          </div>

          <div class="credits-item is-highlight">
            <p>${escapeHtml(t('coffeeModalBody', lang))}</p>
          </div>

          <div class="credits-item">
            <div class="credits-item-head">
              ${renderUiIconHtml(UI_ICONS.hearts, 'ui-icon-sm')}
              <strong>${escapeHtml(t('homeCreatorLabel', lang))}: ${escapeHtml(t('homeCreatorName', lang))}</strong>
            </div>
            <p>${escapeHtml(t('coffeeModalNote', lang))}</p>
          </div>

          <div class="oms-modal-actions">
            <button class="btn btn-secondary" data-action="close-coffee-modal" type="button">
              ${escapeHtml(t('creditsCloseBtn', lang))}
            </button>
            ${actionButtonHtml}
          </div>
        </div>
      </div>
    `;
  }

  #buildSettingsModal(state) {
    const { lang, textScaleMode, progressiveCurve } = state;
    const isLargeText = textScaleMode === 'large' || textScaleMode === 'xl';

    return `
      <div
        id="settings-modal-backdrop"
        class="oms-modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
      >
        <div class="oms-modal-card settings-modal-card">
          <div class="new-player-modal-head">
            <div class="settings-title-wrap">
              ${renderUiIconHtml(UI_ICONS.settings, 'ui-icon-lg')}
              <div>
                <h2 id="settings-modal-title" class="oms-modal-title">
                  ${escapeHtml(t('settingsTitle', lang))}
                </h2>
                <p class="settings-modal-subtitle">${escapeHtml(t('settingsSubtitle', lang))}</p>
              </div>
            </div>
            <button
              type="button"
              class="modal-close-btn"
              data-action="close-settings-modal"
              aria-label="${escapeHtml(t('cancelBtn', lang))}"
            >${renderUiIconHtml(UI_ICONS.closeX, 'ui-icon-sm')}</button>
          </div>

          <div class="settings-list">
            ${this.#renderAudioControlsHtml(state, 'settings')}

            ${this.#renderLocaleDropdownHtml(state)}

            <div class="settings-item">
              <div class="settings-item-head">
                <span class="settings-item-label">${escapeHtml(
      t('textSizeSettingLabel', lang)
    )}</span>
              </div>
              <div class="settings-seg-group" role="group" aria-label="${escapeHtml(
      t('textSizeSettingLabel', lang)
    )}">
                <button
                  type="button"
                  class="settings-seg-btn ${!isLargeText ? 'is-active' : ''}"
                  data-action="set-text-scale"
                  data-scale="normal"
                  aria-pressed="${!isLargeText ? 'true' : 'false'}"
                >${escapeHtml(t('textSizeNormal', lang))}</button>
                <button
                  type="button"
                  class="settings-seg-btn ${isLargeText ? 'is-active' : ''}"
                  data-action="set-text-scale"
                  data-scale="large"
                  aria-pressed="${isLargeText ? 'true' : 'false'}"
                >${escapeHtml(t('textSizeGrande', lang))}</button>
              </div>
            </div>

            <label class="settings-switch-row" for="settings-progressive-check">
              <span class="settings-switch-copy">
                ${renderUiIconHtml(UI_ICONS.flame, 'ui-icon-sm')}
                <span>
                  <strong>${escapeHtml(t('partyCurveTitle', lang))}</strong>
                  <small>${escapeHtml(t('partyCurveRandomDesc', lang))}</small>
                </span>
              </span>
              <span class="oms-switch-wrap">
                <input
                  id="settings-progressive-check"
                  class="oms-switch-input"
                  type="checkbox"
                  role="switch"
                  ${progressiveCurve ? 'checked' : ''}
                />
                <span class="oms-switch-track" aria-hidden="true"></span>
              </span>
            </label>

            ${this.#renderHotSwitchHtml(state, 'settings-hot-check')}
          </div>

          <button
            class="credits-trigger-btn settings-credits-btn"
            data-action="open-credits-modal"
            type="button"
          >
            ${renderUiIconHtml(UI_ICONS.info, 'ui-icon-sm')}
            <span>${escapeHtml(t('creditsBtn', lang))}</span>
          </button>

          <button class="btn btn-primary" data-action="close-settings-modal" type="button">
            ${renderUiIconHtml(UI_ICONS.checkMint, 'ui-icon-sm')}
            <span>${escapeHtml(t('settingsDoneBtn', lang))}</span>
          </button>
        </div>
      </div>
    `;
  }

  #buildCreditsModal(state) {
    const { lang } = state;

    return `
      <div
        id="credits-modal-backdrop"
        class="oms-modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="credits-modal-title"
      >
        <div class="oms-modal-card credits-modal-card">
          <div class="new-player-modal-head">
            <div class="settings-title-wrap credits-header-wrap">
              <button
                type="button"
                class="credits-secret-star-btn"
                data-action="credits-star-tap"
                aria-label="${escapeHtml(t('creditsTitle', lang))}"
              >${renderUiIconHtml(UI_ICONS.sparkles, 'ui-icon-lg')}</button>
              <div class="credits-header-text">
                <h2 id="credits-modal-title" class="oms-modal-title">
                  ${escapeHtml(t('creditsTitle', lang))}
                </h2>
                <p class="settings-modal-subtitle">${escapeHtml(t('creditsSubtitle', lang))}</p>
                <span class="credits-version-badge">v${escapeHtml(PROJECT_META.version)}</span>
              </div>
            </div>
            <button
              type="button"
              class="modal-close-btn"
              data-action="close-credits-modal"
              aria-label="${escapeHtml(t('creditsCloseBtn', lang))}"
            >${renderUiIconHtml(UI_ICONS.closeX, 'ui-icon-sm')}</button>
          </div>

          <div class="credits-hero-crest">
            <img class="oms-modal-logo credits-modal-logo" src="./assets/imgs/logo_principal.webp" alt="Oh My Shot!" />
            <div class="credits-meta-row">
              <span class="credits-tagline-pill">${escapeHtml(t('creditsTagline', lang))}</span>
            </div>
          </div>

          <div class="credits-list">
            <div class="credits-item is-creator">
              <div class="credits-item-head">
                ${renderUiIconHtml(UI_ICONS.sparkles, 'ui-icon-sm')}
                <strong>${escapeHtml(t('creditsCreatorTitle', lang))}: ${escapeHtml(PROJECT_META.creator)}</strong>
              </div>
              <p>${escapeHtml(t('creditsCreatorDesc', lang))}</p>
              <a
                href="${escapeHtml(PROJECT_META.githubUrl)}"
                target="_blank"
                rel="noopener noreferrer"
                class="credits-github-btn"
              >
                <span class="home-github-svg" aria-hidden="true">${GITHUB_SVG}</span>
                <span>github.com/${escapeHtml(PROJECT_META.githubUser)}</span>
                ${renderUiIconHtml(UI_ICONS.arrowRight, 'ui-icon-xs')}
              </a>
            </div>

            <div class="credits-item">
              <div class="credits-item-head">
                ${renderUiIconHtml(UI_ICONS.star, 'ui-icon-sm')}
                <strong>${escapeHtml(t('creditsCardDesignTitle', lang))}</strong>
              </div>
              <p>${escapeHtml(t('creditsCardDesignDesc', lang))}</p>
            </div>

            <div class="credits-item">
              <div class="credits-item-head">
                ${renderUiIconHtml(UI_ICONS.deck, 'ui-icon-sm')}
                <strong>${escapeHtml(t('creditsCardTechTitle', lang))}</strong>
              </div>
              <p>${escapeHtml(t('creditsCardTechDesc', lang))}</p>
            </div>

            <div class="credits-item is-highlight">
              <div class="credits-item-head">
                ${renderUiIconHtml(UI_ICONS.hearts, 'ui-icon-sm')}
                <strong>${escapeHtml(t('creditsCardThanksTitle', lang))}</strong>
              </div>
              <p>${escapeHtml(t('creditsCardThanksDesc', lang))}</p>
            </div>
          </div>

          <button class="btn btn-primary" data-action="close-credits-modal" type="button">
            ${renderUiIconHtml(UI_ICONS.checkMint, 'ui-icon-sm')}
            <span>${escapeHtml(t('creditsCloseBtn', lang))}</span>
          </button>
        </div>
      </div>
    `;
  }

  #buildSplashView(state) {
    const { lang, splashProgress } = state;
    const pct = Math.max(0, Math.min(100, Math.round(Number(splashProgress) || 0)));
    const label = t('blackLoadingPct', lang).replace('{pct}', String(pct));

    return `
      <section class="splash-black-loader" aria-live="polite" aria-label="Oh My Shot">
        <div class="splash-black-text">${escapeHtml(label)}</div>
      </section>
    `;
  }

  #buildPreloaderView(state) {
    const { lang, splashProgress } = state;
    const statusLabel =
      splashProgress >= 100 ? t('splashReady', lang) : t('splashLoading', lang);

    return `
      <section class="splash-screen splash-preloader-locked" aria-label="Oh My Shot">
        <div class="splash-version-top">
          <span class="home-version-pill">v${escapeHtml(PROJECT_META.version)}</span>
        </div>
        <div class="splash-logo-wrap">
          <div class="splash-halo" aria-hidden="true"></div>
          <div class="splash-floor-shadow" aria-hidden="true"></div>
          <span class="splash-sparkle s1" aria-hidden="true">✦</span>
          <span class="splash-sparkle s2" aria-hidden="true">✦</span>
          <span class="splash-sparkle s3" aria-hidden="true">✦</span>
          <img class="splash-logo-main" src="./assets/imgs/logo_principal.webp" alt="Oh My Shot!" decoding="sync" fetchpriority="high" />
        </div>

        <h1 class="sr-only">OH MY SHOT!</h1>
        <div class="splash-tagline">${escapeHtml(t('splashTagline', lang))}</div>

        <div class="splash-progress-box">
          <div class="splash-progress-track">
            <div class="splash-progress-fill" style="width: ${Math.min(100, splashProgress)}%"></div>
          </div>
          <div class="splash-status-text">${escapeHtml(statusLabel)}</div>
        </div>
      </section>
    `;
  }

  #buildAgeGateModal(state) {
    const { lang } = state;
    return `
      <div
        id="age-gate-backdrop"
        class="oms-modal-backdrop age-gate-backdrop"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="age-gate-title"
        aria-describedby="age-gate-desc"
      >
        <div class="oms-modal-card age-gate-card">
          <div class="age-gate-crest-row">
            <img class="age-gate-logo" src="./assets/imgs/logo_secundario.webp" alt="Oh My Shot!" />
            <span class="age-gate-pill-18">+18</span>
          </div>

          <div class="age-gate-eyebrow">${escapeHtml(t('ageGateEyebrow', lang))}</div>
          <h2 id="age-gate-title" class="age-gate-title">
            ${escapeHtml(t('ageGateQuestion', lang))}
          </h2>

          <div id="age-gate-desc" class="age-gate-info-box">
            <div class="age-gate-info-head">
              ${renderUiIconHtml(CARD_CATEGORIES.hot.iconImg, 'ui-icon-sm')}
              <strong>${escapeHtml(t('ageGateTitle', lang))}</strong>
            </div>
            <p>${escapeHtml(t('ageGateDesc', lang))}</p>
          </div>

          <form id="age-gate-form" class="age-gate-form">
            <button
              type="submit"
              id="btn-age-no"
              name="adult"
              value="false"
              class="btn btn-secondary age-gate-btn"
            >
              ${renderUiIconHtml(UI_ICONS.closeX, 'ui-icon-sm')}
              <span>${escapeHtml(t('ageGateNoBtn', lang))}</span>
            </button>
            <button
              type="submit"
              id="btn-age-yes"
              name="adult"
              value="true"
              class="btn btn-primary age-gate-btn"
            >
              ${renderUiIconHtml(UI_ICONS.checkMint, 'ui-icon-sm')}
              <span>${escapeHtml(t('ageGateYesBtn', lang))}</span>
            </button>
          </form>
        </div>
      </div>
    `;
  }

  #buildHomeView(state) {
    const { lang, locale } = state;
    const activeLocale = locale || state.previaMixConfig?.locale || 'es';
    const activeOpt =
      PREVIA_MIX_LOCALE_OPTIONS.find((opt) => opt.code === activeLocale) || PREVIA_MIX_LOCALE_OPTIONS[0];
    const isHotActive = this.#isHotModeActive(state);
    const installed = isPwaInstalled();

    return `
      <section class="home-lobby-screen" aria-label="Oh My Shot!">
        <div class="home-top-strip">
          <span class="home-version-pill">v${escapeHtml(PROJECT_META.version)}</span>
          <div class="home-top-actions">
            <button
              type="button"
              id="btn-install-app"
              class="home-util-pill ${installed ? 'is-active' : 'is-install'}"
              data-action="install-pwa-app"
            >
              <span class="home-util-svg" aria-hidden="true">${INSTALL_APP_SVG}</span>
              <span>${escapeHtml(
      t(installed ? 'appInstalledBadge' : 'installAppBtn', lang)
    )}</span>
            </button>
            <button
              type="button"
              class="home-util-pill is-settings"
              data-action="open-home-settings"
              aria-label="${escapeHtml(t('homeBasicSettingsBtn', lang))}"
            >
              ${renderUiIconHtml(UI_ICONS.settings, 'ui-icon-xs')}
              <span>${escapeHtml(activeOpt.shortCode)}${isHotActive ? ' · HOT' : ''}</span>
            </button>
          </div>
        </div>

        <div class="home-hero-block">
          <div class="home-logo-wrap">
            <img
              class="home-logo-main"
              src="./assets/imgs/logo_principal.webp"
              alt="Oh My Shot!"
              decoding="sync"
              fetchpriority="high"
            />
          </div>
          <h1 class="sr-only">Oh My Shot!</h1>
          <div class="home-hero-copy">
            <div class="home-eyebrow-pill">${escapeHtml(t('homeScreenEyebrow', lang))}</div>
            <p class="home-hero-tagline">${escapeHtml(t('splashTagline', lang))}</p>
          </div>
        </div>

        <div class="home-cta-stack">
          <button
            type="button"
            id="btn-home-start"
            class="btn btn-primary home-start-btn"
            data-action="start-from-home"
          >
            ${renderUiIconHtml(UI_ICONS.playYellow, 'ui-icon-md')}
            <span>${escapeHtml(t('homeStartGameBtn', lang))}</span>
          </button>

          <div class="home-secondary-row">
            <button
              type="button"
              id="btn-home-basic-settings"
              class="btn btn-secondary home-sec-btn"
              data-action="open-home-settings"
            >
              ${renderUiIconHtml(UI_ICONS.settings, 'ui-icon-sm')}
              <span>${escapeHtml(t('homeBasicSettingsBtn', lang))}</span>
            </button>

            <button
              type="button"
              id="btn-home-coffee"
              class="btn home-coffee-btn"
              data-action="open-coffee-modal"
            >
              <span class="home-coffee-icon" aria-hidden="true">${COFFEE_CUP_SVG}</span>
              <span>${escapeHtml(t('homeCoffeeBtn', lang))}</span>
            </button>
          </div>
        </div>

        <article class="glass-panel home-project-card">
          <div class="home-project-head">
            <div class="home-project-badge">
              ${renderUiIconHtml(UI_ICONS.info, 'ui-icon-xs')}
              <span>${escapeHtml(t('homeProjectBadge', lang))}</span>
            </div>
            <button
              type="button"
              class="home-more-info-link"
              data-action="open-credits-modal"
            >${escapeHtml(t('homeMoreInfoBtn', lang))}</button>
          </div>
          <p class="home-project-desc">${escapeHtml(t('homeProjectDesc', lang))}</p>
          <div class="home-creator-row">
            <span class="home-creator-pill">
              ${renderUiIconHtml(UI_ICONS.sparkles, 'ui-icon-xs')}
              <strong>${escapeHtml(t('homeCreatorLabel', lang))}:</strong>
              <span>${escapeHtml(PROJECT_META.creator)}</span>
            </span>
            <a
              href="${escapeHtml(PROJECT_META.githubUrl)}"
              target="_blank"
              rel="noopener noreferrer"
              class="home-github-pill"
              aria-label="GitHub de ${escapeHtml(PROJECT_META.creator)}"
            >
              <span class="home-github-svg" aria-hidden="true">${GITHUB_SVG}</span>
              <span>github.com/${escapeHtml(PROJECT_META.githubUser)}</span>
              ${renderUiIconHtml(UI_ICONS.arrowRight, 'ui-icon-xs')}
            </a>
          </div>
        </article>

        <article class="glass-panel home-changelog-card">
          <div class="home-changelog-head">
            <div class="home-changelog-badge">
              ${renderUiIconHtml(UI_ICONS.sparkles, 'ui-icon-xs')}
              <span>${escapeHtml(t('homeChangelogBadge', lang))}</span>
            </div>
            <a
              href="${escapeHtml(PROJECT_META.githubUrl)}/blob/main/CHANGELOG.md"
              target="_blank"
              rel="noopener noreferrer"
              class="home-changelog-link"
              aria-label="${escapeHtml(t('homeChangelogViewFull', lang))}"
            >
              <span>CHANGELOG.md</span>
              ${renderUiIconHtml(UI_ICONS.arrowRight, 'ui-icon-xs')}
            </a>
          </div>

          <h3 class="home-changelog-title">${escapeHtml(t('homeChangelogTitle', lang))}</h3>

          <div class="home-changelog-releases">
            <div class="home-changelog-item">
              <div class="home-changelog-item-head">
                <span class="changelog-version-tag changelog-version-tag-latest">v0.8.1</span>
                <strong class="changelog-version-title">${escapeHtml(t('homeChangelogV081Title', lang))}</strong>
              </div>
              <ul class="home-changelog-list">
                <li>${escapeHtml(t('homeChangelogV081Item1', lang))}</li>
                <li>${escapeHtml(t('homeChangelogV081Item2', lang))}</li>
                <li>${escapeHtml(t('homeChangelogV081Item3', lang))}</li>
              </ul>
            </div>

            <div class="home-changelog-item">
              <div class="home-changelog-item-head">
                <span class="changelog-version-tag">v0.8.0</span>
                <strong class="changelog-version-title">${escapeHtml(t('homeChangelogV080Title', lang))}</strong>
              </div>
              <ul class="home-changelog-list">
                <li>${escapeHtml(t('homeChangelogV080Item1', lang))}</li>
                <li>${escapeHtml(t('homeChangelogV080Item2', lang))}</li>
                <li>${escapeHtml(t('homeChangelogV080Item3', lang))}</li>
              </ul>
            </div>
          </div>
        </article>
      </section>
    `;
  }

  #buildNewPlayerModal(state) {
    const { lang } = state;
    const isEditing = Boolean(this.editingPlayerId);
    const modalTitle = isEditing ? t('editPlayerModalTitle', lang) : t('newPlayerModalTitle', lang);
    const submitLabel = isEditing ? t('saveBtnShort', lang) : `+ ${t('addBtnShort', lang)}`;
    const draftAvatar = PLAYER_AVATARS[this.draftAvatarIdx % PLAYER_AVATARS.length];
    const draftDrinkLabel = this.draftDrinksAlcohol
      ? t('playerDrinksShort', lang)
      : t('playerSoberShort', lang);

    const avatarsHtml = PLAYER_AVATARS.map(
      (avatarSrc, idx) => `
        <button
          type="button"
          class="avatar-chip ${this.draftAvatarIdx === idx ? 'is-selected' : ''}"
          data-action="pick-draft-avatar"
          data-idx="${idx}"
          aria-label="Avatar ${idx + 1}"
        >${renderAvatarHtml(avatarSrc, 'avatar-img avatar-picker-img', `Avatar ${idx + 1}`)}</button>
      `
    ).join('');

    return `
      <div
        id="new-player-modal-backdrop"
        class="oms-modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-player-modal-title"
      >
        <div class="oms-modal-card new-player-modal-card">
          <div class="new-player-modal-head">
            <h2 id="new-player-modal-title" class="oms-modal-title">
              ${escapeHtml(modalTitle)}
            </h2>
            <button
              type="button"
              class="modal-close-btn"
              data-action="close-new-player-modal"
              aria-label="${escapeHtml(t('cancelBtn', lang))}"
            >${renderUiIconHtml(UI_ICONS.closeX, 'ui-icon-sm')}</button>
          </div>

          <div class="new-player-input-row">
            <div class="input-icon-wrap">
              <span class="input-leading-icon" aria-hidden="true">${renderAvatarHtml(
      draftAvatar,
      'avatar-img avatar-input-img',
      ''
    )}</span>
              <input
                id="new-player-input"
                class="input"
                type="text"
                maxlength="22"
                autocomplete="off"
                placeholder="${escapeHtml(t('playerNamePlaceholder', lang))}"
                value="${escapeHtml(this.draftPlayerName)}"
              />
            </div>

            <button
              type="button"
              class="shot-icon-btn ${this.draftDrinksAlcohol ? 'is-on' : 'is-sober'}"
              data-action="toggle-draft-alcohol"
              aria-pressed="${this.draftDrinksAlcohol ? 'true' : 'false'}"
              aria-label="${escapeHtml(draftDrinkLabel)}"
              title="${escapeHtml(draftDrinkLabel)}"
            >${renderShotIconHtml(this.draftDrinksAlcohol, 'btn')}</button>
          </div>

          <div class="new-player-avatar-label">${escapeHtml(t('chooseAvatarLabel', lang))}</div>
          <div class="avatar-strip">${avatarsHtml}</div>

          <div class="oms-modal-actions">
            <button class="btn btn-secondary" data-action="close-new-player-modal" type="button">
              ${escapeHtml(t('cancelBtn', lang))}
            </button>
            <button class="btn btn-primary" data-action="save-player" type="button">
              ${renderUiIconHtml(isEditing ? UI_ICONS.saveDisk : UI_ICONS.plus, 'ui-icon-sm')}
              <span>${escapeHtml(submitLabel)}</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  #buildPlayersSetupView(state) {
    const { lang, localPlayers } = state;
    const count = localPlayers.length;
    const canContinue = count >= MIN_PLAYERS;

    const rosterHtml = count
      ? localPlayers
        .map((p) => {
          const drinks = p.drinksAlcohol !== false;
          const drinkText = drinks ? t('playerDrinksShort', lang) : t('playerSoberShort', lang);
          const editLabel = `${t('editPlayerAriaPrefix', lang)} ${p.name}`;
          const avatarInk =
            p.avatarColor === DESIGN_TOKENS.chaosPurple
              ? 'var(--oms-white)'
              : 'var(--oms-text-on-vibrant)';
          return `
            <div class="player-chip-card">
              <button
                type="button"
                class="player-chip-left player-edit-trigger"
                data-player-id="${escapeHtml(p.id)}"
                aria-label="${escapeHtml(editLabel)}"
              >
                <div class="player-chip-avatar" style="background: ${escapeHtml(
            p.avatarColor
          )}; color: ${avatarInk};">
                  ${renderAvatarHtml(p.avatarEmoji, 'avatar-img avatar-roster-img', p.name)}
                </div>
                <span class="player-chip-name">${escapeHtml(p.name)}</span>
              </button>
              <div class="player-chip-actions">
                <button
                  type="button"
                  class="shot-icon-btn ${drinks ? 'is-on' : 'is-sober'}"
                  data-action="toggle-player-alcohol"
                  data-id="${escapeHtml(p.id)}"
                  aria-pressed="${drinks ? 'true' : 'false'}"
                  aria-label="${escapeHtml(drinkText)}"
                  title="${escapeHtml(drinkText)}"
                >${renderShotIconHtml(drinks, 'btn')}</button>
                <button
                  type="button"
                  class="player-remove-btn"
                  data-action="remove-player"
                  data-id="${escapeHtml(p.id)}"
                  aria-label="${escapeHtml(t('removePlayerAriaPrefix', lang))} ${escapeHtml(p.name)}"
                >${renderUiIconHtml(UI_ICONS.trash, 'ui-icon-sm')}</button>
              </div>
              <span class="hold-progress-bar" aria-hidden="true"></span>
            </div>
          `;
        })
        .join('')
      : `<div class="roster-empty-hint" style="grid-column: 1 / -1;">
          ${escapeHtml(t('emptyPlayersHint', lang))}
        </div>`;

    return `
      <section class="section-header section-header-compact">
        <h1>${escapeHtml(t('playersStepTitle', lang))}</h1>
        <div class="count-pill">${count} / ${MAX_PLAYERS}</div>
      </section>

      <div class="players-top-actions">
        <button
          class="btn btn-primary btn-open-new-player"
          data-action="open-new-player-modal"
          type="button"
        >
          ${renderUiIconHtml(UI_ICONS.addPlayer, 'ui-icon-md')}
          <span>${escapeHtml(t('newPlayerBtn', lang))}</span>
        </button>
      </div>

      <div class="players-setup-layout">
        <div class="glass-panel players-roster-panel">
          <div class="list-section-label">
            <span>${escapeHtml(t('rosterLabel', lang))} · ${count}</span>
            <span class="hold-hint-text">${escapeHtml(t('longPressEditHint', lang))}</span>
          </div>

          <div class="roster-scroll">${rosterHtml}</div>
        </div>
      </div>

      <div class="sticky-bottom-cta">
        <button
          class="btn btn-primary"
          data-action="continue-to-menu"
          type="button"
          ${canContinue ? '' : 'aria-disabled="true"'}
        >
          <span>${escapeHtml(t('continueMenuBtn', lang))}</span>
          ${renderUiIconHtml(UI_ICONS.arrowRight, 'ui-icon-sm')}
        </button>
      </div>
    `;
  }

  #buildMainMenuView(state) {
    const { lang } = state;

    const cardsHtml = LOCAL_GAME_MODES.map((mode, idx) => {
      const title = pickLocalizedText(mode, 'title', lang);
      const desc = pickLocalizedText(mode, 'desc', lang);
      const badge = pickLocalizedText(mode, 'badge', lang);
      const isLightInk = mode.inkColor === 'var(--oms-white)';
      const iconHtml = mode.iconImg
        ? renderUiIconHtml(mode.iconImg, 'game-card-icon-img')
        : `<span class="game-card-emoji">${escapeHtml(mode.icon)}</span>`;
      const badgeHtml = !mode.playable
        ? `${renderUiIconHtml(UI_ICONS.lock, 'ui-icon-xs')}<span>${escapeHtml(badge)}</span>`
        : escapeHtml(badge);

      return `
        <button
          type="button"
          class="game-grid-card ${mode.playable ? '' : 'is-locked'} ${isLightInk ? 'is-light-ink' : ''}"
          style="--card-surface-bg: ${escapeHtml(mode.surfaceBg)}; --card-border: ${escapeHtml(
        mode.borderColor || 'rgba(255, 255, 255, 0.28)'
      )}; --card-ink: ${escapeHtml(mode.inkColor)}; --card-accent: ${escapeHtml(
        mode.accent
      )}; --icon-delay: ${(idx * 0.35).toFixed(2)}s;"
          data-action="select-game-mode"
          data-mode-id="${escapeHtml(mode.id)}"
        >
          <span class="game-card-icon" aria-hidden="true">${iconHtml}</span>
          <span class="game-card-body">
            <span class="game-card-headline">
              <span class="game-card-title">${escapeHtml(title)}</span>
              <span class="game-card-badge">${badgeHtml}</span>
            </span>
            <span class="game-card-desc">${escapeHtml(desc)}</span>
          </span>
        </button>
      `;
    }).join('');

    return `
      <section class="section-header section-header-menu">
        <h1>${escapeHtml(t('menuTitle', lang))}</h1>
        <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
          <button class="pill-btn" data-action="go-players" type="button">
            ${renderUiIconHtml(UI_ICONS.playersGroup, 'ui-icon-sm')}
            <span>${state.localPlayers.length} ${escapeHtml(t('editPlayersBtn', lang))}</span>
          </button>
        </div>
      </section>

      <div class="games-grid ${LOCAL_GAME_MODES.length === 1 ? 'is-single-mode' : ''}">${cardsHtml}</div>

      <div class="menu-bottom-cta">
        <div class="menu-brand-footer">
          <img class="menu-logo-crest" src="./assets/imgs/logo_principal.webp" alt="Oh My Shot!" />
          <div class="menu-footer-actions">
            <button
              class="credits-trigger-btn creator-trigger-btn"
              data-action="open-card-creator"
              type="button"
              title="${escapeHtml(t('cardCreatorBtn', lang) || 'Creador de Cartas')}"
            >
              ${renderUiIconHtml(UI_ICONS.sparkles, 'ui-icon-sm')}
              <span>${escapeHtml(t('cardCreatorBtn', lang) || 'Creador de Cartas')}</span>
            </button>
            <button
              class="credits-trigger-btn"
              data-action="open-credits-modal"
              type="button"
            >
              ${renderUiIconHtml(UI_ICONS.info, 'ui-icon-sm')}
              <span>${escapeHtml(t('creditsBtn', lang))}</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  #buildModeSettingsModal(state) {
    const { lang, activeGameModeId, previaMixConfig, yoNuncaConfig, quienConfig, verdadORetoConfig, culturaChupisticaConfig, progressiveCurve } = state;
    const isVor = activeGameModeId === 'verdad-o-reto';
    const isCultura = activeGameModeId === 'cultura-chupistica';
    const isSimpleMode = activeGameModeId === 'yo-nunca' || activeGameModeId === 'quien';

    let isBonusActive = true;
    let targetCards = 45;
    let isCustomCardsActive = true;

    if (activeGameModeId === 'yo-nunca') {
      isBonusActive = yoNuncaConfig?.bonusEnabled !== false;
      isCustomCardsActive = yoNuncaConfig?.customCardsEnabled !== false;
      targetCards = Number(yoNuncaConfig?.targetTurns) || 45;
    } else if (activeGameModeId === 'quien') {
      isBonusActive = quienConfig?.bonusEnabled !== false;
      isCustomCardsActive = quienConfig?.customCardsEnabled !== false;
      targetCards = Number(quienConfig?.targetTurns) || 45;
    } else if (activeGameModeId === 'verdad-o-reto') {
      isBonusActive = verdadORetoConfig?.bonusEnabled !== false;
      isCustomCardsActive = verdadORetoConfig?.customCardsEnabled !== false;
      targetCards = Number(verdadORetoConfig?.targetTurns) || 45;
    } else if (isCultura) {
      isBonusActive = false;
      isCustomCardsActive = false;
      targetCards = Number(culturaChupisticaConfig?.targetTurns) || 30;
    } else {
      const config = previaMixConfig || {};
      const enabledSet = new Set(config.enabledTypes || []);
      isBonusActive = enabledSet.has('bonus');
      isCustomCardsActive = config.customCardsEnabled !== false;
      targetCards = Number(config.targetTurns) || 45;
    }

    const matchingCustomCards = getCustomCardsForMode(activeGameModeId, {
      enabledTypes: activeGameModeId === 'previa-mix' ? previaMixConfig?.enabledTypes : null
    });
    const customCount = matchingCustomCards.length;

    let categoriesOrBonusHtml = '';
    if (isVor) {
      const turnOrder = verdadORetoConfig?.turnOrder || 'secuencial';
      const maxTruths = verdadORetoConfig?.maxConsecutiveTruths ?? 3;
      const truthsLabel =
        maxTruths === 0
          ? t('vorMaxTruthsUnlimited', lang)
          : `${maxTruths} ${t('vorMaxTruthsUnit', lang)}`;

      categoriesOrBonusHtml = `
        <div class="settings-item vor-turn-order-item">
          <div class="settings-item-head">
            <span class="settings-item-label">
              ${renderUiIconHtml(UI_ICONS.duel, 'ui-icon-sm')}
              <span>${escapeHtml(t('vorTurnOrderTitle', lang))}</span>
            </span>
          </div>
          <div class="vor-order-pills">
            <button
              type="button"
              class="vor-order-pill ${turnOrder === 'secuencial' ? 'is-active' : ''}"
              data-action="vor-set-turn-order"
              data-order="secuencial"
            >${escapeHtml(t('vorTurnOrderSequential', lang))}</button>
            <button
              type="button"
              class="vor-order-pill ${turnOrder === 'aleatorio' ? 'is-active' : ''}"
              data-action="vor-set-turn-order"
              data-order="aleatorio"
            >${escapeHtml(t('vorTurnOrderRandom', lang))}</button>
          </div>
          <p class="pm-inline-hint">${escapeHtml(t('vorTurnOrderDesc', lang))}</p>
        </div>

        <div class="settings-item vor-max-truths-item">
          <div class="settings-item-head">
            <span class="settings-item-label">
              ${renderUiIconHtml(UI_ICONS.sparkles, 'ui-icon-sm')}
              <span>${escapeHtml(t('vorMaxTruthsTitle', lang))}</span>
            </span>
            <span class="settings-val-pill is-mint" id="vor-max-truths-pill">${escapeHtml(truthsLabel)}</span>
          </div>
          <div class="oms-custom-number-box">
            <button
              type="button"
              class="oms-number-stepper-btn"
              data-action="vor-adjust-max-truths"
              data-delta="-1"
              aria-label="-1"
            >−</button>
            <div class="oms-number-input-wrap">
              <span class="oms-stepper-display" id="vor-max-truths-display">${escapeHtml(truthsLabel)}</span>
            </div>
            <button
              type="button"
              class="oms-number-stepper-btn"
              data-action="vor-adjust-max-truths"
              data-delta="1"
              aria-label="+1"
            >+</button>
          </div>
          <p class="pm-inline-hint">${escapeHtml(t('vorMaxTruthsDesc', lang))}</p>
        </div>

        <label class="settings-switch-row" for="mode-settings-bonus-check">
          <span class="settings-switch-copy">
            ${renderUiIconHtml(UI_ICONS.gift || UI_ICONS.sparkles, 'ui-icon-sm')}
            <span>
              <strong>${escapeHtml(t('bonusCardsTitle', lang))}</strong>
              <small>${escapeHtml(t('bonusCardsDesc', lang))}</small>
            </span>
          </span>
          <span class="oms-switch-wrap">
            <input
              id="mode-settings-bonus-check"
              class="oms-switch-input"
              type="checkbox"
              role="switch"
              ${isBonusActive ? 'checked' : ''}
            />
            <span class="oms-switch-track" aria-hidden="true"></span>
          </span>
        </label>
      `;
    } else if (isCultura) {
      const timerMode = culturaChupisticaConfig?.timerMode || 'infinite';
      const customSeconds = Math.max(1, Math.min(60, Number(culturaChupisticaConfig?.customTimerSeconds) || 20));
      const trackFails = culturaChupisticaConfig?.trackFails !== false;
      const timerOptions = [
        { id: 'infinite', label: t('culturaTimerInfinite', lang) || '♾️ Infinito (Sin tiempo)' },
        { id: '5s', label: t('culturaTimer5s', lang) || '5 seg' },
        { id: '10s', label: t('culturaTimer10s', lang) || '10 seg' },
        { id: '15s', label: t('culturaTimer15s', lang) || '15 seg' },
        { id: 'custom', label: t('culturaTimerCustom', lang) || '⚙️ Personalizado' }
      ];
      const timerButtonsHtml = timerOptions
        .map((opt) => `
          <button
            type="button"
            class="vor-order-pill ${timerMode === opt.id ? 'is-active' : ''} ${opt.id === 'infinite' ? 'is-full-pill' : ''}"
            data-action="cultura-set-timer-mode"
            data-timer="${opt.id}"
          >${escapeHtml(opt.label)}</button>
        `)
        .join('');

      const customTimerBoxHtml = timerMode === 'custom' ? `
        <div class="cultura-custom-timer-box">
          <div class="settings-item-head" style="margin-bottom: 4px;">
            <span class="settings-item-label">
              <span>${escapeHtml(t('culturaCustomTimerLabel', lang))}</span>
            </span>
            <span class="settings-val-pill is-mint">${customSeconds}s</span>
          </div>
          <div class="oms-custom-number-box">
            <button
              type="button"
              class="oms-number-stepper-btn"
              data-action="cultura-adjust-custom-timer"
              data-delta="-5"
              aria-label="-5s"
            >−5</button>
            <div class="oms-number-input-wrap">
              <input
                id="cultura-custom-timer-input"
                class="oms-custom-text-input"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                value="${customSeconds}"
                placeholder="20"
                maxlength="2"
                aria-label="${escapeHtml(t('culturaCustomTimerLabel', lang))}"
                autocomplete="off"
              />
              <span class="oms-number-unit">s</span>
            </div>
            <button
              type="button"
              class="oms-number-stepper-btn"
              data-action="cultura-adjust-custom-timer"
              data-delta="5"
              aria-label="+5s"
            >+5</button>
          </div>
          <p class="pm-inline-hint">${escapeHtml(t('culturaCustomTimerHint', lang))}</p>
        </div>
      ` : '';

      categoriesOrBonusHtml = `
        <div class="settings-item cultura-timer-item">
          <div class="settings-item-head">
            <span class="settings-item-label">
              ${renderUiIconHtml(UI_ICONS.clock || UI_ICONS.deck, 'ui-icon-sm')}
              <span>${escapeHtml(t('culturaTimerModeTitle', lang))}</span>
            </span>
          </div>
          <div class="vor-order-pills cultura-timer-pills">
            ${timerButtonsHtml}
          </div>
          ${customTimerBoxHtml}
          <p class="pm-inline-hint">${escapeHtml(t('culturaTimerModeDesc', lang))}</p>
        </div>

        <label class="settings-switch-row" for="cultura-settings-fails-check">
          <span class="settings-switch-copy">
            ${renderUiIconHtml(UI_ICONS.warning, 'ui-icon-sm')}
            <span>
              <strong>${escapeHtml(t('culturaTrackFailsTitle', lang))}</strong>
              <small>${escapeHtml(t('culturaTrackFailsDesc', lang))}</small>
            </span>
          </span>
          <span class="oms-switch-wrap">
            <input
              id="cultura-settings-fails-check"
              class="oms-switch-input"
              type="checkbox"
              role="switch"
              ${trackFails ? 'checked' : ''}
            />
            <span class="oms-switch-track" aria-hidden="true"></span>
          </span>
        </label>
      `;
    } else if (isSimpleMode) {
      categoriesOrBonusHtml = `
        <label class="settings-switch-row" for="mode-settings-bonus-check">
          <span class="settings-switch-copy">
            ${renderUiIconHtml(UI_ICONS.gift || UI_ICONS.sparkles, 'ui-icon-sm')}
            <span>
              <strong>${escapeHtml(t('bonusCardsTitle', lang))}</strong>
              <small>${escapeHtml(t('bonusCardsDesc', lang))}</small>
            </span>
          </span>
          <span class="oms-switch-wrap">
            <input
              id="mode-settings-bonus-check"
              class="oms-switch-input"
              type="checkbox"
              role="switch"
              ${isBonusActive ? 'checked' : ''}
            />
            <span class="oms-switch-track" aria-hidden="true"></span>
          </span>
        </label>
      `;
    } else {
      const config = previaMixConfig || {};
      const enabledSet = new Set(config.enabledTypes || []);
      const typesHtml = Object.values(PREVIA_MIX_TYPE_CONFIG)
        .map((meta) => {
          const isActive =
            meta.type === 'hot'
              ? Boolean(config.enableHot && enabledSet.has('hot'))
              : enabledSet.has(meta.type);
          const label = pickLocalizedText(meta, 'label', lang);
          return `
            <button
              type="button"
              class="pm-type-chip ${isActive ? 'is-active' : ''} ${meta.isHot ? 'is-hot-chip' : ''}"
              data-action="pm-toggle-type"
              data-type="${escapeHtml(meta.type)}"
              aria-pressed="${isActive ? 'true' : 'false'}"
              style="--pm-chip-accent: ${escapeHtml(meta.color)};"
            >
              ${renderUiIconHtml(meta.iconImg, 'ui-icon-xs')}
              <span>${escapeHtml(label)}</span>
            </button>
          `;
        })
        .join('');

      categoriesOrBonusHtml = `
        <div class="pm-config-section">
          <div class="pm-section-label">${escapeHtml(t('pmTypesLabel', lang))} (${enabledSet.size}/${Object.keys(PREVIA_MIX_TYPE_CONFIG).length})</div>
          <div class="pm-types-grid">${typesHtml}</div>
        </div>
      `;
    }

    const subtitle = isVor
      ? t('vorModeSubtitleSettings', lang)
      : isCultura
        ? (t('culturaSubtitleSettings', lang) || t('modeSettingsSubtitle', lang))
        : isSimpleMode
          ? t('modeSettingsSubtitleBonusOnly', lang)
          : t('modeSettingsSubtitle', lang);

    return `
      <div
        id="mode-settings-backdrop"
        class="oms-modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mode-settings-title"
      >
        <div class="oms-modal-card settings-modal-card">
          <div class="new-player-modal-head">
            <div class="settings-title-wrap">
              ${renderUiIconHtml(UI_ICONS.settings, 'ui-icon-lg')}
              <div>
                <h2 id="mode-settings-title" class="oms-modal-title">
                  ${escapeHtml(t('modeSettingsTitle', lang))}
                </h2>
                <p class="settings-modal-subtitle">${escapeHtml(subtitle)}</p>
              </div>
            </div>
            <button
              type="button"
              class="modal-close-btn"
              data-action="close-mode-settings-modal"
              aria-label="${escapeHtml(t('cancelBtn', lang))}"
            >${renderUiIconHtml(UI_ICONS.closeX, 'ui-icon-sm')}</button>
          </div>

          <div class="settings-list">
            ${categoriesOrBonusHtml}

            ${!isCultura ? `
            <label class="settings-switch-row" for="mode-settings-curve-check">
              <span class="settings-switch-copy">
                ${renderUiIconHtml(UI_ICONS.flame, 'ui-icon-sm')}
                <span>
                  <strong>${escapeHtml(t('partyCurveTitle', lang))}</strong>
                  <small>${escapeHtml(t('partyCurveRandomDesc', lang))}</small>
                </span>
              </span>
              <span class="oms-switch-wrap">
                <input
                  id="mode-settings-curve-check"
                  class="oms-switch-input"
                  type="checkbox"
                  role="switch"
                  ${progressiveCurve ? 'checked' : ''}
                />
                <span class="oms-switch-track" aria-hidden="true"></span>
              </span>
            </label>

            <label class="settings-switch-row" for="mode-settings-custom-cards-check">
              <span class="settings-switch-copy">
                ${renderUiIconHtml(UI_ICONS.sparkles, 'ui-icon-sm')}
                <span>
                  <strong>${escapeHtml(t('customCardsTitle', lang))}</strong>
                  <small>${customCount > 0 ? escapeHtml(t('customCardsCount', lang).replace('{count}', customCount)) : escapeHtml(t('customCardsNone', lang))}</small>
                </span>
              </span>
              <span class="oms-switch-wrap">
                <input
                  id="mode-settings-custom-cards-check"
                  class="oms-switch-input"
                  type="checkbox"
                  role="switch"
                  ${isCustomCardsActive ? 'checked' : ''}
                />
                <span class="oms-switch-track" aria-hidden="true"></span>
              </span>
            </label>
            ` : ''}

            <div class="settings-item mode-cards-limit-item">
              <div class="settings-item-head">
                <span class="settings-item-label">
                  ${renderUiIconHtml(UI_ICONS.deck, 'ui-icon-sm')}
                  <span>${escapeHtml(t('pmMaxCardsLabel', lang))}</span>
                </span>
                <span class="settings-val-pill is-mint" id="mode-cards-val-pill">${targetCards} ${escapeHtml(
      t('cardsUnit', lang)
    )}</span>
              </div>
              <div class="oms-custom-number-box">
                <button
                  type="button"
                  class="oms-number-stepper-btn"
                  data-action="adjust-target-cards"
                  data-delta="-5"
                  aria-label="-5"
                >−5</button>
                <div class="oms-number-input-wrap">
                  <input
                    id="mode-target-cards-input"
                    class="oms-custom-text-input"
                    type="text"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    value="${targetCards}"
                    placeholder="45"
                    maxlength="3"
                    aria-label="${escapeHtml(t('pmMaxCardsLabel', lang))}"
                    autocomplete="off"
                  />
                  <span class="oms-number-unit">${escapeHtml(t('cardsUnit', lang))}</span>
                </div>
                <button
                  type="button"
                  class="oms-number-stepper-btn"
                  data-action="adjust-target-cards"
                  data-delta="5"
                  aria-label="+5"
                >+5</button>
              </div>
              <p class="pm-inline-hint">${escapeHtml(t('pmMaxCardsHint', lang))}</p>
            </div>
          </div>

          <button class="btn btn-primary" data-action="close-mode-settings-modal" type="button">
            ${renderUiIconHtml(UI_ICONS.checkMint, 'ui-icon-sm')}
            <span>${escapeHtml(t('settingsDoneBtn', lang))}</span>
          </button>
        </div>
      </div>
    `;
  }

  #buildIntensityView(state) {
    const { lang, activeGameModeId, previaMixConfig } = state;
    const modeInfo = getModeDefinition(activeGameModeId) || LOCAL_GAME_MODES[0];
    const isLightInk = modeInfo.inkColor === 'var(--oms-white)';
    const title = pickLocalizedText(modeInfo, 'title', lang);
    const badge = pickLocalizedText(modeInfo, 'badge', lang);

    const rawMin = state.minIntensity ?? previaMixConfig?.minIntensity ?? 1;
    const rawMax = state.maxIntensity ?? previaMixConfig?.maxIntensity ?? 10;
    let currentMin = Math.min(10, Math.max(1, Math.round(Number(rawMin) || 1)));
    let currentMax = Math.min(10, Math.max(1, Math.round(Number(rawMax) || 10)));
    if (currentMin > currentMax) {
      const tmp = currentMin;
      currentMin = currentMax;
      currentMax = tmp;
    }

    const rangeInfo = getLocalizedIntensityRangeInfo(currentMin, currentMax, lang);

    const presets = [
      { min: 1, max: 3, label: t('intensityPresetIntro', lang) || '1 - 3 · Suave' },
      { min: 4, max: 6, label: t('intensityPresetFiesta', lang) || '4 - 6 · Fiesta' },
      { min: 7, max: 10, label: t('intensityPresetHot', lang) || '7 - 10 · Hot' },
      { min: 1, max: 10, label: t('intensityPresetAll', lang) || '1 - 10 · Completo' }
    ];

    const presetsHtml = presets
      .map((p) => {
        const isPresetActive = currentMin === p.min && currentMax === p.max;
        return `
          <button
            type="button"
            class="intensity-preset-chip ${isPresetActive ? 'is-active' : ''}"
            data-action="set-intensity-preset"
            data-min="${p.min}"
            data-max="${p.max}"
            aria-pressed="${isPresetActive ? 'true' : 'false'}"
          >
            <span>${escapeHtml(p.label)}</span>
          </button>
        `;
      })
      .join('');

    const pillsHtml = INTENSITY_LEVELS.map((item) => {
      const isInRange = item.level >= currentMin && item.level <= currentMax;
      const isStart = item.level === currentMin;
      const isEnd = item.level === currentMax;
      const isSingle = currentMin === currentMax && isStart;

      let pillClasses = 'intensity-pill-btn';
      if (isInRange) pillClasses += ' is-in-range is-active';
      if (isStart) pillClasses += ' is-range-start';
      if (isEnd) pillClasses += ' is-range-end';
      if (isSingle) pillClasses += ' is-single-value';

      return `
        <button
          type="button"
          class="${pillClasses}"
          data-action="select-intensity-pill"
          data-level="${item.level}"
          style="--pill-accent: ${item.accent};"
          aria-pressed="${isInRange ? 'true' : 'false'}"
          title="${escapeHtml(item.name[lang] || item.name.es)}"
        >
          <span class="intensity-pill-num">${item.level}</span>
        </button>
      `;
    }).join('');

    return `
      <section class="intensity-stage">
        <div
          class="instructions-hero-card ${isLightInk ? 'is-light-ink' : ''}"
          style="--card-surface-bg: ${escapeHtml(modeInfo.surfaceBg)}; --card-border: ${escapeHtml(
      modeInfo.borderColor || 'rgba(255, 255, 255, 0.28)'
    )}; --card-ink: ${escapeHtml(modeInfo.inkColor)};"
        >
          <div class="instructions-hero-top">
            <span class="instructions-hero-icon" aria-hidden="true">${modeInfo.iconImg
        ? renderUiIconHtml(modeInfo.iconImg, 'instructions-hero-icon-img')
        : escapeHtml(modeInfo.icon)
      }</span>
            <div class="instructions-hero-badges-row">
              <span class="game-card-badge">${escapeHtml(badge)}</span>
            </div>
          </div>
          <h1 class="instructions-hero-title">${escapeHtml(title)}</h1>
          <div class="instructions-hero-eyebrow">${escapeHtml(t('intensityEyebrow', lang))}</div>
        </div>

        <div class="glass-panel intensity-showcase-panel">
          <div class="intensity-card-header">
            <div class="intensity-badge-row">
              <span id="intensity-badge" class="intensity-badge" style="--badge-accent: ${rangeInfo.accent};">
                ${escapeHtml(rangeInfo.badgeText)}
              </span>
              <span id="intensity-tagline" class="intensity-tagline">${escapeHtml(rangeInfo.taglineText)}</span>
            </div>
            <h2 id="intensity-level-title" class="intensity-level-title" style="color: ${rangeInfo.accent};">
              ${escapeHtml(rangeInfo.name)}
            </h2>
          </div>

          <div class="intensity-controls-panel">
            <div class="intensity-presets-row" role="group" aria-label="Rangos predefinidos">
              ${presetsHtml}
            </div>

            <div class="intensity-range-steppers-row">
              <div class="intensity-range-stepper-box">
                <span class="intensity-stepper-label">${escapeHtml(t('intensityMinLabel', lang) || 'MÍNIMO')}</span>
                <div class="intensity-stepper-inner">
                  <button
                    type="button"
                    class="intensity-mini-stepper-btn"
                    data-action="step-min-intensity"
                    data-delta="-1"
                    aria-label="Menos mínimo"
                    ${currentMin <= 1 ? 'disabled' : ''}
                  >
                    ${renderUiIconHtml(UI_ICONS.arrowLeft, 'ui-icon-xs')}
                  </button>
                  <span id="intensity-min-display" class="intensity-stepper-value">${currentMin}</span>
                  <button
                    type="button"
                    class="intensity-mini-stepper-btn"
                    data-action="step-min-intensity"
                    data-delta="1"
                    aria-label="Más mínimo"
                    ${currentMin >= 10 ? 'disabled' : ''}
                  >
                    ${renderUiIconHtml(UI_ICONS.arrowRight, 'ui-icon-xs')}
                  </button>
                </div>
              </div>

              <div class="intensity-range-arrow" aria-hidden="true">➔</div>

              <div class="intensity-range-stepper-box">
                <span class="intensity-stepper-label">${escapeHtml(t('intensityMaxLabel', lang) || 'MÁXIMO')}</span>
                <div class="intensity-stepper-inner">
                  <button
                    type="button"
                    class="intensity-mini-stepper-btn"
                    data-action="step-max-intensity"
                    data-delta="-1"
                    aria-label="Menos máximo"
                    ${currentMax <= 1 ? 'disabled' : ''}
                  >
                    ${renderUiIconHtml(UI_ICONS.arrowLeft, 'ui-icon-xs')}
                  </button>
                  <span id="intensity-max-display" class="intensity-stepper-value">${currentMax}</span>
                  <button
                    type="button"
                    class="intensity-mini-stepper-btn"
                    data-action="step-max-intensity"
                    data-delta="1"
                    aria-label="Más máximo"
                    ${currentMax >= 10 ? 'disabled' : ''}
                  >
                    ${renderUiIconHtml(UI_ICONS.arrowRight, 'ui-icon-xs')}
                  </button>
                </div>
              </div>
            </div>

            <div class="intensity-pills-grid" role="group" aria-label="Seleccionar rango de intensidad">
              ${pillsHtml}
            </div>

            <div class="intensity-helper-row">
              <span class="intensity-help-tip">${escapeHtml(t('intensityRangeHelper', lang) || 'Toca dos números o usa los controles para definir el rango')}</span>
            </div>
          </div>
        </div>

        <div class="instructions-dock">
          <div class="instructions-actions-row">
            <button
              class="btn btn-secondary"
              data-action="back-from-intensity"
              type="button"
            >
              ${renderUiIconHtml(UI_ICONS.arrowLeft, 'ui-icon-sm')}
              <span>${escapeHtml(t('backToModesBtn', lang))}</span>
            </button>
            <button
              id="btn-confirm-intensity"
              class="btn btn-primary"
              data-action="confirm-intensity-to-instructions"
              type="button"
            >
              ${renderUiIconHtml(UI_ICONS.playYellow, 'ui-icon-sm')}
              <span>${escapeHtml(t('continueToRulesBtn', lang))}</span>
            </button>
          </div>
        </div>
      </section>
    `;
  }

  #buildInstructionsView(state) {
    const { lang, activeGameModeId, localPlayers, previaMixConfig } = state;
    const modeInfo =
      getModeDefinition(activeGameModeId) || LOCAL_GAME_MODES[0];
    const isLightInk = modeInfo.inkColor === 'var(--oms-white)';
    const title = pickLocalizedText(modeInfo, 'title', lang);
    const badge = pickLocalizedText(modeInfo, 'badge', lang);
    const steps = pickLocalizedText(modeInfo, 'howToPlay', lang) || [];

    const activeSlice = localPlayers.slice(0, PREVIA_MIX_MAX_PLAYERS);
    const drinkersCount = activeSlice.filter((p) => p.drinksAlcohol !== false).length;
    const soberCount = activeSlice.length - drinkersCount;
    const drinkMeta = getEffectiveDrinkSettings(previaMixConfig, localPlayers);

    const currentMinLevel = Math.min(10, Math.max(1, Math.round(Number(state.minIntensity ?? previaMixConfig?.minIntensity ?? 1))));
    const currentMaxLevel = Math.min(10, Math.max(1, Math.round(Number(state.maxIntensity ?? previaMixConfig?.maxIntensity ?? 10))));
    const safeMin = Math.min(currentMinLevel, currentMaxLevel);
    const safeMax = Math.max(currentMinLevel, currentMaxLevel);
    const rangeInfo = getLocalizedIntensityRangeInfo(safeMin, safeMax, lang);

    const stepsHtml = steps
      .map(
        (step, idx) => `
          <li class="instruction-step">
            <span class="instruction-step-num">${idx + 1}</span>
            <span class="instruction-step-text">${escapeHtml(step)}</span>
          </li>
        `
      )
      .join('');

    return `
      <section class="instructions-stage">
        <div
          class="instructions-hero-card ${isLightInk ? 'is-light-ink' : ''}"
          style="--card-surface-bg: ${escapeHtml(modeInfo.surfaceBg)}; --card-border: ${escapeHtml(
      modeInfo.borderColor || 'rgba(255, 255, 255, 0.28)'
    )}; --card-ink: ${escapeHtml(modeInfo.inkColor)};"
        >
          <div class="instructions-hero-top">
            <span class="instructions-hero-icon" aria-hidden="true">${modeInfo.iconImg
        ? renderUiIconHtml(modeInfo.iconImg, 'instructions-hero-icon-img')
        : escapeHtml(modeInfo.icon)
      }</span>
            <div class="instructions-hero-badges-row">
              <span class="game-card-badge">${escapeHtml(badge)}</span>
              <button
                id="btn-mode-config-trigger"
                type="button"
                class="mode-settings-gear-btn"
                data-action="open-mode-settings-modal"
                aria-label="${escapeHtml(t('modeSettingsBtnAria', lang))}"
                title="${escapeHtml(t('modeSettingsTitle', lang))}"
              >
                ${renderUiIconHtml(UI_ICONS.settings, 'ui-icon-xs')}
              </button>
            </div>
          </div>
          <h1 class="instructions-hero-title">${escapeHtml(title)}</h1>
          <div class="instructions-hero-eyebrow">${escapeHtml(t('instructionsEyebrow', lang))}</div>
        </div>

        <div class="glass-panel instructions-rules-panel">
          <div class="instructions-panel-head">
            <h2 class="instructions-title-with-icon">
              ${renderUiIconHtml(UI_ICONS.info, 'ui-icon-sm')}
              <span>${escapeHtml(t('instructionsHowToTitle', lang))}</span>
            </h2>
            <div class="instructions-meta-pills">
              <span class="count-pill">
                ${renderUiIconHtml(UI_ICONS.playersGroup, 'ui-icon-xs')}
                <span>${activeSlice.length} ${escapeHtml(t('instructionsPlayersUnit', lang))}</span>
              </span>
              <button type="button" class="count-pill intensity-meta-pill" data-action="back-from-instructions" title="${escapeHtml(t('intensityScreenTitle', lang))}">
                ${renderUiIconHtml(UI_ICONS.flame, 'ui-icon-xs')}
                <span>${escapeHtml(rangeInfo.badgeText)} · ${escapeHtml(rangeInfo.taglineText)}</span>
              </button>
              <span class="count-pill">${!drinkMeta.noAlcohol && drinkersCount > 0
        ? `${renderShotIconHtml(true, 'mini')} <span>${drinkersCount}</span> <span style="opacity:0.45;">·</span> ${renderShotIconHtml(false, 'mini')} <span>${soberCount}</span>`
        : escapeHtml(t('instructionsAlcoholOff', lang))
      }</span>
            </div>
          </div>

          ${localPlayers.length > PREVIA_MIX_MAX_PLAYERS
        ? `<p class="pm-inline-hint">${escapeHtml(t('pmMaxPlayersCapNotice', lang))}</p>`
        : ''
      }
          <ol class="instructions-steps-list">${stepsHtml}</ol>
        </div>

        <div class="instructions-dock">
          <div class="instructions-actions-row">
            <button
              class="btn btn-secondary"
              data-action="back-from-instructions"
              type="button"
            >
              ${renderUiIconHtml(UI_ICONS.arrowLeft, 'ui-icon-sm')}
              <span>${escapeHtml(t('backBtn', lang) || 'Volver')}</span>
            </button>
            <button
              id="btn-start-mode"
              class="btn btn-primary"
              data-action="confirm-start-mode"
              type="button"
            >
              ${renderUiIconHtml(UI_ICONS.playYellow, 'ui-icon-sm')}
              <span>${escapeHtml(t('startNowBtn', lang))}</span>
            </button>
          </div>
        </div>
      </section>
    `;
  }

  #buildExitConfirmModal(state) {
    const { lang, activeGameModeId, localGame } = state;
    const modeInfo = LOCAL_GAME_MODES.find((m) => m.id === activeGameModeId);
    const modeName = modeInfo ? pickLocalizedText(modeInfo, 'title', lang) : 'Oh My Shot!';
    const round = localGame.session?.turn || 1;
    const desc = t('exitModalDesc', lang)
      .replace('{mode}', modeName)
      .replace('{round}', String(round));

    return `
      <div
        id="exit-confirm-backdrop"
        class="oms-modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-modal-title"
      >
        <div class="oms-modal-card">
          <div class="oms-modal-warn-badge" aria-hidden="true">
            ${renderUiIconHtml(UI_ICONS.warning, 'ui-icon-lg')}
          </div>
          <h2 id="exit-modal-title" class="oms-modal-title">${escapeHtml(
      t('exitModalTitle', lang)
    )}</h2>
          <p class="oms-modal-desc">${escapeHtml(desc)}</p>
          <div class="oms-modal-actions">
            <button class="btn btn-secondary" data-action="cancel-exit-game" type="button">
              ${renderUiIconHtml(UI_ICONS.arrowLeft, 'ui-icon-sm')}
              <span>${escapeHtml(t('exitModalStayBtn', lang))}</span>
            </button>
            <button class="btn btn-primary" data-action="confirm-exit-game" type="button">
              ${renderUiIconHtml(UI_ICONS.home, 'ui-icon-sm')}
              <span>${escapeHtml(t('exitModalConfirmBtn', lang))}</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  #buildCardAnswerModal(state) {
    const { lang } = state;
    const answer = this.cardAnswerModal?.answer || '';

    return `
      <div
        id="card-answer-backdrop"
        class="oms-modal-backdrop card-answer-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-answer-title"
      >
        <div class="oms-modal-card card-answer-card">
          <div class="card-answer-head">
            <div class="card-answer-title-wrap">
              <span class="card-answer-orb" aria-hidden="true">
                <img src="./assets/icons/ui/icon2_19.webp" alt="" class="card-answer-orb-icon" />
              </span>
              <div class="card-answer-headings">
                <span class="card-answer-badge-tag">${escapeHtml(t('cardAnswerBadge', lang))}</span>
                <h2 id="card-answer-title" class="oms-modal-title card-answer-title">
                  ${escapeHtml(t('cardAnswerTitle', lang))}
                </h2>
              </div>
            </div>
            <button
              type="button"
              class="modal-close-btn"
              data-action="close-card-answer"
              aria-label="${escapeHtml(t('creditsCloseBtn', lang))}"
            >${renderUiIconHtml(UI_ICONS.closeX, 'ui-icon-sm')}</button>
          </div>

          <div class="card-answer-body">
            <div class="card-answer-bubble">
              <p class="card-answer-text">${escapeHtml(answer)}</p>
            </div>
          </div>

          <div class="card-answer-actions">
            <button class="btn btn-primary card-answer-dismiss-btn" data-action="close-card-answer" type="button">
              <span>${escapeHtml(t('cardAnswerDismiss', lang))}</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  #buildPromptHtml(vm) {
    const state = store.getState();
    const lang = vm.locale || vm.lang || state.lang || 'es';
    const cardResp = vm.card?.resp || vm.card?.respuesta || '';
    if (!vm.promptTokens || vm.promptTokens.length === 0) {
      const rawText = vm.card?.texto || vm.promptText || '';
      if (rawText.includes('[?]')) {
        if (cardResp) {
          return escapeHtml(rawText).replace(
            /\[\?\]/g,
            `<button type="button" class="btn-card-answer" data-action="open-card-answer" data-answer="${escapeHtml(
              cardResp
            )}" aria-label="${escapeHtml(t('cardAnswerAria', lang))}" title="${escapeHtml(
              t('cardAnswerAria', lang)
            )}"><img src="./assets/icons/ui/icon2_19.webp" alt="" class="card-answer-icon" /></button>`
          );
        }
        return escapeHtml(rawText.replace(/\[\?\]/g, '').trim());
      }
      return escapeHtml(rawText);
    }
    return (vm.promptTokens || [])
      .map((tok) => {
        if (tok.kind === 'player') {
          const slotClass =
            tok.slot === 0 ? 'is-primary' : tok.slot === 1 ? 'is-secondary' : 'is-tertiary';
          const soberIconHtml =
            tok.player?.drinksAlcohol === false ? ` ${renderShotIconHtml(false, 'mini')}` : '';
          return `<span class="prompt-player-chip ${slotClass}">${renderAvatarHtml(
            tok.player.avatarEmoji,
            'avatar-img avatar-chip-img',
            ''
          )}<span>${escapeHtml(tok.player.name)}</span>${soberIconHtml}</span>`;
        }
        if (tok.kind === 'group' || tok.kind === 'all') {
          return `<span class="prompt-player-chip is-group"><span class="chip-group-icon" aria-hidden="true">👥</span><span>${escapeHtml(
            tok.label || 'Todos'
          )}</span></span>`;
        }
        if (tok.kind === 'question_resp') {
          const resp = tok.resp || cardResp || '';
          if (!resp) return '';
          return `<button type="button" class="btn-card-answer" data-action="open-card-answer" data-answer="${escapeHtml(
            resp
          )}" aria-label="${escapeHtml(t('cardAnswerAria', lang))}" title="${escapeHtml(
            t('cardAnswerAria', lang)
          )}"><img src="./assets/icons/ui/icon2_19.webp" alt="" class="card-answer-icon" /></button>`;
        }
        return escapeHtml(tok.value);
      })
      .join('');
  }

  #computePromptLengthTier(vm, hasDuoSpotlight = false) {
    const renderedLength = (vm?.promptTokens || []).reduce((acc, tok) => {
      if (tok.kind === 'player') {
        return acc + (tok.player?.name?.length || 6) + 3;
      }
      if (tok.kind === 'group' || tok.kind === 'all') {
        return acc + (tok.label?.length || 5) + 3;
      }
      if (tok.kind === 'question_resp') {
        return acc + 6;
      }
      return acc + (tok.value?.length || 0);
    }, 0);
    const effectiveLength = renderedLength + (hasDuoSpotlight ? 22 : 0);

    if (effectiveLength <= 105) return 'short';
    if (effectiveLength <= 145) return 'medium';
    if (effectiveLength <= 185) return 'long';
    return 'xl';
  }

  #fitActiveCardPrompt(cardEl) {
    if (!cardEl) return;
    this.activeFitCardEl = cardEl;

    const TIER_MAX = {
      short: 42,
      medium: 36,
      long: 32,
      xl: 28,
    };

    const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()));
    const waitAssetsReady = () => {
      const promises = [];
      if (document.fonts && document.fonts.status !== 'loaded') {
        promises.push(document.fonts.ready.catch(() => null));
      }
      cardEl.querySelectorAll('img').forEach((img) => {
        if (!img.complete) {
          promises.push(
            new Promise((resolve) => {
              img.addEventListener('load', resolve, { once: true });
              img.addEventListener('error', resolve, { once: true });
            })
          );
        }
      });
      if (!promises.length) return Promise.resolve();
      return Promise.race([
        Promise.all(promises),
        new Promise((resolve) => setTimeout(resolve, 260)),
      ]);
    };

    const fitPromptDirectly = (fitEl, promptEl) => {
      const fitW = fitEl.clientWidth;
      const fitH = fitEl.clientHeight;
      const cardW = cardEl.clientWidth || fitW;
      const cardH = cardEl.clientHeight || fitH;
      const vw = window.innerWidth || cardW;
      const vh = window.innerHeight || cardH;
      if (fitW <= 0 || fitH <= 0) return null;

      const fitCs = getComputedStyle(fitEl);
      const innerW = Math.max(
        60,
        fitW - parseFloat(fitCs.paddingLeft || '0') - parseFloat(fitCs.paddingRight || '0')
      );
      const innerH = Math.max(
        48,
        fitH - parseFloat(fitCs.paddingTop || '0') - parseFloat(fitCs.paddingBottom || '0')
      );

      const textScale =
        parseFloat(getComputedStyle(cardEl).getPropertyValue('--text-scale')) || 1.3;
      const scaleFactor = Math.max(0.85, Math.min(1.25, textScale / 1.3));
      const tier = promptEl.dataset.lenTier || 'medium';
      const tierMax = TIER_MAX[tier] || 36;

      const plainLen = Math.max(12, (promptEl.textContent || '').replace(/\s+/g, ' ').trim().length);
      const chipCount = promptEl.querySelectorAll('.prompt-player-chip').length;
      const effectiveChars = plainLen + chipCount * 5;

      const minPx = 12;
      const maxPx = Math.max(
        minPx + 4,
        Math.min(innerW * 0.135, innerH * 0.3, cardW * 0.12, vw * 0.09, vh * 0.052, tierMax * scaleFactor)
      );
      const estPx = Math.max(
        minPx,
        Math.min(maxPx, Math.sqrt((innerW * innerH * 0.72) / effectiveChars))
      );

      // Mide promptEl con margen horizontal (7%) y vertical (10%+4px) para absorber cambios de rasterizacion tras el fade.
      const safeW = Math.max(48, Math.round(innerW * 0.93));
      const safeH = Math.max(36, Math.round(innerH * 0.9) - 4);
      const textFitsBox = (px) => {
        promptEl.style.fontSize = `${px.toFixed(2)}px`;
        promptEl.style.maxWidth = `${safeW}px`;
        const rectH = promptEl.getBoundingClientRect().height;
        const measuredH = Math.max(promptEl.scrollHeight, Math.ceil(rectH));
        return measuredH <= safeH && promptEl.scrollWidth <= safeW + 2;
      };

      let lo = minPx;
      let hi = maxPx;
      let best = estPx;

      if (textFitsBox(estPx)) {
        lo = estPx;
        best = estPx;
      } else {
        hi = estPx;
        best = minPx;
      }

      for (let step = 0; step < 9; step += 1) {
        if (hi - lo < 0.35) break;
        const mid = (lo + hi) / 2;
        if (textFitsBox(mid)) {
          best = mid;
          lo = mid;
        } else {
          hi = mid;
        }
      }

      promptEl.style.fontSize = `${best.toFixed(2)}px`;
      let safety = 0;
      while (!textFitsBox(best) && best > minPx && safety < 16) {
        best = Math.max(minPx, best - 0.5);
        promptEl.style.fontSize = `${best.toFixed(2)}px`;
        safety += 1;
      }
      promptEl.style.maxWidth = '';

      promptEl.dataset.fitScale = (best / Math.max(1, estPx)).toFixed(2);
      return { best, fitW: Math.round(fitW), fitH: Math.round(fitH) };
    };

    let revealed = false;
    let settledW = 0;
    let settledH = 0;
    const fitToken = (this.fitRunToken || 0) + 1;
    this.fitRunToken = fitToken;
    const isStale = () =>
      !cardEl.isConnected || this.activeFitCardEl !== cardEl || this.fitRunToken !== fitToken;

    const runInitialFit = async () => {
      try {
        const preFitEl =
          cardEl.querySelector('.card-prompt-fit') || cardEl.querySelector('.card-body-fit');
        const prePromptEl = cardEl.querySelector('.card-prompt-text');
        if (preFitEl && prePromptEl && preFitEl.clientHeight > 0 && preFitEl.clientWidth > 0) {
          fitPromptDirectly(preFitEl, prePromptEl);
        }

        await nextFrame();
        if (isStale()) return;

        await waitAssetsReady();
        if (isStale()) return;

        let fitEl = cardEl.querySelector('.card-prompt-fit') || cardEl.querySelector('.card-body-fit');
        let promptEl = cardEl.querySelector('.card-prompt-text');
        if (!fitEl || !promptEl) return;

        if (fitEl.clientHeight <= 0 || fitEl.clientWidth <= 0) {
          await nextFrame();
          if (isStale()) return;
          fitEl = cardEl.querySelector('.card-prompt-fit') || cardEl.querySelector('.card-body-fit');
          promptEl = cardEl.querySelector('.card-prompt-text');
          if (!fitEl || !promptEl) return;
        }

        const res = fitPromptDirectly(fitEl, promptEl);
        if (res) {
          settledW = res.fitW;
          settledH = res.fitH;
        }
      } finally {
        if (!isStale()) {
          revealed = true;
          cardEl.querySelector('.card-prompt-text')?.classList.add('is-prompt-ready');
          const curFit =
            cardEl.querySelector('.card-prompt-fit') || cardEl.querySelector('.card-body-fit');
          const curPrompt = cardEl.querySelector('.card-prompt-text');
          if (
            curFit &&
            curPrompt &&
            (Math.abs(Math.round(curFit.clientWidth) - settledW) > 2 ||
              Math.abs(Math.round(curFit.clientHeight) - settledH) > 2)
          ) {
            const res = fitPromptDirectly(curFit, curPrompt);
            if (res) {
              settledW = res.fitW;
              settledH = res.fitH;
            }
          }
        }
      }
    };

    void runInitialFit();

    const fitTarget = cardEl.querySelector('.card-prompt-fit') || cardEl;
    if (typeof ResizeObserver === 'function' && this.observedFitCardEl !== cardEl) {
      this.cardResizeObserver?.disconnect();
      this.observedFitCardEl = cardEl;
      this.cardResizeObserver = new ResizeObserver(() => {
        if (!revealed || !cardEl.isConnected || this.activeFitCardEl !== cardEl) return;
        const fitEl = cardEl.querySelector('.card-prompt-fit') || cardEl.querySelector('.card-body-fit');
        const promptEl = cardEl.querySelector('.card-prompt-text');
        if (!fitEl || !promptEl) return;
        const w = Math.round(fitEl.clientWidth);
        const h = Math.round(fitEl.clientHeight);
        if (Math.abs(w - settledW) > 3 || Math.abs(h - settledH) > 3) {
          const res = fitPromptDirectly(fitEl, promptEl);
          if (res) {
            settledW = res.fitW;
            settledH = res.fitH;
          }
        }
      });
      this.cardResizeObserver.observe(fitTarget);
    }
  }

  #buildSpecialHoloMarkup(fxMode) {
    let svgInner = '';

    if (fxMode === 'hot') {
      svgInner = `
        <svg class="card-holo-emblem-svg" viewBox="0 0 220 220" fill="none">
          <defs>
            <linearGradient id="holo-bevel-hot" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFF5C0" stop-opacity="0.95" />
              <stop offset="48%" stop-color="#FFB020" stop-opacity="0.65" />
              <stop offset="100%" stop-color="#FF3B30" stop-opacity="0.45" />
            </linearGradient>
          </defs>
          <path d="M113 18C113 18 158 56 158 108C158 117 155 126 150 133C156 123 158 111 158 111C174 125 180 144 174 164C166 189 141 204 110 204C74 204 46 177 46 140C46 105 68 83 84 67C82 82 88 94 88 94C93 66 108 42 113 18Z" fill="url(#holo-bevel-hot)" fill-opacity="0.34" stroke="url(#holo-bevel-hot)" stroke-width="3.2" stroke-linejoin="round" />
          <path d="M111 88C111 88 135 112 135 142C135 162 123 176 110 176C95 176 85 163 85 145C85 123 99 107 111 88Z" fill="#FFF8D6" fill-opacity="0.28" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="2" />
          <path d="M52 54L56 64L66 68L56 72L52 82L48 72L38 68L48 64Z" fill="#FFF3B0" fill-opacity="0.7" />
          <path d="M174 44L177 52L185 55L177 58L174 66L171 58L163 55L171 52Z" fill="#FFFFFF" fill-opacity="0.68" />
        </svg>
      `;
    } else if (fxMode === 'duel') {
      svgInner = `
        <svg class="card-holo-emblem-svg" viewBox="0 0 220 220" fill="none">
          <defs>
            <linearGradient id="holo-bevel-duel" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.92" />
              <stop offset="50%" stop-color="#FFD166" stop-opacity="0.68" />
              <stop offset="100%" stop-color="#47E9D2" stop-opacity="0.55" />
            </linearGradient>
          </defs>
          <path d="M126 16L84 114H116L94 204L146 98H112L126 16Z" fill="url(#holo-bevel-duel)" fill-opacity="0.34" stroke="#FFFFFF" stroke-opacity="0.62" stroke-width="3" stroke-linejoin="round" />
          <path d="M26 70L50 142L74 70H58L50 106L42 70H26Z" fill="url(#holo-bevel-duel)" fill-opacity="0.32" stroke="#FFFFFF" stroke-opacity="0.52" stroke-width="2.4" stroke-linejoin="round" />
          <path d="M192 84C192 75 182 70 168 70C153 70 145 77 145 87C145 98 154 103 169 107C180 110 183 113 183 119C183 125 177 129 167 129C158 129 151 125 148 119L137 128C142 138 153 143 167 143C184 143 196 134 196 119C196 107 188 100 172 95C161 92 158 89 158 85C158 80 163 78 169 78C176 78 180 81 182 86Z" fill="url(#holo-bevel-duel)" fill-opacity="0.32" stroke="#FFFFFF" stroke-opacity="0.52" stroke-width="2.2" stroke-linejoin="round" />
          <line x1="20" y1="186" x2="200" y2="34" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="2" stroke-dasharray="10 8" />
        </svg>
      `;
    } else if (fxMode === 'event') {
      svgInner = `
        <svg class="card-holo-emblem-svg" viewBox="0 0 220 220" fill="none">
          <defs>
            <linearGradient id="holo-bevel-event" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95" />
              <stop offset="48%" stop-color="#FFE47A" stop-opacity="0.68" />
              <stop offset="100%" stop-color="#47E9D2" stop-opacity="0.58" />
            </linearGradient>
          </defs>
          <circle cx="110" cy="110" r="76" stroke="url(#holo-bevel-event)" stroke-width="2.2" stroke-dasharray="10 7" stroke-opacity="0.62" />
          <path d="M110 20L128 84L192 102L128 120L110 184L92 120L28 102L92 84Z" fill="url(#holo-bevel-event)" fill-opacity="0.32" stroke="#FFFFFF" stroke-opacity="0.64" stroke-width="3" stroke-linejoin="round" />
          <path d="M168 32L174 48L190 54L174 60L168 76L162 60L146 54L162 48Z" fill="#FFFFFF" fill-opacity="0.72" />
          <path d="M46 148L51 161L64 166L51 171L46 184L41 171L28 166L41 161Z" fill="#FFFFFF" fill-opacity="0.65" />
        </svg>
      `;
    } else {
      svgInner = `
        <svg class="card-holo-emblem-svg" viewBox="0 0 220 220" fill="none">
          <defs>
            <linearGradient id="holo-bevel-star" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95" />
              <stop offset="46%" stop-color="#E6C2FF" stop-opacity="0.65" />
              <stop offset="100%" stop-color="#47E9D2" stop-opacity="0.55" />
            </linearGradient>
          </defs>
          <path d="M110 22L133 78L194 83L147 123L162 182L110 150L58 182L73 123L26 83L87 78Z" fill="url(#holo-bevel-star)" fill-opacity="0.3" stroke="#FFFFFF" stroke-opacity="0.66" stroke-width="3.2" stroke-linejoin="round" />
          <path d="M110 22V150M26 83L162 182M194 83L58 182" stroke="#FFFFFF" stroke-opacity="0.32" stroke-width="1.8" />
          <path d="M44 36L48 46L58 50L48 54L44 64L40 54L30 50L40 46Z" fill="#FFFFFF" fill-opacity="0.68" />
          <path d="M178 148L182 158L192 162L182 166L178 176L174 166L164 162L174 158Z" fill="#FFFFFF" fill-opacity="0.64" />
        </svg>
      `;
    }

    return `
      <span class="card-holo-foil" aria-hidden="true"></span>
      <span class="card-holo-emblem" aria-hidden="true">${svgInner}</span>
    `;
  }

  #buildPlayView(state) {
    const { lang, localPlayers, localGame, activeGameModeId } = state;
    const adapter = getModeAdapter(activeGameModeId);
    const vm = adapter?.buildTurnViewModel?.(localGame?.session, localPlayers);

    if (!vm) {
      return `
        <section class="play-stage">
          <div class="glass-panel active-event-panel">
            <p class="active-event-rule">${escapeHtml(t('catalogLoadErrorToast', lang))}</p>
            <button class="btn btn-primary" data-action="confirm-exit-game" type="button">
              <span>${escapeHtml(t('backToModesBtn', lang))}</span>
            </button>
          </div>
        </section>
      `;
    }

    if (activeGameModeId === 'cultura-chupistica') {
      return this.#buildCulturaChupisticaView(state, vm);
    }

    if (localGame?.finished) {
      const modeInfo = getModeDefinition(activeGameModeId) || LOCAL_GAME_MODES[0];
      const modeName = pickLocalizedText(modeInfo, 'title', lang);
      const totalPlayed = vm.targetTurns || vm.turnNumber || 45;
      return `
        <section class="play-stage">
          <div class="glass-panel active-event-panel" style="max-width: 440px; margin: auto; text-align: center; padding: 28px 22px; gap: 16px;">
            <span class="mode-pill">${modeInfo?.iconImg
          ? renderUiIconHtml(modeInfo.iconImg, 'ui-icon-xs')
          : escapeHtml(modeInfo?.icon || '🎉')
        } ${escapeHtml(modeName)}</span>
            <h2 style="margin: 0; font-size: 1.55rem;">${escapeHtml(t('gameFinishedTitle', lang))}</h2>
            <p class="active-event-rule" style="margin: 0;">${escapeHtml(
          t('gameFinishedDesc', lang).replace('{max}', totalPlayed)
        )}</p>
            <span class="count-pill" style="align-self: center;">${escapeHtml(t('roundLabel', lang))} ${totalPlayed}/${totalPlayed}</span>
            <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; margin-top: 8px;">
              <button class="btn btn-primary" data-action="confirm-start-mode" type="button">
                <span>${escapeHtml(t('playAgainBtn', lang))}</span>
              </button>
              <button class="btn btn-ghost" data-action="confirm-exit-game" type="button">
                <span>${escapeHtml(t('backToModesBtn', lang))}</span>
              </button>
            </div>
          </div>
        </section>
      `;
    }

    if (vm.isVorChoice) {
      return this.#buildVorChoiceView(state, vm);
    }

    const modeInfo = getModeDefinition(activeGameModeId) || LOCAL_GAME_MODES[0];
    const modeName = pickLocalizedText(modeInfo, 'title', lang);
    const card = vm.card;
    const accent = vm.typeMeta?.color || DESIGN_TOKENS.shotPink;
    const cardBg = vm.typeMeta?.cardGradient || 'var(--oms-gradient-party)';
    const cardInk = vm.typeMeta?.onCardColor || 'var(--oms-text-on-vibrant)';
    const isLightInk = cardInk === 'var(--oms-white)';
    const specialFxMeta = SPECIAL_CARD_FX[vm.fxMode] || null;
    const specialClass = specialFxMeta ? `is-special-card fx-${vm.fxMode}` : '';
    const specialHoloHtml = specialFxMeta ? this.#buildSpecialHoloMarkup(vm.fxMode) : '';
    const cardDecorHtml = vm.typeMeta?.iconImg
      ? renderUiIconHtml(vm.typeMeta.iconImg, 'ui-icon-card')
      : escapeHtml(modeInfo.icon || '🎉');

    const isGroupCard = card.participantes === 'grupo';
    const primaryPlayer = vm.selectedPlayers[0] || null;
    const secondaryPlayer = vm.selectedPlayers[1] || null;
    const tertiaryPlayer = vm.selectedPlayers[2] || null;

    const isDuelCard = card.tipo === 'duelo' || card.categoryKey === 'versus' || card.tipo === 'versus';
    const isHotCard = card.tipo === 'hot';

    let vsTagHtml = '';
    if (isDuelCard) {
      vsTagHtml = `<span class="duo-vs-tag duo-vs-icon-tag">${renderUiIconHtml(UI_ICONS.vs, 'ui-icon-duo-vs')}</span>`;
    } else if (isHotCard) {
      vsTagHtml = `<span class="duo-vs-tag duo-hot-icon-tag">${renderUiIconHtml(UI_ICONS.flame, 'ui-icon-duo-hot')}</span>`;
    }

    const duoSpotlightHtml =
      !isGroupCard && primaryPlayer && secondaryPlayer
        ? tertiaryPlayer
          ? `
            <div class="card-duo-spotlight card-trio-spotlight">
              <span class="duo-player-tag">
                ${renderAvatarHtml(primaryPlayer.avatarEmoji, 'avatar-img avatar-mini-img', '')}
                <span>${escapeHtml(primaryPlayer.name)}</span>
                ${primaryPlayer.drinksAlcohol === false ? renderShotIconHtml(false, 'mini') : ''}
              </span>
              <span class="duo-player-tag">
                ${renderAvatarHtml(secondaryPlayer.avatarEmoji, 'avatar-img avatar-mini-img', '')}
                <span>${escapeHtml(secondaryPlayer.name)}</span>
                ${secondaryPlayer.drinksAlcohol === false ? renderShotIconHtml(false, 'mini') : ''}
              </span>
              <span class="duo-player-tag">
                ${renderAvatarHtml(tertiaryPlayer.avatarEmoji, 'avatar-img avatar-mini-img', '')}
                <span>${escapeHtml(tertiaryPlayer.name)}</span>
                ${tertiaryPlayer.drinksAlcohol === false ? renderShotIconHtml(false, 'mini') : ''}
              </span>
            </div>
          `
          : `
            <div class="card-duo-spotlight">
              <span class="duo-player-tag">
                ${renderAvatarHtml(primaryPlayer.avatarEmoji, 'avatar-img avatar-mini-img', '')}
                <span>${escapeHtml(primaryPlayer.name)}</span>
                ${primaryPlayer.drinksAlcohol === false ? renderShotIconHtml(false, 'mini') : ''}
              </span>
              ${vsTagHtml}
              <span class="duo-player-tag">
                ${renderAvatarHtml(secondaryPlayer.avatarEmoji, 'avatar-img avatar-mini-img', '')}
                <span>${escapeHtml(secondaryPlayer.name)}</span>
                ${secondaryPlayer.drinksAlcohol === false ? renderShotIconHtml(false, 'mini') : ''}
              </span>
            </div>
          `
        : '';

    let cardPlayerLeftHtml = '';
    if (isGroupCard) {
      cardPlayerLeftHtml = `
        <span class="card-player-pill">
          ${renderUiIconHtml(UI_ICONS.playersGroup, 'ui-icon-xs')}
          <span>${escapeHtml(t('groupTag', lang))}</span>
        </span>
      `;
    } else if (primaryPlayer) {
      cardPlayerLeftHtml = `
        <span class="card-player-pill">
          ${renderAvatarHtml(primaryPlayer.avatarEmoji, 'avatar-img avatar-mini-img', '')}
          <span>${escapeHtml(primaryPlayer.name)}</span>
          ${primaryPlayer.drinksAlcohol === false ? renderShotIconHtml(false, 'mini') : ''}
        </span>
      `;
    } else {
      cardPlayerLeftHtml = `<span class="card-player-pill"><span>${escapeHtml(modeName)}</span></span>`;
    }

    const promptLengthTier = this.#computePromptLengthTier(vm, Boolean(duoSpotlightHtml));
    const isLongPrompt = promptLengthTier === 'long' || promptLengthTier === 'xl';

    const swipeHintText = vm.isEventActivation
      ? t('swipeHintEventActivation', lang)
      : t('swipeHintNormal', lang);

    const activeEventsHudHtml = vm.activeEvents?.length
      ? `
        <div class="active-events-hud-row" aria-live="polite">
          ${vm.activeEvents
        .map((ev) => {
          const remaining = Math.max(1, Number(ev.turnsRemaining) || 1);
          const turnsText =
            remaining === 1
              ? `1 ${t('turnsRemainingSingular', lang)}`
              : `${remaining} ${t('turnsRemainingPlural', lang)}`;
          return `
                <span class="active-event-hud-badge">
                  <span class="active-event-hud-dot" aria-hidden="true">⚡</span>
                  <span class="active-event-hud-rule">${escapeHtml(ev.rule || '')}</span>
                  <span class="active-event-hud-turns">${escapeHtml(turnsText)}</span>
                </span>
              `;
        })
        .join('')}
        </div>
      `
      : '';

    const animKey = `${vm.turnNumber || 0}-${card.id || ''}`;
    const diceState = this.diceRolledForCardKey[animKey] || null;

    let diceWidgetHtml = '';
    if (vm.isDiceCard) {
      const activeFace = this.diceRolling ? this.diceCurrentFace : (diceState?.value || 1);
      const faceSrc = `./assets/icons/dice/dice_${activeFace}.svg`;

      let actionHtml = '';
      if (!diceState && !this.diceRolling) {
        actionHtml = `<button type="button" class="oms-btn dice-roll-btn" id="roll-dice-btn">🎲 Lanzar dado</button>`;
      } else if (this.diceRolling) {
        actionHtml = `<div class="dice-rolling-label">¡Tirando el dado... 🎲!</div>`;
      } else if (diceState) {
        const threshold = vm.diceConfig?.threshold ?? 3;
        const isSafe = diceState.value > threshold;
        const targetPass = threshold + 1;
        actionHtml = `
          <div class="dice-verdict-badge ${isSafe ? 'is-safe' : 'is-penalty'}">
            ${isSafe
            ? `🎲 Sacaste ${diceState.value} (${targetPass} o más) · ¡Te salvaste! 🎉`
            : `🎲 Sacaste ${diceState.value} (${threshold} o menos) · ¡A cumplir penitencia o beber! 🍻`}
          </div>
        `;
      }

      diceWidgetHtml = `
        <div class="card-dice-widget ${this.diceRolling ? 'is-rolling' : ''} ${diceState ? 'has-result' : ''}">
          <div class="dice-box-frame" id="dice-box-frame">
            <img id="active-dice-img" class="dice-face-img" src="${faceSrc}" alt="Dado" />
          </div>
          ${actionHtml}
        </div>
      `;
    }

    const centerCardHtml = `
      <div class="swipe-card-stage">
        <div
          class="swipe-card ${isLightInk ? 'is-light-ink' : ''} ${specialClass}"
          id="active-swipe-card"
          data-card-fx="${escapeHtml(vm.fxMode)}"
          aria-live="polite"
          style="--active-card-bg: ${escapeHtml(cardBg)}; --active-card-ink: ${escapeHtml(
      cardInk
    )}; --active-accent: ${escapeHtml(specialFxMeta?.accent || accent)};"
        >
          ${specialHoloHtml}
          <span class="card-specular-glare" aria-hidden="true"></span>
          <span class="card-holo-rim" aria-hidden="true"></span>
          <div class="card-header-meta">
            ${cardPlayerLeftHtml}
            <div class="card-header-badges">
              <span class="card-type-badge">${escapeHtml(vm.typeLabel)}</span>
              ${vm.card?.isCustom ? '<span class="card-custom-badge">⭐ Personalizada</span>' : ''}
            </div>
          </div>
          <div class="card-body-fit">
            <div class="card-decor-emoji" aria-hidden="true">${cardDecorHtml}</div>
            ${duoSpotlightHtml}
            <div class="card-prompt-fit">
              <div class="card-prompt-text ${isLongPrompt ? 'is-long-prompt' : ''
      }" data-len-tier="${promptLengthTier}">${this.#buildPromptHtml(vm)}</div>
            </div>
            ${diceWidgetHtml}
          </div>
        </div>
      </div>
    `;

    const minAllowed = Math.min(10, Math.max(1, Math.round(Number(vm.minIntensity || state.minIntensity || 1))));
    const maxAllowed = Math.min(10, Math.max(minAllowed, Math.round(Number(vm.maxIntensity || state.maxIntensity || 10))));
    const rawCardLevel = Number(vm.card?.intensidad ?? vm.cardIntensity);
    const cardLevel =
      !Number.isFinite(rawCardLevel) || rawCardLevel < 1
        ? Math.min(maxAllowed, Math.max(minAllowed, Math.round(Number(vm.targetIntensity || maxAllowed))))
        : Math.min(maxAllowed, Math.max(minAllowed, Math.round(rawCardLevel)));

    const levelBarHtml = `
      <img
        src="./assets/icons/levels/level_${String(cardLevel).padStart(2, '0')}.webp"
        alt="${escapeHtml(t('levelLabel', lang))} ${cardLevel}"
        title="${escapeHtml(t('levelLabel', lang))} ${cardLevel}"
        class="level-bar-img"
        loading="eager"
        decoding="async"
      />
    `;

    return `
      <section class="play-stage">
        <div id="swipe-vignette-overlay" class="swipe-vignette-overlay" aria-hidden="true"></div>
        <div class="play-hud">
          <div class="play-progress-row">
            <span class="count-pill">${escapeHtml(t('roundLabel', lang))} ${vm.turnNumber}/${vm.targetTurns || 45
      }</span>
            ${levelBarHtml}
          </div>

          ${activeEventsHudHtml}
        </div>

        <div class="deck-stage-center">
          ${centerCardHtml}
        </div>

        <div class="play-footer-hint">
          <div class="swipe-helper-text">${escapeHtml(swipeHintText)}</div>
        </div>
      </section>
    `;
  }

  #buildVorChoiceView(state, vm) {
    const { lang } = state;
    const activePlayer = vm.activePlayer || { name: 'Jugador', avatarEmoji: '' };
    const maxConsecutive = vm.maxConsecutiveTruths ?? 3;
    const consecutiveTruths = vm.consecutiveTruths ?? 0;
    const truthLocked = Boolean(vm.truthLocked);
    const playerColor = activePlayer.avatarColor || 'var(--oms-pink)';

    const lockedAlertHtml = truthLocked
      ? `
        <div class="vor-truth-alert is-locked" role="alert">
          <span class="vor-alert-icon">🔒</span>
          <div class="vor-alert-content">
            <strong>${escapeHtml(t('vorLockedTruthAlert', lang))}</strong>
          </div>
        </div>
      `
      : maxConsecutive > 0
        ? `
          <div class="vor-truth-counter-pill">
            <span class="vor-counter-dot" style="background: ${consecutiveTruths >= maxConsecutive - 1 ? '#ff3b30' : '#47e9d2'};"></span>
            <span>${escapeHtml(
              t('vorTruthStreakPill', lang)
                .replace('{current}', consecutiveTruths)
                .replace('{max}', maxConsecutive)
            )}</span>
          </div>
        `
        : '';

    return `
      <section class="play-stage vor-play-stage">
        <div class="vor-choice-container">
          <!-- Active Player Spotlight Banner -->
          <div class="vor-player-spotlight" style="--spotlight-accent: ${escapeHtml(playerColor)};">
            <div class="vor-avatar-wrap">
              ${renderAvatarHtml(activePlayer.avatarEmoji, 'avatar-img vor-spotlight-avatar', '')}
              <div class="vor-avatar-halo" aria-hidden="true"></div>
            </div>
            <div class="vor-spotlight-info">
              <span class="vor-spotlight-badge">¡TU TURNO!</span>
              <h2 class="vor-spotlight-name">${escapeHtml(activePlayer.name)}</h2>
              <p class="vor-spotlight-sub">${escapeHtml(t('vorSubtitle', lang))}</p>
            </div>
          </div>

          ${lockedAlertHtml}

          <!-- The Two Decision Cards -->
          <div class="vor-choice-grid">
            <!-- VERDAD CARD -->
            <button
              type="button"
              class="vor-choice-card is-truth ${truthLocked ? 'is-locked' : ''}"
              data-action="vor-choose-truth"
              ${truthLocked ? 'disabled aria-disabled="true"' : ''}
              aria-label="${escapeHtml(t('vorTruthCardTitle', lang))}"
            >
              <div class="vor-card-ambient" aria-hidden="true"></div>
              <div class="vor-card-header">
                <span class="vor-card-category-badge">${escapeHtml(t('vorTruthCardTitle', lang))}</span>
                <span class="vor-card-pill ${truthLocked ? 'is-locked-pill' : 'is-truth-pill'}">
                  ${truthLocked ? `🔒 ${escapeHtml(t('vorTruthLockedBtn', lang))}` : maxConsecutive > 0 ? `${consecutiveTruths}/${maxConsecutive}` : '∞'}
                </span>
              </div>
              <div class="vor-card-icon-wrap">
                <span class="vor-card-emoji">💬</span>
              </div>
              <h3 class="vor-card-headline">${escapeHtml(t('vorTruthCardTitle', lang))}</h3>
              <p class="vor-card-detail">${escapeHtml(t('vorTruthCardDesc', lang))}</p>
              <div class="vor-card-btn-action">
                <span>${truthLocked ? `🔒 ${escapeHtml(t('vorTruthLockedBtn', lang))}` : escapeHtml(t('vorPickTruthBtn', lang))}</span>
              </div>
            </button>

            <!-- RETO CARD -->
            <button
              type="button"
              class="vor-choice-card is-dare"
              data-action="vor-choose-dare"
              aria-label="${escapeHtml(t('vorDareCardTitle', lang))}"
            >
              <div class="vor-card-ambient" aria-hidden="true"></div>
              <div class="vor-card-header">
                <span class="vor-card-category-badge">${escapeHtml(t('vorDareCardTitle', lang))}</span>
                <span class="vor-card-pill is-dare-pill">🔥 Reset</span>
              </div>
              <div class="vor-card-icon-wrap">
                <span class="vor-card-emoji">🔥</span>
              </div>
              <h3 class="vor-card-headline">${escapeHtml(t('vorDareCardTitle', lang))}</h3>
              <p class="vor-card-detail">${escapeHtml(t('vorDareCardDesc', lang))}</p>
              <div class="vor-card-btn-action">
                <span>${escapeHtml(t('vorPickDareBtn', lang))}</span>
              </div>
            </button>
          </div>
        </div>
      </section>
    `;
  }

  #buildCulturaChupisticaView(state, vm) {
    const { lang } = state;
    const modeInfo = getModeDefinition('cultura-chupistica') || LOCAL_GAME_MODES[0];
    const modeName = pickLocalizedText(modeInfo, 'title', lang);

    // 1. Game Over / Podium Screen
    if (vm.isGameOver || vm.roundState === 'game_over' || state.localGame?.finished) {
      const winner = vm.winner;
      const loser = vm.shotKing;
      return `
        <section class="play-stage cultura-play-stage">
          <div class="cultura-gameover-card glass-panel">
            <div class="cultura-gameover-header">
              <span class="mode-pill">${modeInfo.iconImg ? renderUiIconHtml(modeInfo.iconImg, 'ui-icon-xs') : '🍻'} ${escapeHtml(modeName)}</span>
              <h2 class="cultura-gameover-title">${escapeHtml(t('culturaGameOverTitle', lang))}</h2>
              <p class="cultura-gameover-subtitle">${escapeHtml(t('roundLabel', lang))} ${vm.targetTurns}/${vm.targetTurns} · ${escapeHtml(t('culturaScoreboardTitle', lang))}</p>
            </div>

            <div class="cultura-podium-grid">
              ${winner ? `
              <div class="cultura-podium-card is-winner">
                <div class="cultura-podium-badge">${escapeHtml(t('culturaWinnerPill', lang))}</div>
                <div class="cultura-podium-avatar-wrap">
                  ${renderAvatarHtml(winner.player.avatarEmoji, 'avatar-img cultura-podium-avatar', '')}
                </div>
                <strong class="cultura-podium-name">${escapeHtml(winner.player.name)}</strong>
                <span class="cultura-podium-stat">${winner.fails} ${escapeHtml(t('culturaFailsCount', lang))}</span>
                <small class="cultura-podium-desc">${escapeHtml(t('culturaWinnerDesc', lang))}</small>
              </div>
              ` : ''}

              ${loser && (!winner || loser.player.id !== winner.player.id) ? `
              <div class="cultura-podium-card is-loser">
                <div class="cultura-podium-badge is-loser-badge">${escapeHtml(t('culturaLoserPill', lang))}</div>
                <div class="cultura-podium-avatar-wrap">
                  ${renderAvatarHtml(loser.player.avatarEmoji, 'avatar-img cultura-podium-avatar', '')}
                </div>
                <strong class="cultura-podium-name">${escapeHtml(loser.player.name)}</strong>
                <span class="cultura-podium-stat">${loser.fails} ${escapeHtml(t('culturaFailsCount', lang))}</span>
                <small class="cultura-podium-desc">${escapeHtml(t('culturaLoserDesc', lang))}</small>
              </div>
              ` : ''}
            </div>

            <div class="cultura-table-wrap">
              <table class="cultura-scoreboard-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>${escapeHtml(t('playerColumnTitle', lang) || 'Jugador')}</th>
                    <th style="text-align: right;">${escapeHtml(t('culturaFailsCount', lang))}</th>
                  </tr>
                </thead>
                <tbody>
                  ${vm.scoreboard.map((entry, idx) => `
                    <tr>
                      <td class="cultura-table-rank">#${idx + 1}</td>
                      <td class="cultura-table-player">
                        ${renderAvatarHtml(entry.player.avatarEmoji, 'avatar-img avatar-mini-img', '')}
                        <span>${escapeHtml(entry.player.name)}</span>
                      </td>
                      <td class="cultura-table-fails">
                        <span class="cultura-fail-pill ${entry.fails === 0 ? 'is-clean' : ''}">${entry.fails}</span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="cultura-gameover-actions">
              <button class="btn btn-primary" data-action="confirm-start-mode" type="button">
                <span>${escapeHtml(t('playAgainBtn', lang))}</span>
              </button>
              <button class="btn btn-ghost" data-action="confirm-exit-game" type="button">
                <span>${escapeHtml(t('backToModesBtn', lang))}</span>
              </button>
            </div>
          </div>
        </section>
      `;
    }

    // 2. Penalty Revealed Screen
    if (vm.roundState === 'penalty_revealed') {
      const failedPlayer = vm.lastFailedPlayer || { name: 'Alguien', avatarEmoji: '' };
      const failsCount = vm.scoreboard?.find((s) => s.player?.id === failedPlayer.id)?.fails || 1;
      const penaltyText = vm.lastPenalty?.description || vm.lastPenalty?.title || 'Toma 1 trago';

      return `
        <section class="play-stage cultura-play-stage">
          <div class="cultura-penalty-card glass-panel">
            <div class="cultura-penalty-header">
              <span class="cultura-penalty-alert-icon">💥</span>
              <h2 class="cultura-penalty-headline">¡${escapeHtml(failedPlayer.name)} falló!</h2>
            </div>

            <div class="cultura-penalty-avatar-spotlight">
              ${renderAvatarHtml(failedPlayer.avatarEmoji, 'avatar-img cultura-penalty-avatar', '')}
              <span class="cultura-penalty-fails-badge">
                ${failsCount} ${escapeHtml(t('culturaFailsCount', lang))}
              </span>
            </div>

            <div class="cultura-penalty-box">
              <span class="cultura-penalty-label">Penitencia asignada</span>
              <p class="cultura-penalty-desc">${escapeHtml(penaltyText)}</p>
            </div>

            <div class="cultura-penalty-actions">
              <button class="btn btn-primary btn-cultura-next" data-action="cultura-next-round" type="button">
                <span>${escapeHtml(t('culturaNextRoundBtn', lang))}</span>
              </button>
            </div>
          </div>
        </section>
      `;
    }

    // 3. Active Play Screen (and optional Fail Modal & Scoreboard Drawer)
    const cardLevel = Math.min(10, Math.max(1, Math.round(Number(vm.intensidad) || 1)));
    const levelBarHtml = `
      <img
        src="./assets/icons/levels/level_${String(cardLevel).padStart(2, '0')}.webp"
        alt="${escapeHtml(t('levelLabel', lang))} ${cardLevel}"
        title="${escapeHtml(t('levelLabel', lang))} ${cardLevel}"
        class="level-bar-img"
        loading="eager"
        decoding="async"
      />
    `;

    const totalDisplaySeconds =
      vm.timerMode === 'custom'
        ? (vm.customTimerSeconds || 20)
        : (parseInt(vm.timerMode, 10) || 10);

    const timerPillHtml =
      vm.timerMode === 'infinite'
        ? `<div class="cultura-timer-pill is-infinite"><span>${escapeHtml(t('culturaInfiniteTimer', lang))}</span></div>`
        : `<div class="cultura-timer-pill is-countdown"><span class="cultura-timer-clock">⏱️</span><span id="cultura-timer-display">${this.culturaTimeRemaining || totalDisplaySeconds}s</span></div>`;

    let failModalHtml = '';
    if (vm.roundState === 'fail_selection') {
      failModalHtml = `
        <div class="oms-modal-backdrop cultura-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="cultura-fail-title">
          <div class="oms-modal-card cultura-fail-modal-card">
            <div class="cultura-fail-modal-head">
              <span class="cultura-fail-modal-icon">💥</span>
              <div>
                <h2 id="cultura-fail-title" class="oms-modal-title">${escapeHtml(t('culturaWhoFailedTitle', lang))}</h2>
                <p class="settings-modal-subtitle">${escapeHtml(t('culturaWhoFailedDesc', lang))}</p>
              </div>
            </div>

            <div class="cultura-players-fail-grid">
              ${state.localPlayers.map((player) => {
                const fails = state.localGame?.session?.failsByPlayer?.[player.id] || 0;
                return `
                  <button
                    type="button"
                    class="cultura-player-fail-btn"
                    data-action="cultura-select-failed-player"
                    data-player-id="${escapeHtml(player.id)}"
                  >
                    <div class="cultura-fail-avatar-wrap">
                      ${renderAvatarHtml(player.avatarEmoji, 'avatar-img avatar-mini-img', '')}
                    </div>
                    <span class="cultura-fail-player-name">${escapeHtml(player.name)}</span>
                    <span class="cultura-fail-player-count">${fails} ${escapeHtml(t('culturaFailsCount', lang))}</span>
                  </button>
                `;
              }).join('')}
            </div>

            <div class="cultura-fail-modal-actions">
              <button class="btn btn-primary btn-cultura-none-failed" data-action="cultura-pass-none" type="button">
                <span>${escapeHtml(t('culturaNoneFailedBtn', lang))}</span>
              </button>
              <button class="btn btn-ghost btn-cultura-cancel" data-action="cultura-cancel-fail" type="button">
                <span>${escapeHtml(t('culturaContinueTopicBtn', lang))}</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    let scoreboardModalHtml = '';
    if (this.culturaScoreboardOpen) {
      scoreboardModalHtml = `
        <div class="oms-modal-backdrop cultura-scoreboard-backdrop" role="dialog" aria-modal="true">
          <div class="oms-modal-card cultura-scoreboard-card" style="max-width: 440px; width: 100%;">
            <div class="new-player-modal-head">
              <div class="settings-title-wrap">
                <span style="font-size: 1.6rem;">🏆</span>
                <div>
                  <h2 class="oms-modal-title">${escapeHtml(t('culturaScoreboardTitle', lang))}</h2>
                  <p class="settings-modal-subtitle">${escapeHtml(t('roundLabel', lang))} ${vm.currentTurn}/${vm.targetTurns}</p>
                </div>
              </div>
              <button type="button" class="modal-close-btn" data-action="cultura-close-scoreboard">
                ${renderUiIconHtml(UI_ICONS.closeX, 'ui-icon-sm')}
              </button>
            </div>
            <div class="cultura-table-wrap" style="margin-top: 14px;">
              <table class="cultura-scoreboard-table">
                <tbody>
                  ${vm.scoreboard.map((entry, idx) => `
                    <tr>
                      <td class="cultura-table-rank">#${idx + 1}</td>
                      <td class="cultura-table-player">
                        ${renderAvatarHtml(entry.player.avatarEmoji, 'avatar-img avatar-mini-img', '')}
                        <span>${escapeHtml(entry.player.name)}</span>
                      </td>
                      <td class="cultura-table-fails">
                        <span class="cultura-fail-pill ${entry.fails === 0 ? 'is-clean' : ''}">${entry.fails} ${escapeHtml(t('culturaFailsCount', lang))}</span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <section class="play-stage cultura-play-stage">
        <div id="swipe-vignette-overlay" class="swipe-vignette-overlay" aria-hidden="true"></div>
        <div class="play-hud cultura-hud">
          <div class="play-progress-row">
            <span class="count-pill">${escapeHtml(t('roundLabel', lang))} ${vm.currentTurn}/${vm.targetTurns}</span>
            ${timerPillHtml}
            ${levelBarHtml}
          </div>

          <div class="cultura-circle-hud">
            <div class="cultura-starter-tag">
              <span class="cultura-tag-label">${escapeHtml(t('culturaStarts', lang))}:</span>
              <span class="cultura-starter-pill">
                ${renderAvatarHtml(vm.starterPlayer?.avatarEmoji, 'avatar-img avatar-mini-img', '')}
                <strong>${escapeHtml(vm.starterPlayer?.name || 'Jugador')}</strong>
              </span>
            </div>
            <div class="cultura-direction-tag">
              <span class="cultura-direction-icon">↻</span>
              <span>${escapeHtml(t('culturaDirection', lang))}</span>
            </div>
            ${vm.trackFails ? `
              <button type="button" class="cultura-scoreboard-toggle-btn" data-action="cultura-toggle-scoreboard" title="${escapeHtml(t('culturaScoreboardTitle', lang))}">
                <span>🏆</span>
              </button>
            ` : ''}
          </div>
        </div>

        <div class="deck-stage-center">
          <div class="swipe-card-stage">
            <div
              class="swipe-card is-light-ink"
              id="active-swipe-card"
              data-card-fx="ambient"
              aria-live="polite"
              style="--active-card-bg: linear-gradient(155deg, #1b0a33 0%, #301057 50%, #4a157e 100%); --active-card-ink: var(--oms-white); --active-accent: #a855f7;"
            >
              <span class="card-specular-glare" aria-hidden="true"></span>
              <span class="card-holo-rim" aria-hidden="true"></span>
              <div class="card-header-meta">
                <div class="card-player-pill">
                  ${renderAvatarHtml(vm.starterPlayer?.avatarEmoji, 'avatar-img avatar-mini-img', '')}
                  <span class="card-player-name">${escapeHtml(vm.starterPlayer?.name)}</span>
                  <span class="cultura-turn-dir">↻</span>
                </div>
                <div class="card-header-badges">
                  <span class="card-type-badge">${escapeHtml((vm.categoria || 'clasico').toUpperCase())}</span>
                  <span class="card-lvl-badge">${escapeHtml(t('levelLabel', lang))} ${cardLevel}</span>
                </div>
              </div>

              <div class="card-body-fit">
                <div class="card-decor-emoji" aria-hidden="true">${modeInfo.iconImg ? renderUiIconHtml(modeInfo.iconImg, 'ui-icon-card') : '🍻'}</div>
                <div class="card-prompt-fit">
                  <div class="card-prompt-text cultura-prompt-text">
                    <span class="cultura-ritual-prefix">${escapeHtml(vm.ritualPrefix)}</span>
                    <h2 class="cultura-topic-title">${escapeHtml(vm.tema)}</h2>
                    <span class="cultura-ritual-connector">${escapeHtml(vm.ritualConnector)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="play-footer-hint">
          <div class="swipe-helper-text">${escapeHtml(t('culturaSwipeHint', lang))}</div>
        </div>

        ${failModalHtml}
        ${scoreboardModalHtml}
      </section>
    `;
  }

  render() {
    const state = store.getState();
    document.documentElement.lang = state.locale || state.lang || 'es';
    const isLargeText = state.textScaleMode === 'large' || state.textScaleMode === 'xl';
    const isAgeGateBlocking = this.#isAgeGateBlocking(state);
    document.body.classList.toggle('text-xl', isLargeText);
    document.body.classList.toggle('is-boot-black', state.screen === 'splash');
    document.body.classList.toggle('is-home-calm', state.screen === 'home');
    document.body.classList.toggle('is-creator-mode', state.screen === 'creator');
    document.body.classList.toggle('is-age-gate-blur', isAgeGateBlocking);
    document.body.classList.toggle(
      'is-loading-view',
      state.screen === 'preloader' || this.isTransitioning || this.isCountdownLaunching
    );
    document.body.classList.toggle('is-countdown-blur', this.isCountdownLaunching);
    audioFx.syncVolumes();

    // Actualiza el porcentaje de la pantalla negra sin reconstruir el DOM
    if (state.screen === 'splash' && this.rootEl.querySelector('.splash-black-loader')) {
      const pctEl = this.rootEl.querySelector('.splash-black-text');
      if (pctEl) {
        const pct = Math.max(0, Math.min(100, Math.round(Number(state.splashProgress) || 0)));
        pctEl.textContent = t('blackLoadingPct', state.lang).replace('{pct}', String(pct));
      }
      return;
    }

    // Actualiza barra y estado del preloader animado sin recrear el logo flotante
    if (state.screen === 'preloader' && this.rootEl.querySelector('.splash-screen')) {
      const pct = Math.max(0, Math.min(100, Math.round(Number(state.splashProgress) || 0)));
      const fillEl = this.rootEl.querySelector('.splash-progress-fill');
      const statusEl = this.rootEl.querySelector('.splash-status-text');
      if (fillEl) fillEl.style.width = `${pct}%`;
      if (statusEl) {
        statusEl.textContent =
          pct >= 100 ? t('splashReady', state.lang) : t('splashLoading', state.lang);
      }
      return;
    }

    this.viewAbortController?.abort();
    this.viewAbortController = new AbortController();
    this.detachSwipe?.();
    this.detachSwipe = null;
    this.#onCardDragEnd();
    this.#clearLongPress();
    let html = '';

    const ageGateModalHtml = isAgeGateBlocking ? this.#buildAgeGateModal(state) : '';
    const homeSettingsModalHtml =
      state.screen !== 'splash' && !isAgeGateBlocking && this.homeSettingsModalOpen
        ? this.#buildHomeSettingsModal(state)
        : '';
    const coffeeModalHtml =
      state.screen !== 'splash' && !isAgeGateBlocking && this.coffeeModalOpen
        ? this.#buildCoffeeModal(state)
        : '';
    const settingsModalHtml =
      state.screen !== 'splash' && !isAgeGateBlocking && this.settingsModalOpen
        ? this.#buildSettingsModal(state)
        : '';
    const creditsModalHtml =
      state.screen !== 'splash' && !isAgeGateBlocking && this.creditsModalOpen
        ? this.#buildCreditsModal(state)
        : '';
    const modeSettingsModalHtml =
      state.screen === 'instructions' && !isAgeGateBlocking && this.modeSettingsModalOpen
        ? this.#buildModeSettingsModal(state)
        : '';

    if (state.screen === 'splash') {
      html = `<main>${this.#buildSplashView(state)}</main>`;
    } else if (state.screen === 'preloader') {
      html = `<main>${this.#buildPreloaderView(state)}</main>`;
    } else if (state.screen === 'home') {
      html = `<main>${this.#buildHomeView(
        state
      )}</main>${homeSettingsModalHtml}${coffeeModalHtml}${creditsModalHtml}${ageGateModalHtml}`;
    } else if (state.screen === 'players') {
      const playerModalHtml = this.newPlayerModalOpen ? this.#buildNewPlayerModal(state) : '';
      html = `${this.#buildTopbar(state)}<main>${this.#buildPlayersSetupView(
        state
      )}</main>${playerModalHtml}${settingsModalHtml}${creditsModalHtml}${ageGateModalHtml}`;
    } else if (state.screen === 'menu') {
      html = `${this.#buildTopbar(state)}<main>${this.#buildMainMenuView(
        state
      )}</main>${settingsModalHtml}${creditsModalHtml}${ageGateModalHtml}`;
    } else if (state.screen === 'intensity') {
      html = `${this.#buildTopbar(state)}<main>${this.#buildIntensityView(
        state
      )}</main>${settingsModalHtml}${creditsModalHtml}${ageGateModalHtml}`;
    } else if (state.screen === 'instructions') {
      html = `${this.#buildTopbar(state)}<main>${this.#buildInstructionsView(
        state
      )}</main>${settingsModalHtml}${creditsModalHtml}${modeSettingsModalHtml}${ageGateModalHtml}`;
    } else if (state.screen === 'creator') {
      html = `${this.#buildTopbar(state)}<main class="creator-screen-main">${buildCreatorScreenHtml(
        state
      )}</main>${settingsModalHtml}${creditsModalHtml}${ageGateModalHtml}`;
    } else {
      const modalHtml = this.exitConfirmOpen ? this.#buildExitConfirmModal(state) : '';
      const answerModalHtml = this.cardAnswerModal ? this.#buildCardAnswerModal(state) : '';
      html = `${this.#buildTopbar(state)}<main>${this.#buildPlayView(
        state
      )}</main>${modalHtml}${answerModalHtml}${settingsModalHtml}${creditsModalHtml}${ageGateModalHtml}`;
    }

    this.rootEl.innerHTML = html;
    this.#bindViewEvents(state);
  }

  #bindSettingsModalEvents(signal) {
    const ageForm = document.querySelector('#age-gate-form');
    ageForm?.addEventListener(
      'submit',
      (e) => {
        e.preventDefault();
        const isAdult = e.submitter?.value === 'true';
        audioFx.tap();
        store.setAgeVerification(isAdult);
        if (isAdult) {
          visualFx.showToast(t('ageGateHotAutoToast', store.getState().lang));
        }
      },
      { signal }
    );

    const bindDropdownModalShell = (backdropId, onClose) => {
      const el = document.querySelector(backdropId);
      if (!el) return;
      el.addEventListener(
        'click',
        (e) => {
          if (e.target === el) {
            audioFx.tap();
            this.localeDropdownOpen = false;
            onClose();
            this.render();
            return;
          }
          if (this.localeDropdownOpen && !e.target.closest('#settings-locale-dropdown')) {
            this.localeDropdownOpen = false;
            this.render();
          }
        },
        { signal }
      );
    };

    bindDropdownModalShell('#settings-modal-backdrop', () => {
      this.settingsModalOpen = false;
    });
    bindDropdownModalShell('#home-settings-backdrop', () => {
      this.homeSettingsModalOpen = false;
    });
    bindDropdownModalShell('#mode-settings-backdrop', () => {
      this.modeSettingsModalOpen = false;
    });

    const coffeeBackdrop = document.querySelector('#coffee-modal-backdrop');
    coffeeBackdrop?.addEventListener(
      'click',
      (e) => {
        if (e.target === coffeeBackdrop) {
          audioFx.tap();
          this.coffeeModalOpen = false;
          this.render();
        }
      },
      { signal }
    );

    const bindHotSwitch = (inputId) => {
      document.querySelector(inputId)?.addEventListener(
        'change',
        (e) => {
          audioFx.tap();
          this.#setHotMode(Boolean(e.target.checked));
        },
        { signal }
      );
    };

    bindHotSwitch('#settings-hot-check');
    bindHotSwitch('#home-settings-hot-check');

    document.querySelector('#home-settings-fullscreen-check')?.addEventListener(
      'change',
      (e) => {
        audioFx.tap();
        store.setState({ startFullscreen: Boolean(e.target.checked) }, { silent: true });
      },
      { signal }
    );

    const bindAudioControls = (idPrefix) => {
      const musicRange = document.querySelector(`#${idPrefix}-music-range`);
      const musicValEl = document.querySelector(`#${idPrefix}-music-val`);
      musicRange?.addEventListener(
        'input',
        (e) => {
          const val = Number(e.target.value) || 0;
          musicRange.style.setProperty('--range-pct', `${val}%`);
          if (musicValEl) musicValEl.textContent = `${val}%`;
          store.setState({ musicVolume: val }, { silent: true });
          audioFx.unlock();
          audioFx.syncVolumes();
        },
        { signal }
      );

      const sfxRange = document.querySelector(`#${idPrefix}-sfx-range`);
      const sfxValEl = document.querySelector(`#${idPrefix}-sfx-val`);
      const sfxIconEl = document.querySelector(`#${idPrefix}-sfx-icon`);
      sfxRange?.addEventListener(
        'input',
        (e) => {
          const val = Number(e.target.value) || 0;
          sfxRange.style.setProperty('--range-pct', `${val}%`);
          if (sfxValEl) sfxValEl.textContent = `${val}%`;
          if (sfxIconEl) sfxIconEl.src = val > 0 ? UI_ICONS.soundOn : UI_ICONS.soundOff;
          store.setState({ sfxVolume: val }, { silent: true });
          audioFx.syncVolumes();
        },
        { signal }
      );
      sfxRange?.addEventListener(
        'change',
        () => {
          audioFx.tap();
        },
        { signal }
      );
    };

    bindAudioControls('home-settings');
    bindAudioControls('settings');

    document.querySelector('#settings-progressive-check')?.addEventListener(
      'change',
      (e) => {
        store.setState({ progressiveCurve: e.target.checked }, { silent: true });
        audioFx.tap();
      },
      { signal }
    );

    document.querySelector('#mode-settings-curve-check')?.addEventListener(
      'change',
      (e) => {
        store.setState({ progressiveCurve: e.target.checked }, { silent: true });
        audioFx.tap();
      },
      { signal }
    );

    document.querySelector('#cultura-settings-fails-check')?.addEventListener(
      'change',
      (e) => {
        audioFx.tap();
        store.updateCulturaChupisticaConfig({ trackFails: e.target.checked });
      },
      { signal }
    );

    document.querySelector('#mode-settings-bonus-check')?.addEventListener(
      'change',
      (e) => {
        const modeId = store.getState().activeGameModeId;
        if (modeId === 'yo-nunca') {
          store.updateYoNuncaConfig({ bonusEnabled: e.target.checked });
        } else if (modeId === 'quien') {
          store.updateQuienConfig({ bonusEnabled: e.target.checked });
        } else if (modeId === 'verdad-o-reto') {
          store.updateVerdadORetoConfig({ bonusEnabled: e.target.checked });
        }
        audioFx.tap();
      },
      { signal }
    );

    document.querySelector('#mode-settings-custom-cards-check')?.addEventListener(
      'change',
      (e) => {
        const modeId = store.getState().activeGameModeId;
        const isChecked = e.target.checked;
        audioFx.tap();
        if (modeId === 'yo-nunca') {
          store.updateYoNuncaConfig({ customCardsEnabled: isChecked });
        } else if (modeId === 'quien') {
          store.updateQuienConfig({ customCardsEnabled: isChecked });
        } else if (modeId === 'verdad-o-reto') {
          store.updateVerdadORetoConfig({ customCardsEnabled: isChecked });
        } else {
          store.updatePreviaMixConfig({ customCardsEnabled: isChecked });
        }
      },
      { signal }
    );

    const saveModeTargetTurns = (val) => {
      const modeId = store.getState().activeGameModeId;
      if (modeId === 'yo-nunca') {
        store.updateYoNuncaConfig({ targetTurns: val }, { silent: true });
      } else if (modeId === 'quien') {
        store.updateQuienConfig({ targetTurns: val }, { silent: true });
      } else if (modeId === 'verdad-o-reto') {
        store.updateVerdadORetoConfig({ targetTurns: val }, { silent: true });
      } else if (modeId === 'cultura-chupistica') {
        store.updateCulturaChupisticaConfig({ targetTurns: val }, { silent: true });
      } else {
        store.updatePreviaMixConfig({ targetTurns: val }, { silent: true });
      }
    };

    const targetCardsInput = document.querySelector('#mode-target-cards-input');
    const targetCardsPill = document.querySelector('#mode-cards-val-pill');
    const syncCardsPill = (val) => {
      if (targetCardsPill) {
        const lang = store.getState().lang;
        targetCardsPill.textContent = `${val} ${t('cardsUnit', lang)}`;
      }
    };

    targetCardsInput?.addEventListener(
      'input',
      (e) => {
        const rawDigits = String(e.target.value || '').replace(/\D+/g, '');
        if (e.target.value !== rawDigits) {
          e.target.value = rawDigits;
        }
        if (!rawDigits) return;
        const clamped = Math.max(5, Math.min(900, Number(rawDigits)));
        saveModeTargetTurns(clamped);
        syncCardsPill(clamped);
      },
      { signal }
    );

    targetCardsInput?.addEventListener(
      'blur',
      (e) => {
        const rawDigits = String(e.target.value || '').replace(/\D+/g, '');
        const parsed = Number(rawDigits);
        const clamped = Number.isFinite(parsed) && parsed > 0 ? Math.max(5, Math.min(900, Math.round(parsed))) : 45;
        e.target.value = String(clamped);
        saveModeTargetTurns(clamped);
        syncCardsPill(clamped);
      },
      { signal }
    );

    const culturaCustomTimerInput = document.querySelector('#cultura-custom-timer-input');
    const culturaCustomTimerPill = document.querySelector('.cultura-custom-timer-box .settings-val-pill');
    culturaCustomTimerInput?.addEventListener(
      'input',
      (e) => {
        const rawDigits = String(e.target.value || '').replace(/\D+/g, '');
        if (e.target.value !== rawDigits) {
          e.target.value = rawDigits;
        }
        if (!rawDigits) return;
        const clamped = Math.max(1, Math.min(60, Number(rawDigits)));
        store.updateCulturaChupisticaConfig({ customTimerSeconds: clamped }, { silent: true });
        const s = store.getState().localGame?.session;
        if (s && s.config) s.config.customTimerSeconds = clamped;
        if (culturaCustomTimerPill) culturaCustomTimerPill.textContent = `${clamped}s`;
      },
      { signal }
    );
    culturaCustomTimerInput?.addEventListener(
      'blur',
      (e) => {
        const rawDigits = String(e.target.value || '').replace(/\D+/g, '');
        const parsed = rawDigits ? Number(rawDigits) : NaN;
        const clamped = Number.isFinite(parsed) ? Math.max(1, Math.min(60, Math.round(parsed))) : 20;
        e.target.value = String(clamped);
        store.updateCulturaChupisticaConfig({ customTimerSeconds: clamped }, { silent: true });
        const s = store.getState().localGame?.session;
        if (s && s.config) s.config.customTimerSeconds = clamped;
        if (culturaCustomTimerPill) culturaCustomTimerPill.textContent = `${clamped}s`;
      },
      { signal }
    );
  }

  async #changeGameLocale(nextLocaleOrLang) {
    const nextLocale = store.setLocale(nextLocaleOrLang);
    const state = store.getState();
    const adapter = getModeAdapter(state.activeGameModeId);
    adapter?.preloadLocale?.(nextLocale).catch(() => null);

    if (state.localGame?.session && typeof adapter?.setSessionLocale === 'function') {
      try {
        const res = await adapter.setSessionLocale(state.localGame.session, nextLocale);
        if (res?.changed) {
          const latest = store.getState();
          store.setState({
            localGame: {
              ...latest.localGame,
              session: res.session
            }
          });
        }
      } catch (err) {
        console.error('[Previa Mix] Error actualizando idioma de partida:', err);
        visualFx.showToast(t('catalogLoadErrorToast', store.getState().lang));
      }
    }
  }

  #openEditPlayerModal(playerId) {
    const state = store.getState();
    const player = state.localPlayers.find((p) => p.id === playerId);
    if (!player) return;
    audioFx.tap();
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(25);
      } catch {
        // ignore
      }
    }
    this.editingPlayerId = player.id;
    this.draftPlayerName = player.name || '';
    const foundIdx = PLAYER_AVATARS.indexOf(player.avatarEmoji);
    this.draftAvatarIdx = foundIdx >= 0 ? foundIdx : 0;
    this.draftDrinksAlcohol = player.drinksAlcohol !== false;
    this.newPlayerModalOpen = true;
    this.render();
    try {
      window.getSelection?.()?.removeAllRanges?.();
    } catch {
      // ignore
    }
    const inp = document.querySelector('#new-player-input');
    if (inp) {
      inp.focus();
      inp.setSelectionRange(inp.value.length, inp.value.length);
    }
  }

  #bindPlayerLongPress(signal) {
    const triggers = this.rootEl.querySelectorAll('.player-edit-trigger');
    if (!triggers.length) return;

    let activePress = null;

    const cancelPress = () => {
      activePress = null;
      this.#clearLongPress();
    };

    window.addEventListener('scroll', cancelPress, { passive: true, signal });
    window.addEventListener('pointerup', cancelPress, { passive: true, signal });
    window.addEventListener('pointercancel', cancelPress, { passive: true, signal });
    this.rootEl
      .querySelector('.roster-scroll')
      ?.addEventListener('scroll', cancelPress, { passive: true, signal });

    triggers.forEach((btn) => {
      btn.addEventListener('contextmenu', (e) => e.preventDefault(), { signal });

      btn.addEventListener(
        'pointerdown',
        (e) => {
          if (e.pointerType === 'mouse' && e.button !== 0) return;
          if (this.isTransitioning || this.newPlayerModalOpen || this.settingsModalOpen) return;

          cancelPress();
          const playerId = btn.dataset.playerId;
          const cardEl = btn.closest('.player-chip-card');
          if (!playerId || !cardEl) return;

          activePress = {
            pointerId: e.pointerId,
            startX: e.clientX,
            startY: e.clientY
          };
          this.longPressCardEl = cardEl;

          this.longPressVisualTimer = setTimeout(() => {
            if (activePress && this.longPressCardEl === cardEl) {
              cardEl.classList.add('is-holding');
            }
          }, 110);

          this.longPressTimer = setTimeout(() => {
            if (!activePress) return;
            cancelPress();
            this.#openEditPlayerModal(playerId);
          }, 1050);
        },
        { signal }
      );

      btn.addEventListener(
        'pointermove',
        (e) => {
          if (!activePress || e.pointerId !== activePress.pointerId) return;
          if (Math.hypot(e.clientX - activePress.startX, e.clientY - activePress.startY) > 10) {
            cancelPress();
          }
        },
        { passive: true, signal }
      );

      btn.addEventListener(
        'pointerleave',
        (e) => {
          if (activePress && e.pointerId === activePress.pointerId) {
            cancelPress();
          }
        },
        { signal }
      );
    });
  }

  #bindViewEvents(state) {
    const signal = this.viewAbortController.signal;

    const newPlayerInput = document.querySelector('#new-player-input');
    if (newPlayerInput) {
      newPlayerInput.addEventListener(
        'input',
        (e) => {
          this.draftPlayerName = e.target.value;
        },
        { signal }
      );
      newPlayerInput.addEventListener(
        'keydown',
        (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            this.#submitPlayerModal();
          }
        },
        { signal }
      );
    }

    this.rootEl.querySelectorAll('[data-action]').forEach((el) => {
      el.addEventListener('click', () => this.#onAction(el), { signal });
    });

    this.#bindSettingsModalEvents(signal);
    if (state.screen === 'players') {
      this.#bindPlayerLongPress(signal);
    }
    if (state.screen === 'creator') {
      this.#bindCreatorEvents(signal);
    }
    if (state.screen === 'intensity') {
      const slider = document.querySelector('#intensity-range-slider');
      slider?.addEventListener(
        'input',
        (e) => {
          const val = Math.min(10, Math.max(1, Math.round(Number(e.target.value) || 10)));
          this.#updateIntensityUI(val, state.lang);
        },
        { signal }
      );
      slider?.addEventListener(
        'change',
        (e) => {
          const val = Math.min(10, Math.max(1, Math.round(Number(e.target.value) || 10)));
          audioFx.tap();
          this.#setGameIntensity(val, { renderNow: true });
        },
        { signal }
      );
    }

    const newPlayerBackdrop = document.querySelector('#new-player-modal-backdrop');
    newPlayerBackdrop?.addEventListener(
      'click',
      (e) => {
        if (e.target === newPlayerBackdrop) {
          audioFx.tap();
          this.newPlayerModalOpen = false;
          this.editingPlayerId = null;
          this.render();
        }
      },
      { signal }
    );

    const exitBackdrop = document.querySelector('#exit-confirm-backdrop');
    exitBackdrop?.addEventListener(
      'click',
      (e) => {
        if (e.target === exitBackdrop) {
          audioFx.tap();
          this.exitConfirmOpen = false;
          this.render();
        }
      },
      { signal }
    );

    const cardAnswerBackdrop = document.querySelector('#card-answer-backdrop');
    cardAnswerBackdrop?.addEventListener(
      'click',
      (e) => {
        if (e.target === cardAnswerBackdrop) {
          audioFx.tap();
          this.cardAnswerModal = null;
          this.render();
        }
      },
      { signal }
    );

    const creditsBackdrop = document.querySelector('#credits-modal-backdrop');
    creditsBackdrop?.addEventListener(
      'click',
      (e) => {
        if (e.target === creditsBackdrop) {
          audioFx.tap();
          this.#closeCreditsModal();
        }
      },
      { signal }
    );

    if (state.screen === 'play') {
      const isCultura = state.activeGameModeId === 'cultura-chupistica';
      if (isCultura) {
        const session = state.localGame?.session;
        document.documentElement.style.setProperty('--active-accent', '#a855f7');
        audioFx.setMusicMood('play');
        if (session && session.roundState === 'active' && session.config?.timerMode !== 'infinite') {
          if (!this.culturaTimerInterval) {
            this.#startCulturaTimerIfNeeded(session);
          }
        } else {
          this.#stopCulturaTimer();
        }
      }

      if (state.localGame?.finished) {
        audioFx.setMusicMood('normal');
        return;
      }
      const adapter = getModeAdapter(state.activeGameModeId);
      const vm = adapter?.buildTurnViewModel?.(state.localGame?.session, state.localPlayers);
      const cardEl = document.querySelector('#active-swipe-card');
      const card = vm?.card || null;
      const animKey = `${vm?.turnNumber || vm?.currentTurn || 0}-${card?.id || ''}`;
      const fxMode = vm?.fxMode || 'ambient';
      const specialFxMeta = SPECIAL_CARD_FX[fxMode] || null;
      const accent = isCultura ? '#a855f7' : (specialFxMeta?.accent || vm?.typeMeta?.color || DESIGN_TOKENS.chaosPurple);

      document.documentElement.style.setProperty('--active-accent', accent);
      stage3d.setSpecialFx(fxMode, specialFxMeta?.hex ?? vm?.typeMeta?.hex ?? 0x754ac1);
      visualFx.syncGameFxState(true, fxMode);
      const isHotCard = fxMode === 'hot' || card?.tipo === 'hot' || card?.category === 'hot';
      if (!isCultura) {
        audioFx.setMusicMood(isHotCard ? 'hot' : 'play');
      }
      this.#fitActiveCardPrompt(cardEl);

      if (cardEl && animKey !== this.lastAnimatedCardKey) {
        this.lastAnimatedCardKey = animKey;
        if (fxMode !== 'ambient') {
          visualFx.triggerSpecialCardFx(fxMode, cardEl, accent);
        } else {
          visualFx.animateCardPop(cardEl);
        }
      }

      const rollDiceBtn = document.querySelector('#roll-dice-btn');
      if (rollDiceBtn) {
        rollDiceBtn.addEventListener('click', () => this.#handleRollDice(vm, animKey), { signal });
      }

      if (
        cardEl &&
        vm &&
        !this.exitConfirmOpen &&
        !this.settingsModalOpen &&
        !this.creditsModalOpen
      ) {
        if (isCultura) {
          this.detachSwipe = attachCardSwipe(cardEl, {
            canSwipeLeft: true,
            canSwipeRight: true,
            onDragProgress: (info) => this.#onCardDragProgress(info, vm),
            onDragEnd: () => this.#onCardDragEnd(),
            onSwipeLeft: () => this.#handleCulturaCardSwipe(state.localGame?.session),
            onSwipeRight: () => this.#handleCulturaCardSwipe(state.localGame?.session)
          });
        } else {
          const isDiceBlocked = Boolean(vm.isDiceCard && !this.diceRolledForCardKey[animKey]);
          this.detachSwipe = attachCardSwipe(cardEl, {
            canSwipeLeft: isDiceBlocked
              ? false
              : vm.isEventActivation
                ? Boolean(vm.canComplete)
                : Boolean(vm.canSkip),
            canSwipeRight: isDiceBlocked ? false : Boolean(vm.canComplete),
            onBlockedSwipe: (direction) => {
              if (isDiceBlocked) {
                audioFx.tap();
                visualFx.showToast('¡Debes lanzar el dado primero! 🎲');
                return;
              }
              this.#notifyBlockedTurn(vm, direction);
            },
            onDragProgress: (info) => this.#onCardDragProgress(info, vm),
            onDragEnd: () => this.#onCardDragEnd(),
            onSwipeLeft: () =>
              this.#advanceCard({
                skipped: !vm.isEventActivation,
                fromSwipe: true,
                feedbackType: vm.isEventActivation ? 'god' : 'bad'
              }),
            onSwipeRight: () =>
              this.#advanceCard({
                skipped: false,
                fromSwipe: true,
                feedbackType: 'god'
              })
          });
        }
      }
    } else {
      this.lastAnimatedCardKey = '';
      const modeInfo =
        state.screen === 'instructions' || state.screen === 'intensity'
          ? LOCAL_GAME_MODES.find((m) => m.id === state.activeGameModeId)
          : null;
      const accent = modeInfo?.accent || DESIGN_TOKENS.shotPink;
      document.documentElement.style.setProperty('--active-accent', accent);
      stage3d.setSpecialFx('ambient', accent);
      visualFx.syncGameFxState(false, 'ambient');
      audioFx.setMusicMood('normal');
    }
  }

  #submitPlayerModal() {
    const { lang } = store.getState();
    const avatar = PLAYER_AVATARS[this.draftAvatarIdx % PLAYER_AVATARS.length];
    const wasEditing = Boolean(this.editingPlayerId);
    const result = wasEditing
      ? store.updateLocalPlayer(this.editingPlayerId, {
        name: this.draftPlayerName,
        avatarEmoji: avatar,
        drinksAlcohol: this.draftDrinksAlcohol
      })
      : store.addLocalPlayer(this.draftPlayerName, avatar, this.draftDrinksAlcohol);

    if (!result.ok) {
      audioFx.tap();
      if (result.reason === 'NOT_FOUND') {
        this.newPlayerModalOpen = false;
        this.editingPlayerId = null;
        this.render();
        return;
      }
      const msgKey =
        result.reason === 'MAX_REACHED' ? 'errMaxPlayers' : 'errEmptyPlayerName';
      visualFx.showToast(t(msgKey, lang));
      document.querySelector('#new-player-input')?.focus();
      return;
    }

    audioFx.tap();
    this.draftPlayerName = '';
    if (!wasEditing) {
      this.draftAvatarIdx = (this.draftAvatarIdx + 1) % PLAYER_AVATARS.length;
    }
    this.editingPlayerId = null;
    this.newPlayerModalOpen = false;
    this.render();
  }

  #notifyBlockedTurn(vm, direction = 'left') {
    const { lang } = store.getState();
    audioFx.tap();
    if (vm?.hasPendingEventPlayers) {
      const names = vm.pendingPlayers.map((p) => p.name).join(', ');
      visualFx.showToast(t('eventBlockedAdvanceToast', lang).replace('{names}', names));
      document.querySelector('.active-event-panel')?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
      return;
    }
    if (vm?.isEventActivation && direction === 'left') {
      visualFx.showToast(t('eventCannotSkipToast', lang));
    }
  }

  async #setHotMode(enable) {
    const state = store.getState();
    const { lang, activeGameModeId, localGame } = state;
    const isEnabled = Boolean(enable);
    const hasSession = Boolean(localGame?.session);

    store.updatePreviaMixConfig(
      (cfg) => {
        const filtered = (cfg.enabledTypes || []).filter((type) => type !== 'hot');
        return {
          ...cfg,
          enableHot: isEnabled,
          adultsConfirmed: isEnabled,
          everyoneConsentsHot: isEnabled,
          enabledTypes: isEnabled ? [...filtered, 'hot'] : filtered
        };
      },
      { silent: hasSession }
    );

    let replacedCard = false;
    if (hasSession) {
      const adapter = getModeAdapter(activeGameModeId);
      const res = await adapter.setHotEnabledMidGame(localGame.session, { enable: isEnabled });
      replacedCard = Boolean(res?.replacedCard);
      if (res?.changed) {
        store.setState({
          localGame: {
            ...localGame,
            session: res.session,
            ...(isEnabled ? {} : { lastOptionalNotice: null, lastSocialForfeitNotice: null })
          }
        });
      } else {
        this.render();
      }
    }

    const toastKey = isEnabled
      ? 'hotEnabledToast'
      : replacedCard
        ? 'hotReplacedToast'
        : 'hotDisabledToast';
    visualFx.showToast(t(toastKey, lang));
  }

  #updateIntensityUI(minVal, maxVal, lang) {
    let safeMin = Math.min(10, Math.max(1, Math.round(Number(minVal) || 1)));
    let safeMax = Math.min(10, Math.max(1, Math.round(Number(maxVal) || 10)));
    if (safeMin > safeMax) {
      const tmp = safeMin;
      safeMin = safeMax;
      safeMax = tmp;
    }

    const rangeInfo = getLocalizedIntensityRangeInfo(safeMin, safeMax, lang);

    const badge = document.querySelector('#intensity-badge');
    if (badge) {
      badge.textContent = rangeInfo.badgeText;
      badge.style.setProperty('--badge-accent', rangeInfo.accent);
    }

    const tagline = document.querySelector('#intensity-tagline');
    if (tagline) {
      tagline.textContent = rangeInfo.taglineText;
    }

    const title = document.querySelector('#intensity-level-title');
    if (title) {
      title.textContent = rangeInfo.name;
      title.style.color = rangeInfo.accent;
    }

    const minDisplay = document.querySelector('#intensity-min-display');
    if (minDisplay) minDisplay.textContent = String(safeMin);

    const maxDisplay = document.querySelector('#intensity-max-display');
    if (maxDisplay) maxDisplay.textContent = String(safeMax);

    const stepperMinMinus = document.querySelector('[data-action="step-min-intensity"][data-delta="-1"]');
    if (stepperMinMinus) stepperMinMinus.disabled = safeMin <= 1;

    const stepperMinPlus = document.querySelector('[data-action="step-min-intensity"][data-delta="1"]');
    if (stepperMinPlus) stepperMinPlus.disabled = safeMin >= 10;

    const stepperMaxMinus = document.querySelector('[data-action="step-max-intensity"][data-delta="-1"]');
    if (stepperMaxMinus) stepperMaxMinus.disabled = safeMax <= 1;

    const stepperMaxPlus = document.querySelector('[data-action="step-max-intensity"][data-delta="1"]');
    if (stepperMaxPlus) stepperMaxPlus.disabled = safeMax >= 10;

    document.querySelectorAll('.intensity-preset-chip').forEach((chip) => {
      const pMin = Number(chip.dataset.min);
      const pMax = Number(chip.dataset.max);
      const isActive = pMin === safeMin && pMax === safeMax;
      chip.classList.toggle('is-active', isActive);
      chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    document.querySelectorAll('.intensity-pill-btn').forEach((btn) => {
      const pillLevel = Number(btn.dataset.level);
      const isInRange = pillLevel >= safeMin && pillLevel <= safeMax;
      const isStart = pillLevel === safeMin;
      const isEnd = pillLevel === safeMax;
      const isSingle = safeMin === safeMax && isStart;

      btn.classList.toggle('is-in-range', isInRange);
      btn.classList.toggle('is-active', isInRange);
      btn.classList.toggle('is-range-start', isStart);
      btn.classList.toggle('is-range-end', isEnd);
      btn.classList.toggle('is-single-value', isSingle);
      btn.setAttribute('aria-pressed', isInRange ? 'true' : 'false');
    });

    const state = store.getState();
    store.setState(
      {
        minIntensity: safeMin,
        maxIntensity: safeMax,
        previaMixConfig: {
          ...(state.previaMixConfig || {}),
          minIntensity: safeMin,
          maxIntensity: safeMax
        }
      },
      { silent: true }
    );
  }

  #setGameIntensityRange(minVal, maxVal, { renderNow = false } = {}) {
    let safeMin = Math.min(10, Math.max(1, Math.round(Number(minVal) || 1)));
    let safeMax = Math.min(10, Math.max(1, Math.round(Number(maxVal) || 10)));
    if (safeMin > safeMax) {
      const tmp = safeMin;
      safeMin = safeMax;
      safeMax = tmp;
    }
    const state = store.getState();
    store.setState({
      minIntensity: safeMin,
      maxIntensity: safeMax,
      previaMixConfig: {
        ...(state.previaMixConfig || {}),
        minIntensity: safeMin,
        maxIntensity: safeMax
      }
    });
    if (renderNow) {
      this.render();
    } else {
      this.#updateIntensityUI(safeMin, safeMax, state.lang);
    }
  }

  #setGameIntensity(val, { renderNow = false } = {}) {
    this.#setGameIntensityRange(val, val, { renderNow });
  }

  #handleIntensityPillClick(level) {
    const safeLevel = Math.min(10, Math.max(1, Math.round(Number(level) || 1)));
    if (this.intensityAnchor === null) {
      this.intensityAnchor = safeLevel;
      this.#setGameIntensityRange(safeLevel, safeLevel, { renderNow: false });
    } else {
      const anchor = this.intensityAnchor;
      this.intensityAnchor = null;
      const newMin = Math.min(anchor, safeLevel);
      const newMax = Math.max(anchor, safeLevel);
      this.#setGameIntensityRange(newMin, newMax, { renderNow: false });
    }
  }

  #openModeIntensity(modeId) {
    this.intensityAnchor = null;
    const state = store.getState();
    if (state.localPlayers.length < MIN_PLAYERS) {
      visualFx.showToast(t('errMinPlayers', state.lang));
      this.#navigateWithLoader('players', 'loaderPlayers');
      return;
    }

    audioFx.tap();
    stage3d.pulse(0xff4fa3);
    const adapter = getModeAdapter(modeId);
    adapter?.preloadLocale?.(state.locale || state.previaMixConfig?.locale).catch(() => null);
    this.#navigateWithLoader('intensity', 'loaderIntensity', {
      beforeSwitch: () => ({ activeGameModeId: modeId })
    });
  }

  #openModeInstructions(modeId) {
    const state = store.getState();
    if (state.localPlayers.length < MIN_PLAYERS) {
      visualFx.showToast(t('errMinPlayers', state.lang));
      this.#navigateWithLoader('players', 'loaderPlayers');
      return;
    }

    audioFx.tap();
    stage3d.pulse(0xff4fa3);
    const adapter = getModeAdapter(modeId);
    adapter?.preloadLocale?.(state.locale || state.previaMixConfig?.locale).catch(() => null);
    this.#navigateWithLoader('instructions', 'loaderInstructions', {
      beforeSwitch: () => ({ activeGameModeId: modeId })
    });
  }

  async #openCardCreator() {
    audioFx.tap();
    this.modeSettingsModalOpen = false;
    creatorController.init();
    await this.#navigateWithLoader('creator', 'loaderMenu');
  }

  #bindCreatorEvents(signal) {
    const searchInput = document.querySelector('#creator-search-input');
    searchInput?.addEventListener(
      'input',
      (e) => {
        creatorController.setSearchQuery(e.target.value);
        this.render();
        const nextInput = document.querySelector('#creator-search-input');
        if (nextInput) {
          nextInput.focus();
          const len = nextInput.value.length;
          nextInput.setSelectionRange(len, len);
        }
      },
      { signal }
    );

    const categorySelect = document.querySelector('#creator-category-select');
    categorySelect?.addEventListener(
      'change',
      (e) => {
        audioFx.tap();
        creatorController.setFilterType(e.target.value);
        this.render();
      },
      { signal }
    );

    const intensitySelect = document.querySelector('#creator-intensity-select');
    intensitySelect?.addEventListener(
      'change',
      (e) => {
        audioFx.tap();
        creatorController.setFilterIntensity(e.target.value);
        this.render();
      },
      { signal }
    );

    const editIntensitySlider = document.querySelector('#creator-edit-intensidad');
    editIntensitySlider?.addEventListener(
      'input',
      (e) => {
        const val = e.target.value;
        const valEl = document.querySelector('#creator-intensity-val');
        if (valEl) valEl.textContent = `${val} / 10`;
        const imgEl = document.querySelector('#creator-intensity-preview-img');
        if (imgEl) {
          imgEl.src = `./assets/icons/levels/level_${String(val).padStart(2, '0')}.webp`;
          imgEl.alt = `Nivel ${val}`;
        }
      },
      { signal }
    );

    const fileInput = document.querySelector('#creator-file-input');
    fileInput?.addEventListener(
      'change',
      (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const text = ev.target?.result;
          if (typeof text === 'string') {
            const res = creatorController.importJson(text);
            if (res.ok) {
              if (res.limitCapped) {
                visualFx.showToast(`📥 Importadas ${res.imported} cartas (alcanzó el límite de 500).`);
              } else {
                visualFx.showToast(`📥 ¡${res.imported} cartas importadas exitosamente!`);
              }
              this.render();
            } else {
              visualFx.showToast(`⚠️ Error al importar archivo: ${res.error || 'Formato JSON inválido'}`);
            }
          }
        };
        reader.readAsText(file);
      },
      { signal }
    );
  }



  async #createInitialGamePatch(modeId) {
    const state = store.getState();
    const adapter = getModeAdapter(modeId);
    const minIntensity = state.minIntensity || 1;
    const maxIntensity = state.maxIntensity || 10;
    let modeConfig = {};
    if (modeId === 'yo-nunca') {
      const isBonus = state.yoNuncaConfig?.bonusEnabled !== false;
      modeConfig = {
        locale: state.locale,
        enabledTypes: isBonus ? ['yo nunca', 'bonus'] : ['yo nunca'],
        targetTurns: state.yoNuncaConfig?.targetTurns || 45,
        minIntensity,
        maxIntensity,
        bonusEnabled: isBonus
      };
    } else if (modeId === 'quien') {
      const isBonus = state.quienConfig?.bonusEnabled !== false;
      modeConfig = {
        locale: state.locale,
        enabledTypes: isBonus ? ['quien es más probable', 'bonus'] : ['quien es más probable'],
        targetTurns: state.quienConfig?.targetTurns || 45,
        minIntensity,
        maxIntensity,
        bonusEnabled: isBonus
      };
    } else if (modeId === 'verdad-o-reto') {
      const cfg = state.verdadORetoConfig || {};
      modeConfig = {
        locale: state.locale,
        turnOrder: cfg.turnOrder || 'secuencial',
        maxConsecutiveTruths: cfg.maxConsecutiveTruths ?? 3,
        bonusEnabled: cfg.bonusEnabled !== false,
        customCardsEnabled: cfg.customCardsEnabled !== false,
        targetTurns: cfg.targetTurns || 45,
        minIntensity,
        maxIntensity
      };
    } else if (modeId === 'cultura-chupistica') {
      const cfg = state.culturaChupisticaConfig || {};
      modeConfig = {
        locale: state.locale,
        timerMode: cfg.timerMode || 'infinite',
        customTimerSeconds: cfg.customTimerSeconds || 20,
        trackFails: cfg.trackFails !== false,
        targetTurns: cfg.targetTurns || 30,
        minIntensity,
        maxIntensity
      };
    } else {
      modeConfig = {
        ...(state.previaMixConfig || {}),
        minIntensity,
        maxIntensity
      };
    }

    const { session, wasPlayerCountCapped } = await adapter.createSession({
      localPlayers: state.localPlayers,
      appLang: state.lang,
      progressiveCurve: state.progressiveCurve,
      modeConfig
    });

    return {
      wasPlayerCountCapped,
      patch: {
        activeGameModeId: modeId,
        localGame: {
          modeId,
          session,
          skippedCount: 0,
          lastOptionalNotice: null,
          lastSocialForfeitNotice: null
        }
      }
    };
  }

  #renderLaunchCountdownStep(overlay, stepKey, pulseHex) {
    if (!overlay || !this.isCountdownLaunching) return;
    const isGo = stepKey === 'go';
    const src = COUNTDOWN_MEDIA[stepKey];

    overlay.innerHTML = `
      <div class="launch-countdown-stage">
        <div class="launch-countdown-halo ${isGo ? 'is-go' : ''}" aria-hidden="true"></div>
        <div class="launch-countdown-shadow" aria-hidden="true"></div>
        <span class="splash-sparkle launch-countdown-sparkle s1" aria-hidden="true">✦</span>
        <span class="splash-sparkle launch-countdown-sparkle s2" aria-hidden="true">✦</span>
        <span class="splash-sparkle launch-countdown-sparkle s3" aria-hidden="true">✦</span>
        <img
          class="launch-countdown-img ${isGo ? 'is-go' : 'is-num'}"
          src="${escapeHtml(src)}"
          alt="${isGo ? 'GO!' : escapeHtml(stepKey)}"
          decoding="sync"
        />
      </div>
    `;

    stage3d.pulse(pulseHex);
    if (isGo) {
      audioFx.go();
    } else {
      audioFx.count();
    }
  }

  async #commitStartGameMode(modeId, prebuilt = null) {
    const state = store.getState();
    try {
      const built = prebuilt || (await this.#createInitialGamePatch(modeId));
      store.recordSessionEvent({
        type: 'start_mode',
        modeId,
        playerCount: Math.min(state.localPlayers.length, PREVIA_MIX_MAX_PLAYERS)
      });
      window.scrollTo(0, 0);
      store.setState({
        ...built.patch,
        screen: 'play'
      });
      if (built.wasPlayerCountCapped) {
        visualFx.showToast(t('pmMaxPlayersCapNotice', state.lang));
      }
      enableWakeLock();
      visualFx.triggerConfetti('party');
      visualFx.triggerLensFlare(DESIGN_TOKENS.mintPop);
      stage3d.pulse(0x47e9d2);
    } catch (err) {
      console.error('[Previa Mix] Error iniciando partida:', err);
      visualFx.showToast(t('catalogLoadErrorToast', state.lang));
    }
  }

  async #launchLocalGameMode(modeId) {
    const state = store.getState();
    if (state.localPlayers.length < MIN_PLAYERS) {
      visualFx.showToast(t('errMinPlayers', state.lang));
      this.#navigateWithLoader('players', 'loaderPlayers');
      return;
    }
    if (this.isTransitioning || this.isCountdownLaunching || this.isPreparingLaunch) return;

    this.isPreparingLaunch = true;
    audioFx.tap();
    this.#showScreenLoader('loaderPlay');

    let prebuilt = null;
    try {
      const adapter = getModeAdapter(modeId);
      const safeLocale = state.locale || 'es';
      const [result] = await Promise.all([
        (async () => {
          await adapter.preloadLocale?.(safeLocale);
          return await this.#createInitialGamePatch(modeId);
        })(),
        new Promise((res) => setTimeout(res, 350))
      ]);
      prebuilt = result;
    } catch (err) {
      console.error('[LaunchGame] Error cargando catálogo o preparando partida:', err);
      this.isPreparingLaunch = false;
      this.#hideScreenLoader();
      visualFx.showToast(t('catalogLoadErrorToast', state.lang));
      return;
    }
    this.isPreparingLaunch = false;
    this.#hideScreenLoader();

    const overlay = document.querySelector('#launch-countdown-overlay');
    if (!overlay) {
      await this.#commitStartGameMode(modeId, prebuilt);
      return;
    }

    this.#clearTransitionTimers();
    this.#clearLaunchTimers({ resetOverlay: false });
    this.exitConfirmOpen = false;
    this.modeSettingsModalOpen = false;
    this.newPlayerModalOpen = false;
    this.settingsModalOpen = false;
    this.localeDropdownOpen = false;
    this.creditsModalOpen = false;
    this.creditsOpenedFromSettings = false;
    this.isCountdownLaunching = true;
    audioFx.setMusicMood('play');

    document.body.classList.add('is-countdown-blur', 'is-loading-view');
    overlay.hidden = false;
    overlay.classList.add('is-visible');

    // Secuencia bloqueante: 3 (0s), 2 (1s), 1 (2s), GO (3s) durante 500ms -> iniciar juego (3.5s)
    this.#renderLaunchCountdownStep(overlay, '3', 0xffd166);

    const schedule = [
      { key: '2', delayMs: 1000, hex: 0xff6d5a },
      { key: '1', delayMs: 2000, hex: 0xff4fa3 },
      { key: 'go', delayMs: 3000, hex: 0x47e9d2 }
    ];

    for (const step of schedule) {
      const timerId = setTimeout(() => {
        this.#renderLaunchCountdownStep(overlay, step.key, step.hex);
      }, step.delayMs);
      this.launchTimers.push(timerId);
    }

    const finishTimer = setTimeout(() => {
      if (!this.isCountdownLaunching) return;
      this.#clearLaunchTimers({ resetOverlay: true });
      void this.#commitStartGameMode(modeId, prebuilt);
    }, 3500);
    this.launchTimers.push(finishTimer);
  }

  #onCardDragProgress(info, currentVm = null) {
    if (document.body.classList.contains('is-swipe-feedback')) return;
    const { dx, isRight } = info;
    const vignetteEl = document.querySelector('#swipe-vignette-overlay');
    const absDx = Math.abs(dx);
    const startThreshold = 30;
    const maxThreshold = 95;

    if (absDx < startThreshold) {
      this.#onCardDragEnd();
      return;
    }

    const isSpecialEvent = Boolean(
      currentVm?.isEventActivation ||
      currentVm?.card?.tipo === 'eventos especiales'
    );

    const effectiveProgress = Math.min(1, (absDx - startThreshold) / (maxThreshold - startThreshold));
    const isGod = isSpecialEvent ? true : isRight;
    const color = isGod ? 'rgba(71, 233, 210, 0.94)' : 'rgba(255, 75, 114, 0.94)';
    const blurPx = (effectiveProgress * 15).toFixed(1);
    const opacity = (effectiveProgress * 0.96).toFixed(2);
    const brightness = (1 - effectiveProgress * 0.22).toFixed(2);

    document.body.classList.add('is-card-swiping');
    document.documentElement.style.setProperty('--swipe-blur-px', `${blurPx}px`);
    document.documentElement.style.setProperty('--swipe-brightness', brightness);
    document.body.style.setProperty('--swipe-blur-px', `${blurPx}px`);
    document.body.style.setProperty('--swipe-brightness', brightness);

    if (vignetteEl) {
      vignetteEl.style.setProperty('--swipe-vignette-color', color);
      vignetteEl.style.setProperty('--swipe-vignette-opacity', opacity);
    }
  }

  #onCardDragEnd() {
    if (document.body.classList.contains('is-swipe-feedback')) return;
    document.body.classList.remove('is-card-swiping');
    document.documentElement.style.removeProperty('--swipe-blur-px');
    document.documentElement.style.removeProperty('--swipe-brightness');
    document.body.style.removeProperty('--swipe-blur-px');
    document.body.style.removeProperty('--swipe-brightness');
    const vignetteEl = document.querySelector('#swipe-vignette-overlay');
    if (vignetteEl) {
      vignetteEl.style.setProperty('--swipe-vignette-opacity', '0');
    }
  }

  async #triggerSwipeFeedback(type = 'god') {
    const isGod = type === 'god';
    const color = isGod ? 'rgba(71, 233, 210, 0.96)' : 'rgba(255, 75, 114, 0.96)';
    const vignetteEl = document.querySelector('#swipe-vignette-overlay');
    const feedbackOverlay = document.querySelector('#swipe-feedback-overlay');

    document.body.classList.remove('is-card-swiping');
    document.body.classList.add('is-swipe-feedback');
    document.documentElement.style.setProperty('--swipe-blur-px', '14px');
    document.documentElement.style.setProperty('--swipe-brightness', '0.78');
    document.body.style.setProperty('--swipe-blur-px', '14px');
    document.body.style.setProperty('--swipe-brightness', '0.78');
    if (vignetteEl) {
      vignetteEl.style.setProperty('--swipe-vignette-color', color);
      vignetteEl.style.setProperty('--swipe-vignette-opacity', '1');
    }

    if (isGod) {
      audioFx.god();
    } else {
      audioFx.bad();
    }

    stage3d.pulse(isGod ? 0x47e9d2 : 0xff4b72);

    if (feedbackOverlay) {
      const src = SWIPE_FEEDBACK_MEDIA[type];
      feedbackOverlay.innerHTML = `
        <div class="swipe-feedback-stage">
          <div class="swipe-feedback-halo ${isGod ? 'is-god' : 'is-bad'}" aria-hidden="true"></div>
          <div class="swipe-feedback-shadow" aria-hidden="true"></div>
          <span class="splash-sparkle launch-countdown-sparkle s1" aria-hidden="true">✦</span>
          <span class="splash-sparkle launch-countdown-sparkle s2" aria-hidden="true">✦</span>
          <span class="splash-sparkle launch-countdown-sparkle s3" aria-hidden="true">✦</span>
          <img
            class="swipe-feedback-img ${isGod ? 'is-god' : 'is-bad'}"
            src="${escapeHtml(src)}"
            alt="${isGod ? 'God!' : 'Bad!'}"
            decoding="sync"
          />
        </div>
      `;
      feedbackOverlay.hidden = false;
    }

    await new Promise((resolve) => setTimeout(resolve, 720));

    if (feedbackOverlay) {
      feedbackOverlay.hidden = true;
      feedbackOverlay.innerHTML = '';
    }
    document.body.classList.remove('is-swipe-feedback');
    document.documentElement.style.removeProperty('--swipe-blur-px');
    document.documentElement.style.removeProperty('--swipe-brightness');
    document.body.style.removeProperty('--swipe-blur-px');
    document.body.style.removeProperty('--swipe-brightness');
    if (vignetteEl) {
      vignetteEl.style.setProperty('--swipe-vignette-opacity', '0');
    }
  }

  #handleRollDice(vm, animKey) {
    if (this.diceRolling || this.diceRolledForCardKey[animKey]) return;
    this.diceRolling = true;
    audioFx.tap();
    const diceImg = document.querySelector('#active-dice-img');
    const diceWidget = document.querySelector('.card-dice-widget');
    const rollBtn = document.querySelector('#roll-dice-btn');
    if (rollBtn) {
      rollBtn.disabled = true;
      rollBtn.style.display = 'none';
    }
    if (diceWidget) {
      diceWidget.classList.add('is-rolling');
    }

    let elapsed = 0;
    const intervalMs = 75;
    const totalMs = 3000;

    this.diceRollInterval = setInterval(() => {
      elapsed += intervalMs;
      this.diceCurrentFace = (this.diceCurrentFace % 6) + 1;
      if (diceImg) {
        diceImg.src = `./assets/icons/dice/dice_${this.diceCurrentFace}.svg`;
      }

      if (elapsed >= totalMs) {
        clearInterval(this.diceRollInterval);
        this.diceRollInterval = null;
        this.diceRolling = false;

        const finalFace = Math.floor(Math.random() * 6) + 1;
        this.diceCurrentFace = finalFace;
        this.diceRolledForCardKey[animKey] = { value: finalFace };

        const threshold = vm?.diceConfig?.threshold ?? 3;
        const isSafe = finalFace > threshold;

        if (isSafe) {
          audioFx.playFeedback?.('god');
        } else {
          audioFx.playFeedback?.('bad');
        }

        this.render();
      }
    }, intervalMs);
  }

  async #advanceCard({ skipped = false, fromSwipe = false, feedbackType = null } = {}) {
    if (this.isAdvancingCard) return;
    const state = store.getState();
    const { activeGameModeId, localGame, localPlayers } = state;
    const adapter = getModeAdapter(activeGameModeId);
    const currentVm = adapter?.buildTurnViewModel?.(localGame?.session, localPlayers);
    if (!currentVm) return;

    const card = currentVm?.card || null;
    const animKey = `${currentVm?.turnNumber || 0}-${card?.id || ''}`;
    if (currentVm?.isDiceCard && !this.diceRolledForCardKey[animKey]) {
      audioFx.tap();
      visualFx.showToast('¡Debes lanzar el dado primero! 🎲');
      return;
    }

    if (skipped && !currentVm.canSkip) {
      this.#notifyBlockedTurn(currentVm, 'left');
      return;
    }
    if (!skipped && !currentVm.canComplete) {
      this.#notifyBlockedTurn(currentVm, 'right');
      return;
    }

    this.isAdvancingCard = true;
    this.cardAnswerModal = null;
    try {
      const isEvent = Boolean(currentVm.isEventActivation);
      const effectiveSkipped = isEvent ? false : skipped;
      const effectType = feedbackType || (isEvent ? 'god' : effectiveSkipped ? 'bad' : 'god');
      await this.#triggerSwipeFeedback(effectType);

      const targetTurns = currentVm.targetTurns || 45;
      if (currentVm.turnNumber >= targetTurns) {
        audioFx.go();
        visualFx.triggerConfetti('party');
        stage3d.pulse(0x47e9d2);
        store.setState({
          localGame: {
            ...localGame,
            finished: true
          }
        });
        return;
      }

      const result = effectiveSkipped ? 'skipped' : 'completed';
      const { session: nextSession } = await adapter.advanceTurn(
        localGame.session,
        result,
        localPlayers
      );
      const nextVm = adapter.buildTurnViewModel(nextSession, localPlayers);

      const cardFxMode = nextVm?.fxMode || 'ambient';
      const nextAccent = SPECIAL_CARD_FX[cardFxMode]?.accent || nextVm?.typeMeta?.color;
      stage3d.pulse(SPECIAL_CARD_FX[cardFxMode]?.hex ?? nextVm?.typeMeta?.hex ?? 0xff4fa3);
      if (cardFxMode === 'ambient' && nextAccent) {
        visualFx.triggerScreenFlash(nextAccent);
      }

      store.setState({
        localGame: {
          ...localGame,
          modeId: activeGameModeId,
          session: nextSession,
          skippedCount: (localGame.skippedCount || 0) + (skipped ? 1 : 0),
          lastOptionalNotice: null,
          lastSocialForfeitNotice: null
        }
      });
    } catch (err) {
      console.error('[Previa Mix] Error avanzando turno:', err);
      visualFx.showToast(t('catalogLoadErrorToast', state.lang));
    } finally {
      if (this.diceRollInterval) {
        clearInterval(this.diceRollInterval);
        this.diceRollInterval = null;
      }
      this.diceRolling = false;
      this.isAdvancingCard = false;
    }
  }

  async #onAction(el) {
    if (this.isTransitioning || this.isCountdownLaunching || this.isPreparingLaunch) return;

    const action = el.dataset.action;
    const state = store.getState();
    const { lang } = state;

    if (action === 'open-card-answer' || action === 'toggle-card-answer') {
      audioFx.tap();
      const answer = el.dataset.answer || el.closest('[data-answer]')?.dataset.answer || '';
      if (answer) {
        this.cardAnswerModal = { answer };
        this.render();
      }
      return;
    }

    if (action === 'close-card-answer') {
      audioFx.tap();
      this.cardAnswerModal = null;
      this.render();
      return;
    }

    if (action === 'pm-toggle-type') {
      const typeKey = el.dataset.type;
      if (!typeKey || !PREVIA_MIX_TYPE_CONFIG[typeKey]) return;
      audioFx.tap();

      if (typeKey === 'hot') {
        await this.#setHotMode(!this.#isHotModeActive(state));
        return;
      }

      const prevTypes = state.previaMixConfig?.enabledTypes || [];
      const hasType = prevTypes.includes(typeKey);
      if (hasType) {
        const candidate = prevTypes.filter((tKey) => tKey !== typeKey);
        if (!candidate.some((tKey) => tKey !== 'eventos especiales' && tKey !== 'bonus')) {
          visualFx.showToast(t('pmNeedOneRegularTypeToast', lang));
          return;
        }
        store.updatePreviaMixConfig({ enabledTypes: candidate });
      } else {
        store.updatePreviaMixConfig({ enabledTypes: [...prevTypes, typeKey] });
      }
      return;
    }

    if (action === 'open-mode-settings-modal') {
      audioFx.tap();
      this.modeSettingsModalOpen = true;
      this.render();
      return;
    }

    if (action === 'close-mode-settings-modal') {
      audioFx.tap();
      this.modeSettingsModalOpen = false;
      this.render();
      return;
    }

    if (action === 'vor-choose-truth' || action === 'vor-choose-dare') {
      const choice = action === 'vor-choose-truth' ? 'verdad' : 'reto';
      const session = state.localGame?.session;
      if (!session) return;
      audioFx.tap();
      const adapter = getModeAdapter('verdad-o-reto');
      const updatedSession = await adapter.chooseChoice(session, choice);
      store.setState({
        localGame: {
          ...state.localGame,
          session: updatedSession
        }
      });
      stage3d.pulse(choice === 'verdad' ? 0x00e5ff : 0xff007f);
      return;
    }

    if (action === 'vor-set-turn-order') {
      const order = el.dataset.order || 'secuencial';
      audioFx.tap();
      store.updateVerdadORetoConfig({ turnOrder: order });
      this.render();
      return;
    }

    if (action === 'vor-adjust-max-truths') {
      const delta = Number(el.dataset.delta) || 0;
      audioFx.tap();
      const current = state.verdadORetoConfig?.maxConsecutiveTruths ?? 3;
      let next = current + delta;
      if (next < 0) next = 5;
      if (next > 5) next = 0;
      store.updateVerdadORetoConfig({ maxConsecutiveTruths: next });
      this.render();
      return;
    }

    if (action === 'cultura-set-timer-mode') {
      const timer = el.dataset.timer || 'infinite';
      audioFx.tap();
      store.updateCulturaChupisticaConfig({ timerMode: timer });
      const session = state.localGame?.session;
      if (session && session.config) {
        session.config.timerMode = timer;
      }
      this.render();
      return;
    }

    if (action === 'cultura-adjust-custom-timer') {
      const delta = Number(el.dataset.delta) || 0;
      audioFx.tap();
      const current = Math.max(1, Math.min(60, Number(state.culturaChupisticaConfig?.customTimerSeconds) || 20));
      let next = current + delta;
      if (next < 1) next = 1;
      if (next > 60) next = 60;
      store.updateCulturaChupisticaConfig({ customTimerSeconds: next }, { silent: true });
      const session = state.localGame?.session;
      if (session && session.config) {
        session.config.customTimerSeconds = next;
      }
      const inputEl = document.querySelector('#cultura-custom-timer-input');
      if (inputEl) inputEl.value = String(next);
      const pillEl = document.querySelector('.cultura-custom-timer-box .settings-val-pill');
      if (pillEl) pillEl.textContent = `${next}s`;
      return;
    }

    if (action === 'cultura-pass-none') {
      const session = state.localGame?.session;
      if (!session) return;
      this.#advanceCulturaNoFails(session);
      return;
    }

    if (action === 'cultura-open-fail-modal') {
      const session = state.localGame?.session;
      if (!session) return;
      audioFx.bad();
      this.#stopCulturaTimer();
      const adapter = getModeAdapter('cultura-chupistica');
      adapter?.openFailModal(session);
      store.setState({
        localGame: {
          ...state.localGame,
          session
        }
      });
      return;
    }

    if (action === 'cultura-cancel-fail') {
      const session = state.localGame?.session;
      if (!session) return;
      audioFx.tap();
      const adapter = getModeAdapter('cultura-chupistica');
      adapter?.cancelFailModal(session);
      this.#startCulturaTimerIfNeeded(session);
      store.setState({
        localGame: {
          ...state.localGame,
          session
        }
      });
      return;
    }

    if (action === 'cultura-select-failed-player') {
      const playerId = el.dataset.playerId;
      const session = state.localGame?.session;
      if (!session || !playerId) return;
      audioFx.bad();
      stage3d.pulse(0xff3b30);
      const adapter = getModeAdapter('cultura-chupistica');
      adapter?.recordFail(session, playerId, state.localPlayers);
      store.setState({
        localGame: {
          ...state.localGame,
          session
        }
      });
      return;
    }

    if (action === 'cultura-next-round' || action === 'cultura-next-topic') {
      const session = state.localGame?.session;
      if (!session) return;
      audioFx.go();
      stage3d.pulse(0x47e9d2);
      const adapter = getModeAdapter('cultura-chupistica');
      adapter?.advanceToNextRound(session, state.localPlayers);
      if (session.roundState === 'game_over') {
        audioFx.partyBurst();
        visualFx.triggerConfetti('party');
      } else {
        this.#startCulturaTimerIfNeeded(session);
      }
      store.setState({
        localGame: {
          ...state.localGame,
          session
        }
      });
      return;
    }

    if (action === 'cultura-toggle-scoreboard') {
      audioFx.tap();
      this.culturaScoreboardOpen = !this.culturaScoreboardOpen;
      this.render();
      return;
    }

    if (action === 'cultura-close-scoreboard') {
      audioFx.tap();
      this.culturaScoreboardOpen = false;
      this.render();
      return;
    }

    if (action === 'adjust-target-cards') {
      const delta = Number(el.dataset.delta) || 0;
      audioFx.tap();
      const modeId = state.activeGameModeId;
      let current = 45;
      if (modeId === 'yo-nunca') {
        current = Number(state.yoNuncaConfig?.targetTurns) || 45;
      } else if (modeId === 'quien') {
        current = Number(state.quienConfig?.targetTurns) || 45;
      } else if (modeId === 'verdad-o-reto') {
        current = Number(state.verdadORetoConfig?.targetTurns) || 45;
      } else if (modeId === 'cultura-chupistica') {
        current = Number(state.culturaChupisticaConfig?.targetTurns) || 30;
      } else {
        current = Number(state.previaMixConfig?.targetTurns) || 45;
      }
      const next = Math.max(5, Math.min(900, current + delta));
      if (modeId === 'yo-nunca') {
        store.updateYoNuncaConfig({ targetTurns: next }, { silent: true });
      } else if (modeId === 'quien') {
        store.updateQuienConfig({ targetTurns: next }, { silent: true });
      } else if (modeId === 'verdad-o-reto') {
        store.updateVerdadORetoConfig({ targetTurns: next }, { silent: true });
      } else if (modeId === 'cultura-chupistica') {
        store.updateCulturaChupisticaConfig({ targetTurns: next }, { silent: true });
      } else {
        store.updatePreviaMixConfig({ targetTurns: next }, { silent: true });
      }
      const inputEl = document.querySelector('#mode-target-cards-input');
      if (inputEl) inputEl.value = String(next);
      const pillEl = document.querySelector('#mode-cards-val-pill');
      if (pillEl) pillEl.textContent = `${next} ${t('cardsUnit', lang)}`;
      return;
    }

    if (action === 'toggle-locale-dropdown') {
      audioFx.tap();
      this.localeDropdownOpen = !this.localeDropdownOpen;
      this.render();
      return;
    }

    if (action === 'select-locale-option') {
      const nextLocale = el.dataset.locale;
      audioFx.tap();
      this.localeDropdownOpen = false;
      await this.#changeGameLocale(nextLocale);
      return;
    }

    if (action === 'skip-splash') {
      audioFx.tap();
      void enterAppFullscreen();
      this.#navigateWithLoader('home', 'loaderHome', {
        beforeSwitch: () => ({ splashProgress: 100 })
      });
      return;
    }

    if (action === 'start-from-home') {
      audioFx.tap();
      stage3d.pulse(0xff4fa3);
      if (store.getState().startFullscreen !== false) {
        void enterAppFullscreen();
      }
      this.#startPreloaderToPlayers();
      return;
    }

    if (action === 'exit-to-home') {
      audioFx.tap();
      await disableWakeLock();
      await exitAppFullscreen();
      this.#navigateWithLoader('home', 'loaderHome', {
        beforeSwitch: () => ({ localGame: null })
      });
      return;
    }

    if (action === 'go-home') {
      audioFx.tap();
      await disableWakeLock();
      await exitAppFullscreen();
      this.#navigateWithLoader('home', 'loaderHome');
      return;
    }

    if (action === 'install-pwa-app') {
      audioFx.tap();
      const result = await promptPwaInstall();
      if (result.status === 'accepted' || result.status === 'installed') {
        visualFx.showToast(t('installSuccessToast', lang));
        this.render();
      } else if (result.status === 'unavailable') {
        visualFx.showToast(
          t(result.ios ? 'installPromptIosToast' : 'installPromptGenericToast', lang)
        );
      }
      return;
    }

    if (action === 'open-home-settings') {
      audioFx.tap();
      this.localeDropdownOpen = false;
      this.homeSettingsModalOpen = true;
      this.render();
      return;
    }

    if (action === 'close-home-settings') {
      audioFx.tap();
      this.localeDropdownOpen = false;
      this.homeSettingsModalOpen = false;
      this.render();
      return;
    }

    if (action === 'open-coffee-modal') {
      audioFx.tap();
      this.coffeeModalOpen = true;
      this.render();
      return;
    }

    if (action === 'close-coffee-modal') {
      audioFx.tap();
      this.coffeeModalOpen = false;
      this.render();
      return;
    }

    if (action === 'trigger-coffee-support') {
      audioFx.tap();
      visualFx.showToast(t('coffeeThanksToast', lang));
      this.coffeeModalOpen = false;
      this.render();
      return;
    }

    if (action === 'open-settings-modal') {
      audioFx.tap();
      this.cardAnswerModal = null;
      this.localeDropdownOpen = false;
      this.settingsModalOpen = true;
      this.render();
      return;
    }

    if (action === 'close-settings-modal') {
      audioFx.tap();
      this.localeDropdownOpen = false;
      this.settingsModalOpen = false;
      this.render();
      return;
    }

    if (action === 'open-credits-modal') {
      audioFx.tap();
      this.creditsOpenedFromSettings = this.settingsModalOpen;
      this.settingsModalOpen = false;
      this.creditsModalOpen = true;
      this.render();
      return;
    }

    if (action === 'close-credits-modal') {
      audioFx.tap();
      this.#closeCreditsModal();
      return;
    }

    if (action === 'credits-star-tap') {
      this.creditsSecretTapCount = (this.creditsSecretTapCount || 0) + 1;
      if (this.creditsSecretTapTimer) {
        clearTimeout(this.creditsSecretTapTimer);
      }
      this.creditsSecretTapTimer = setTimeout(() => {
        this.creditsSecretTapCount = 0;
        this.creditsSecretTapTimer = null;
      }, 2500);

      if (this.creditsSecretTapCount < 5) {
        audioFx.tap();
        visualFx.animateCardPop(el);
      } else {
        this.creditsSecretTapCount = 0;
        if (this.creditsSecretTapTimer) {
          clearTimeout(this.creditsSecretTapTimer);
          this.creditsSecretTapTimer = null;
        }
        this.creditsModalOpen = false;
        this.settingsModalOpen = false;
        this.homeSettingsModalOpen = false;
        audioFx.god();
        visualFx.triggerConfetti('party');
        visualFx.showToast('✨ ¡Creador de Cartas desbloqueado!');
        await this.#openCardCreator();
      }
      return;
    }

    if (action === 'set-lang') {
      const nextLocale = el.dataset.locale || el.dataset.lang || 'es';
      audioFx.tap();
      if (nextLocale !== state.locale && nextLocale !== state.lang) {
        await this.#changeGameLocale(nextLocale);
      }
      return;
    }

    if (action === 'set-text-scale') {
      const nextScale = el.dataset.scale === 'large' ? 'large' : 'normal';
      audioFx.tap();
      store.setState({ textScaleMode: nextScale });
      return;
    }

    if (action === 'toggle-sound') {
      const nextEnabled = !state.soundEnabled;
      store.setState({
        sfxVolume: nextEnabled ? Math.max(60, state.sfxVolume || 80) : 0
      });
      audioFx.syncVolumes();
      audioFx.tap();
      return;
    }

    if (action === 'toggle-text-scale') {
      audioFx.tap();
      const nextScale =
        state.textScaleMode === 'large' || state.textScaleMode === 'xl' ? 'normal' : 'large';
      store.setState({ textScaleMode: nextScale });
      visualFx.showToast(
        t(nextScale === 'large' ? 'toastTextScaleXl' : 'toastTextScaleLarge', lang)
      );
      return;
    }

    if (action === 'toggle-lang') {
      audioFx.tap();
      store.setState({ lang: lang === 'es' ? 'en' : 'es' });
      return;
    }

    if (action === 'open-new-player-modal') {
      audioFx.tap();
      if (state.localPlayers.length >= MAX_PLAYERS) {
        visualFx.showToast(t('errMaxPlayers', lang));
        return;
      }
      this.editingPlayerId = null;
      this.draftPlayerName = '';
      this.draftDrinksAlcohol = state.alcoholMode !== false;
      this.newPlayerModalOpen = true;
      this.render();
      document.querySelector('#new-player-input')?.focus();
      return;
    }

    if (action === 'close-new-player-modal') {
      audioFx.tap();
      this.newPlayerModalOpen = false;
      this.editingPlayerId = null;
      this.render();
      return;
    }

    if (action === 'pick-draft-avatar') {
      audioFx.tap();
      this.draftAvatarIdx = Number(el.dataset.idx) || 0;
      this.render();
      return;
    }

    if (action === 'save-player') {
      this.#submitPlayerModal();
      return;
    }

    if (action === 'toggle-draft-alcohol') {
      audioFx.tap();
      this.draftDrinksAlcohol = !this.draftDrinksAlcohol;
      this.render();
      return;
    }

    if (action === 'toggle-player-alcohol') {
      audioFx.tap();
      store.toggleLocalPlayerAlcohol(el.dataset.id);
      return;
    }

    if (action === 'remove-player') {
      audioFx.tap();
      store.removeLocalPlayer(el.dataset.id);
      return;
    }

    if (action === 'continue-to-menu') {
      audioFx.tap();
      if (state.localPlayers.length < MIN_PLAYERS) {
        visualFx.showToast(t('errMinPlayers', lang));
        return;
      }
      stage3d.pulse(0xff4fa3);
      this.#navigateWithLoader('menu', 'loaderMenu');
      return;
    }

    if (action === 'go-players') {
      audioFx.tap();
      await disableWakeLock();
      this.#navigateWithLoader('players', 'loaderPlayers');
      return;
    }

    if (action === 'select-game-mode') {
      const modeId = el.dataset.modeId;
      const mode = LOCAL_GAME_MODES.find((m) => m.id === modeId);
      if (!mode || !mode.playable) return;

      // Precarga proactiva en segundo plano mientras el usuario configura intensidad e instrucciones
      const adapter = getModeAdapter(modeId);
      const safeLocale = state.locale || 'es';
      void adapter?.preloadLocale?.(safeLocale);
      if (modeId === 'cultura-chupistica') {
        import('../cards/cards.loader.js').then((m) => m.loadCulturaChupisticaCards(safeLocale)).catch(() => {});
      } else {
        import('../cards/cards.loader.js').then((m) => m.loadCardsLocale(safeLocale)).catch(() => {});
      }

      this.#openModeIntensity(modeId);
      return;
    }

    if (action === 'back-from-intensity') {
      audioFx.tap();
      this.#navigateWithLoader('menu', 'loaderReturning');
      return;
    }

    if (action === 'confirm-intensity-to-instructions') {
      audioFx.tap();
      stage3d.pulse(0xff4fa3);
      this.#openModeInstructions(state.activeGameModeId);
      return;
    }

    if (action === 'select-intensity-pill' || action === 'select-intensity-level') {
      const level = Number(el.dataset.level);
      audioFx.tap();
      this.#handleIntensityPillClick(level);
      return;
    }

    if (action === 'set-intensity-preset') {
      const pMin = Number(el.dataset.min);
      const pMax = Number(el.dataset.max);
      this.intensityAnchor = null;
      audioFx.tap();
      this.#setGameIntensityRange(pMin, pMax, { renderNow: false });
      return;
    }

    if (action === 'step-min-intensity') {
      const delta = Number(el.dataset.delta) || 0;
      const currentMin = Number(state.minIntensity ?? 1);
      const currentMax = Number(state.maxIntensity ?? 10);
      let nextMin = Math.min(10, Math.max(1, currentMin + delta));
      let nextMax = currentMax;
      if (nextMin > nextMax) {
        nextMax = nextMin;
      }
      this.intensityAnchor = null;
      audioFx.tap();
      this.#setGameIntensityRange(nextMin, nextMax, { renderNow: false });
      return;
    }

    if (action === 'step-max-intensity' || action === 'step-intensity-level') {
      const delta = Number(el.dataset.delta) || 0;
      const currentMin = Number(state.minIntensity ?? 1);
      const currentMax = Number(state.maxIntensity ?? 10);
      let nextMax = Math.min(10, Math.max(1, currentMax + delta));
      let nextMin = currentMin;
      if (nextMax < nextMin) {
        nextMin = nextMax;
      }
      this.intensityAnchor = null;
      audioFx.tap();
      this.#setGameIntensityRange(nextMin, nextMax, { renderNow: false });
      return;
    }

    if (action === 'open-card-creator') {
      await this.#openCardCreator();
      return;
    }

    if (action === 'exit-creator-to-menu') {
      audioFx.tap();
      creatorController.closeAllModals();
      await this.#navigateWithLoader('menu', 'loaderReturning');
      return;
    }

    if (action === 'creator-open-create') {
      audioFx.tap();
      const res = creatorController.startCreate();
      if (!res.ok && res.error === 'LIMIT_REACHED') {
        visualFx.showToast('⚠️ Límite de 500 cartas alcanzado.');
      } else {
        this.render();
      }
      return;
    }

    if (action === 'creator-open-edit') {
      audioFx.tap();
      const cardId = el.dataset.cardId || el.closest('[data-card-id]')?.dataset.cardId;
      const res = creatorController.startEdit(cardId);
      if (res.ok) {
        this.render();
      }
      return;
    }

    if (action === 'creator-cancel-edit') {
      audioFx.tap();
      creatorController.cancelEdit();
      this.render();
      return;
    }

    if (action === 'creator-save-card') {
      audioFx.tap();
      const form = document.querySelector('#creator-card-form');
      if (!form) return;
      const textoEl = form.querySelector('#creator-edit-texto');
      const tipoEl = form.querySelector('#creator-edit-tipo');
      const castigoEl = form.querySelector('#creator-edit-castigo');
      const intensidadEl = form.querySelector('#creator-edit-intensidad');
      const participantesEl = form.querySelector('#creator-edit-participantes');
      const minJugadoresEl = form.querySelector('#creator-edit-min-jugadores');

      const texto = (textoEl?.value || '').trim();
      if (!texto) {
        visualFx.showToast('⚠️ El texto de la carta no puede estar vacío.');
        textoEl?.focus();
        return;
      }

      const isNew = creatorController.isCreatingNew;
      const res = creatorController.saveEdit({
        texto,
        tipo: tipoEl?.value || 'clásico',
        castigo: castigoEl?.value || 'medio trago',
        intensidad: Number(intensidadEl?.value) || 5,
        participantes: participantesEl?.value || 'uno',
        min_jugadores: Number(minJugadoresEl?.value) || 2
      });

      if (res.ok) {
        visualFx.showToast(isNew ? '✅ ¡Carta creada!' : '✅ ¡Carta actualizada!');
        this.render();
      } else if (res.error === 'LIMIT_REACHED') {
        visualFx.showToast('⚠️ Has alcanzado el límite máximo de 500 cartas.');
      }
      return;
    }

    if (action === 'creator-start-delete') {
      audioFx.tap();
      const cardId = el.dataset.cardId || el.closest('[data-card-id]')?.dataset.cardId;
      creatorController.openDeleteConfirm(cardId);
      this.render();
      return;
    }

    if (action === 'creator-cancel-delete') {
      audioFx.tap();
      creatorController.cancelDeleteConfirm();
      this.render();
      return;
    }

    if (action === 'creator-confirm-delete') {
      audioFx.tap();
      creatorController.confirmDelete();
      visualFx.showToast('🗑️ Carta eliminada.');
      this.render();
      return;
    }

    if (action === 'creator-open-clear') {
      audioFx.tap();
      creatorController.openClearConfirm();
      this.render();
      return;
    }

    if (action === 'creator-cancel-clear') {
      audioFx.tap();
      creatorController.cancelClearConfirm();
      this.render();
      return;
    }

    if (action === 'creator-confirm-clear') {
      audioFx.tap();
      creatorController.confirmClearAll();
      visualFx.showToast('🗑️ Toda la colección ha sido eliminada.');
      this.render();
      return;
    }

    if (action === 'creator-open-export') {
      audioFx.tap();
      creatorController.openExport();
      this.render();
      return;
    }

    if (action === 'creator-close-export') {
      audioFx.tap();
      creatorController.closeExport();
      this.render();
      return;
    }

    if (action === 'creator-copy-export') {
      audioFx.tap();
      const text = creatorController.exportContent;
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        visualFx.showToast('📋 ¡Colección copiada al portapapeles!');
      } else {
        const textarea = document.querySelector('.editor-export-textarea');
        textarea?.select();
        document.execCommand('copy');
        visualFx.showToast('📋 ¡Copiado!');
      }
      return;
    }

    if (action === 'creator-download-export') {
      audioFx.tap();
      const filename = creatorController.exportFilename || 'oh-my-shot-cartas-personalizadas.json';
      const content = creatorController.exportContent;
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      visualFx.showToast('💾 Descargando archivo JSON...');
      return;
    }

    if (action === 'creator-open-import') {
      audioFx.tap();
      creatorController.openImport();
      this.render();
      return;
    }

    if (action === 'creator-close-import') {
      audioFx.tap();
      creatorController.closeImport();
      this.render();
      return;
    }

    if (action === 'creator-submit-import-text') {
      audioFx.tap();
      const textarea = document.querySelector('#creator-import-textarea');
      const val = textarea?.value?.trim();
      if (!val) {
        visualFx.showToast('⚠️ Pega un JSON válido o sube un archivo.');
        return;
      }
      const res = creatorController.importJson(val);
      if (res.ok) {
        if (res.limitCapped) {
          visualFx.showToast(`📥 Importadas ${res.imported} cartas (alcanzó el límite de 500).`);
        } else {
          visualFx.showToast(`📥 ¡${res.imported} cartas importadas exitosamente!`);
        }
        creatorController.closeImport();
        this.render();
      } else {
        visualFx.showToast(`⚠️ Error al importar: ${res.error || 'Formato JSON no válido'}`);
      }
      return;
    }

    if (action === 'creator-clear-search') {
      creatorController.setSearchQuery('');
      this.render();
      return;
    }

    if (action === 'creator-clear-filters') {
      creatorController.setSearchQuery('');
      creatorController.setFilterType('all');
      creatorController.setFilterIntensity('all');
      this.render();
      return;
    }

    if (action === 'creator-insert-token') {
      audioFx.tap();
      const token = el.dataset.token;
      const textarea = document.querySelector('#creator-edit-texto');
      if (textarea && token) {
        const start = textarea.selectionStart ?? textarea.value.length;
        const end = textarea.selectionEnd ?? textarea.value.length;
        const old = textarea.value;
        textarea.value = old.slice(0, start) + token + old.slice(end);
        textarea.selectionStart = textarea.selectionEnd = start + token.length;
        textarea.focus();
      }
      return;
    }

    if (action === 'back-from-instructions') {
      audioFx.tap();
      this.#navigateWithLoader('intensity', 'loaderIntensity');
      return;
    }

    if (action === 'confirm-start-mode') {
      this.#launchLocalGameMode(state.activeGameModeId);
      return;
    }

    if (action === 'request-exit-game') {
      audioFx.tap();
      this.cardAnswerModal = null;
      this.exitConfirmOpen = true;
      this.render();
      return;
    }

    if (action === 'cancel-exit-game') {
      audioFx.tap();
      this.exitConfirmOpen = false;
      this.render();
      return;
    }

    if (action === 'confirm-exit-game') {
      audioFx.tap();
      this.#stopCulturaTimer();
      this.exitConfirmOpen = false;
      await disableWakeLock();
      audioFx.setMusicMood('normal');
      this.#navigateWithLoader('menu', 'loaderReturning');
      return;
    }

    if (action === 'next-card') {
      this.#advanceCard({ skipped: false, feedbackType: 'god' });
      return;
    }

    if (action === 'skip-card') {
      this.#advanceCard({ skipped: true, feedbackType: 'bad' });
      return;
    }

    if (action === 'add-drink') {
      audioFx.tap();
      store.updateLocalPlayerScore(el.dataset.id, 1);
    }
  }
}
