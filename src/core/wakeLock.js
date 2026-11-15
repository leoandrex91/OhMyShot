import { store } from './store.js';

let sentinel = null;

/**
 * Solicita a Screen Wake Lock API mantener la pantalla activa durante la partida.
 * Degrada silenciosamente si el navegador no soporta la API.
 */
export async function enableWakeLock() {
  if (!('wakeLock' in navigator)) {
    store.setState({ wakeLockActive: false });
    return false;
  }

  try {
    if (sentinel && !sentinel.released) {
      store.setState({ wakeLockActive: true });
      return true;
    }
    sentinel = await navigator.wakeLock.request('screen');
    store.setState({ wakeLockActive: true });

    sentinel.addEventListener('release', () => {
      store.setState({ wakeLockActive: false });
    });
    return true;
  } catch {
    store.setState({ wakeLockActive: false });
    return false;
  }
}

export async function disableWakeLock() {
  if (sentinel && !sentinel.released) {
    try {
      await sentinel.release();
    } catch {
      // ignore
    }
  }
  sentinel = null;
  store.setState({ wakeLockActive: false });
}

export function bindWakeLockVisibility() {
  document.addEventListener('visibilitychange', () => {
    const s = store.getState();
    if (document.visibilityState === 'visible' && (s.room || s.screen === 'play')) {
      enableWakeLock();
    }
  });
}

