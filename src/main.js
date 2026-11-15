import { COUNTDOWN_MEDIA, PLAYER_AVATARS, SHOT_ICONS, UI_ICONS } from './config/constants.js';
import { audioFx } from './core/audioFx.js';
import { store } from './core/store.js';
import { bindWakeLockVisibility } from './core/wakeLock.js';
import { initBgVideo } from './fx/bgVideoController.js';
import { visualFx } from './fx/visualFx.js';
import { stage3d } from './scenes3d/stage3d.js';
import { AppShell } from './ui/appShell.js';

const preloadedImages = [];

function preloadMediaAssets() {
  for (const src of [
    './assets/imgs/silver-glitter-background.webp',
    SHOT_ICONS.on,
    SHOT_ICONS.off,
    ...Object.values(COUNTDOWN_MEDIA),
    ...Object.values(UI_ICONS),
    ...PLAYER_AVATARS
  ]) {
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
    preloadedImages.push(img);
  }
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./sw.js', { updateViaCache: 'none' })
        .then((reg) => reg.update().catch(() => null))
        .catch(() => null);
    });
  }
}

function runSplashSequence() {
  const steps = [
    { delay: 140, progress: 28 },
    { delay: 420, progress: 64 },
    { delay: 760, progress: 94 },
    { delay: 1020, progress: 100 }
  ];

  for (const step of steps) {
    setTimeout(() => {
      if (store.getState().screen !== 'splash') return;
      store.setState({ splashProgress: step.progress });
    }, step.delay);
  }

  setTimeout(() => {
    if (store.getState().screen !== 'splash') return;
    store.setState({ screen: 'home', splashProgress: 100 });
  }, 1150);
}

async function bootstrap() {
  registerServiceWorker();
  bindWakeLockVisibility();

  // Base de datos local IndexedDB + espejo localStorage (sin servicios externos)
  await Promise.race([
    store.hydrateFromLocalDb().catch(() => false),
    new Promise((resolve) => setTimeout(resolve, 180))
  ]);

  // Video de fondo adaptativo (vertical / horizontal) + escena 3D de esfera de particulas
  initBgVideo('#bg-video');
  stage3d.init('#stage-3d');
  audioFx.preload();
  preloadMediaAssets();

  const unlockAudioOnce = async () => {
    const running = await audioFx.unlock();
    if (!running) return;
    window.removeEventListener('pointerdown', unlockAudioOnce);
    window.removeEventListener('touchend', unlockAudioOnce);
    window.removeEventListener('click', unlockAudioOnce);
    window.removeEventListener('keydown', unlockAudioOnce);
  };
  window.addEventListener('pointerdown', unlockAudioOnce, { passive: true });
  window.addEventListener('touchend', unlockAudioOnce, { passive: true });
  window.addEventListener('click', unlockAudioOnce, { passive: true });
  window.addEventListener('keydown', unlockAudioOnce, { passive: true });

  const root = document.querySelector('#app');
  const app = new AppShell(root);
  window.__OMS_STORE__ = store;
  window.__OMS_APP__ = app;
  app.mount();

  runSplashSequence();
}

bootstrap();
