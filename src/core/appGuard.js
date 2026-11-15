/**
 * Protección estilo aplicación nativa (PWA / Juego móvil):
 * - Pantalla completa por gesto de usuario cuando el navegador lo permite.
 * - Bloqueo de recarga (F5, Ctrl/Cmd+R, pull-to-refresh).
 * - Trampa de historial y bloqueo de gesto/botón Atrás para no salir a páginas previas.
 */

export function isAppFullscreen() {
  if (typeof document === 'undefined') return false;
  return Boolean(
    document.fullscreenElement ||
      document.webkitFullscreenElement ||
      window.matchMedia?.('(display-mode: fullscreen)')?.matches ||
      window.matchMedia?.('(display-mode: standalone)')?.matches ||
      window.navigator.standalone === true
  );
}

export function isPwaInstalled() {
  if (typeof window === 'undefined') return false;
  return Boolean(
    window.matchMedia?.('(display-mode: fullscreen)')?.matches ||
      window.matchMedia?.('(display-mode: standalone)')?.matches ||
      window.navigator.standalone === true
  );
}

export function isIosDevice() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

let deferredPwaPrompt = null;

export function canPromptPwaInstall() {
  return Boolean(deferredPwaPrompt);
}

export function initPwaInstallWatcher(onChange) {
  if (typeof window === 'undefined') return () => {};
  const handleBeforeInstall = (e) => {
    e.preventDefault();
    deferredPwaPrompt = e;
    onChange?.();
  };
  const handleInstalled = () => {
    deferredPwaPrompt = null;
    onChange?.();
  };
  window.addEventListener('beforeinstallprompt', handleBeforeInstall);
  window.addEventListener('appinstalled', handleInstalled);
  return () => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    window.removeEventListener('appinstalled', handleInstalled);
  };
}

export async function promptPwaInstall() {
  if (isPwaInstalled()) return { status: 'installed' };
  if (!deferredPwaPrompt) {
    return { status: 'unavailable', ios: isIosDevice() };
  }
  try {
    await deferredPwaPrompt.prompt();
    const choice = await deferredPwaPrompt.userChoice;
    if (choice?.outcome === 'accepted') {
      deferredPwaPrompt = null;
      return { status: 'accepted' };
    }
    return { status: 'dismissed' };
  } catch {
    return { status: 'unavailable', ios: isIosDevice() };
  }
}

export async function enterAppFullscreen() {
  if (typeof document === 'undefined') return false;
  const docEl = document.documentElement;
  if (!docEl) return false;
  if (document.fullscreenElement || document.webkitFullscreenElement) return true;

  try {
    if (typeof docEl.requestFullscreen === 'function') {
      await docEl.requestFullscreen({ navigationUI: 'hide' });
      return true;
    }
    if (typeof docEl.webkitRequestFullscreen === 'function') {
      docEl.webkitRequestFullscreen();
      return true;
    }
  } catch {
    // Algunos navegadores móviles (p. ej. Safari en pestaña) ignoran requestFullscreen
  }
  return false;
}

export async function exitAppFullscreen() {
  if (typeof document === 'undefined') return false;
  try {
    if (document.fullscreenElement && typeof document.exitFullscreen === 'function') {
      await document.exitFullscreen();
      return true;
    }
    if (document.webkitFullscreenElement && typeof document.webkitExitFullscreen === 'function') {
      document.webkitExitFullscreen();
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

function canScrollUpFromTarget(target) {
  let node = target instanceof Element ? target : null;
  while (node && node !== document.body && node !== document.documentElement) {
    const style = window.getComputedStyle(node);
    const overflowY = style.overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
      if (node.scrollTop > 0) return true;
    }
    node = node.parentElement;
  }
  return (window.scrollY || document.documentElement.scrollTop || 0) > 0;
}

export function installAppGuards({ onBack, shouldWarnUnload } = {}) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  const pushBackTrap = () => {
    try {
      window.history.pushState({ omsLocked: true, ts: Date.now() }, '', window.location.href);
    } catch {
      // ignore
    }
  };

  try {
    window.history.replaceState({ omsLocked: 'base' }, '', window.location.href);
    pushBackTrap();
  } catch {
    // ignore
  }

  const handlePopState = () => {
    pushBackTrap();
    if (typeof onBack === 'function') {
      onBack();
    }
  };

  const handleKeyDown = (e) => {
    const key = String(e.key || '').toLowerCase();
    const isInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);

    const isReloadCombo =
      e.key === 'F5' ||
      ((e.ctrlKey || e.metaKey) && key === 'r');

    const isBrowserBackNav =
      e.key === 'BrowserBack' ||
      (e.altKey && e.key === 'ArrowLeft') ||
      (e.key === 'Backspace' && !isInput);

    if (isReloadCombo || isBrowserBackNav) {
      e.preventDefault();
      e.stopPropagation();
      if (isBrowserBackNav && typeof onBack === 'function') {
        onBack();
      }
    }
  };

  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartedAtEdge = false;

  const handleTouchStart = (e) => {
    if (!e.touches || e.touches.length !== 1) return;
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    const vw = window.innerWidth || document.documentElement.clientWidth || 0;
    const edgeMargin = 16;
    touchStartedAtEdge =
      (touchStartX <= edgeMargin || (vw > 0 && touchStartX >= vw - edgeMargin)) &&
      !e.target?.closest?.('.swipe-card');

    if (touchStartedAtEdge) {
      e.preventDefault();
    }
  };

  const handleTouchMove = (e) => {
    if (!e.touches || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;

    // Bloquea el gesto horizontal desde los bordes laterales (atrás en iOS/Android)
    if (touchStartedAtEdge && Math.abs(dx) > Math.abs(dy)) {
      e.preventDefault();
      return;
    }

    // Bloquea pull-to-refresh al deslizar hacia abajo en el tope superior
    if (dy > 8 && dy > Math.abs(dx) && !canScrollUpFromTarget(e.target)) {
      e.preventDefault();
    }
  };

  const handleContextMenu = (e) => {
    const tag = e.target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    e.preventDefault();
  };

  const handleBeforeUnload = (e) => {
    if (typeof shouldWarnUnload === 'function' && shouldWarnUnload()) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  window.addEventListener('popstate', handlePopState);
  window.addEventListener('keydown', handleKeyDown, { capture: true });
  document.addEventListener('touchstart', handleTouchStart, { passive: false });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('contextmenu', handleContextMenu);
  window.addEventListener('beforeunload', handleBeforeUnload);

  return () => {
    window.removeEventListener('popstate', handlePopState);
    window.removeEventListener('keydown', handleKeyDown, { capture: true });
    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('contextmenu', handleContextMenu);
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}

