const CACHE_NAME = 'oh-my-shot-v0.8.1';

const AVATAR_ASSETS = Array.from(
  { length: 36 },
  (_, idx) => `./assets/imgs/avatars/avatar_${String(idx + 1).padStart(2, '0')}.webp`
);

const UI_ICON_ASSETS_V1 = Array.from(
  { length: 36 },
  (_, idx) => `./assets/icons/ui/icon_${String(idx + 1).padStart(2, '0')}.webp`
);

const UI_ICON_ASSETS_V2 = Array.from(
  { length: 38 },
  (_, idx) => `./assets/icons/ui/icon2_${String(idx + 1).padStart(2, '0')}.webp`
);

const LEVEL_BAR_ASSETS = [
  './assets/icons/niveles.webp',
  ...Array.from(
    { length: 10 },
    (_, idx) => `./assets/icons/levels/level_${String(idx + 1).padStart(2, '0')}.webp`
  )
];

const CARDS_LOCALE_FILES = [
  './src/cards/bonus.catalog.js',
  './src/cards/cards.loader.js',
  './src/cards/castigos.catalog.js',
  './src/cards/cards.es.js',
  './src/cards/cards.en.js',
  './src/cards/cards.pt.js',
  './src/cards/castigos.es.js',
  './src/cards/castigos.en.js',
  './src/cards/castigos.pt.js',
  // Español (es)
  './src/cards/es/bonus.es.js',
  './src/cards/es/clasico.es.js',
  './src/cards/es/cultura-chupistica.es.js',
  './src/cards/es/duelo.es.js',
  './src/cards/es/eventos-especiales.es.js',
  './src/cards/es/hot.es.js',
  './src/cards/es/quien-es-mas-probable.es.js',
  './src/cards/es/reto.es.js',
  './src/cards/es/retos-especiales.es.js',
  './src/cards/es/verdad.es.js',
  './src/cards/es/yo-nunca.es.js',
  // English (en)
  './src/cards/en/bonus.en.js',
  './src/cards/en/clasico.en.js',
  './src/cards/en/cultura-chupistica.en.js',
  './src/cards/en/duelo.en.js',
  './src/cards/en/eventos-especiales.en.js',
  './src/cards/en/hot.en.js',
  './src/cards/en/quien-es-mas-probable.en.js',
  './src/cards/en/reto.en.js',
  './src/cards/en/retos-especiales.en.js',
  './src/cards/en/verdad.en.js',
  './src/cards/en/yo-nunca.en.js',
  // Português (pt)
  './src/cards/pt/bonus.pt.js',
  './src/cards/pt/clasico.pt.js',
  './src/cards/pt/cultura-chupistica.pt.js',
  './src/cards/pt/duelo.pt.js',
  './src/cards/pt/eventos-especiales.pt.js',
  './src/cards/pt/hot.pt.js',
  './src/cards/pt/quien-es-mas-probable.pt.js',
  './src/cards/pt/reto.pt.js',
  './src/cards/pt/retos-especiales.pt.js',
  './src/cards/pt/verdad.pt.js',
  './src/cards/pt/yo-nunca.pt.js'
];

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './src/main.js',
  './src/config/constants.js',
  './src/config/themeTokens.js',
  './src/config/intensityLevels.js',
  './src/config/bonusCards.catalog.js',
  './assets/icons/dice/dice_1.svg',
  './assets/icons/dice/dice_2.svg',
  './assets/icons/dice/dice_3.svg',
  './assets/icons/dice/dice_4.svg',
  './assets/icons/dice/dice_5.svg',
  './assets/icons/dice/dice_6.svg',
  './src/core/appGuard.js',
  './src/core/audioFx.js',
  './src/core/customCards.js',
  './src/core/i18n.js',
  './src/core/localDb.js',
  './src/core/store.js',
  './src/core/wakeLock.js',
  './src/modes/registry.js',
  './src/modes/creator/creator.controller.js',
  './src/modes/creator/creator.ui.js',
  './src/modes/previa-mix/mode.config.js',
  './src/modes/previa-mix/adapter.js',
  './src/modes/previa-mix/previa-mix.engine.js',
  './src/modes/previa-mix/previa-mix.locales.js',
  './src/modes/yo-nunca/mode.config.js',
  './src/modes/yo-nunca/adapter.js',
  './src/modes/quien/mode.config.js',
  './src/modes/quien/adapter.js',
  './src/modes/verdad-o-reto/mode.config.js',
  './src/modes/verdad-o-reto/adapter.js',
  './src/modes/cultura-chupistica/mode.config.js',
  './src/modes/cultura-chupistica/adapter.js',
  ...CARDS_LOCALE_FILES,
  './src/fx/bgVideoController.js',
  './src/fx/swipeController.js',
  './src/fx/visualFx.js',
  './src/scenes3d/stage3d.js',
  './src/ui/appShell.js',
  './src/styles/tokens.css',
  './src/styles/base.css',
  './src/styles/components.css',
  './assets/fonts/titulos.woff2',
  './assets/fonts/titulos.woff',
  './assets/fonts/texto.woff2',
  './assets/fonts/texto.woff',
  './assets/imgs/logo_principal.webp',
  './assets/imgs/logo_secundario.webp',
  './assets/imgs/silver-glitter-background.webp',
  './assets/imgs/3.webp',
  './assets/imgs/2.webp',
  './assets/imgs/1.webp',
  './assets/imgs/go.webp',
  './assets/imgs/god.webp',
  './assets/imgs/bad.webp',
  './assets/icons/app.webp',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/ui/shot_on.webp',
  './assets/icons/ui/shot_off.webp',
  './assets/audio/pop.m4a',
  './assets/audio/swoosh.m4a',
  './assets/audio/count.m4a',
  './assets/audio/go.m4a',
  './assets/audio/god.m4a',
  './assets/audio/bad.m4a',
  './assets/audio/music_bg.m4a',
  './assets/audio/music_bg_play.m4a',
  './assets/audio/music_hot_bg.m4a',
  ...AVATAR_ASSETS,
  ...UI_ICON_ASSETS_V1,
  ...UI_ICON_ASSETS_V2,
  ...LEVEL_BAR_ASSETS
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((oldKey) => caches.delete(oldKey)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Evita interceptar range requests parciales (206) de videos WebM
  if (url.pathname.endsWith('.webm') || req.headers.has('range')) return;

  const isCodeOrShell =
    req.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname.endsWith('/index.html') ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.webmanifest') ||
    url.pathname.endsWith('.json');

  if (isCodeOrShell) {
    event.respondWith(
      fetch(req, { cache: 'no-cache' })
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
