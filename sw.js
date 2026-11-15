const CACHE_NAME = 'oh-my-shot-v0.6.2';

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
  './src/cards/bonus.en-GB.js',
  './src/cards/bonus.en-US.js',
  './src/cards/bonus.es-CO.js',
  './src/cards/bonus.es-ES.js',
  './src/cards/bonus.es-MX.js',
  './src/cards/bonus.pt-BR.js',
  './src/cards/bonus.pt-PT.js',
  './src/cards/cards.en-GB.js',
  './src/cards/cards.en-US.js',
  './src/cards/cards.es-CO.js',
  './src/cards/cards.es-ES.js',
  './src/cards/cards.es-MX.js',
  './src/cards/cards.loader.js',
  './src/cards/cards.pt-BR.js',
  './src/cards/cards.pt-PT.js',
  './src/cards/castigos.en-GB.js',
  './src/cards/castigos.en-US.js',
  './src/cards/castigos.es-CO.js',
  './src/cards/castigos.es-ES.js',
  './src/cards/castigos.es-MX.js',
  './src/cards/castigos.pt-BR.js',
  './src/cards/castigos.pt-PT.js',
  './src/cards/en-GB/bonus.en-GB.js',
  './src/cards/en-GB/clasico.en-GB.js',
  './src/cards/en-GB/duelo.en-GB.js',
  './src/cards/en-GB/eventos-especiales.en-GB.js',
  './src/cards/en-GB/hot.en-GB.js',
  './src/cards/en-GB/quien-es-mas-probable.en-GB.js',
  './src/cards/en-GB/reto.en-GB.js',
  './src/cards/en-GB/retos-especiales.en-GB.js',
  './src/cards/en-GB/verdad.en-GB.js',
  './src/cards/en-GB/yo-nunca.en-GB.js',
  './src/cards/en-US/bonus.en-US.js',
  './src/cards/en-US/clasico.en-US.js',
  './src/cards/en-US/duelo.en-US.js',
  './src/cards/en-US/eventos-especiales.en-US.js',
  './src/cards/en-US/hot.en-US.js',
  './src/cards/en-US/quien-es-mas-probable.en-US.js',
  './src/cards/en-US/reto.en-US.js',
  './src/cards/en-US/retos-especiales.en-US.js',
  './src/cards/en-US/verdad.en-US.js',
  './src/cards/en-US/yo-nunca.en-US.js',
  './src/cards/es-CO/bonus.es-CO.js',
  './src/cards/es-CO/clasico.es-CO.js',
  './src/cards/es-CO/duelo.es-CO.js',
  './src/cards/es-CO/eventos-especiales.es-CO.js',
  './src/cards/es-CO/hot.es-CO.js',
  './src/cards/es-CO/quien-es-mas-probable.es-CO.js',
  './src/cards/es-CO/reto.es-CO.js',
  './src/cards/es-CO/retos-especiales.es-CO.js',
  './src/cards/es-CO/verdad.es-CO.js',
  './src/cards/es-CO/yo-nunca.es-CO.js',
  './src/cards/es-ES/bonus.es-ES.js',
  './src/cards/es-ES/clasico.es-ES.js',
  './src/cards/es-ES/duelo.es-ES.js',
  './src/cards/es-ES/eventos-especiales.es-ES.js',
  './src/cards/es-ES/hot.es-ES.js',
  './src/cards/es-ES/quien-es-mas-probable.es-ES.js',
  './src/cards/es-ES/reto.es-ES.js',
  './src/cards/es-ES/retos-especiales.es-ES.js',
  './src/cards/es-ES/verdad.es-ES.js',
  './src/cards/es-ES/yo-nunca.es-ES.js',
  './src/cards/es-MX/bonus.es-MX.js',
  './src/cards/es-MX/clasico.es-MX.js',
  './src/cards/es-MX/duelo.es-MX.js',
  './src/cards/es-MX/eventos-especiales.es-MX.js',
  './src/cards/es-MX/hot.es-MX.js',
  './src/cards/es-MX/quien-es-mas-probable.es-MX.js',
  './src/cards/es-MX/reto.es-MX.js',
  './src/cards/es-MX/retos-especiales.es-MX.js',
  './src/cards/es-MX/verdad.es-MX.js',
  './src/cards/es-MX/yo-nunca.es-MX.js',
  './src/cards/previa-mix.en-GB.js',
  './src/cards/previa-mix.en-US.js',
  './src/cards/previa-mix.es-CO.js',
  './src/cards/previa-mix.es-ES.js',
  './src/cards/previa-mix.es-MX.js',
  './src/cards/previa-mix.pt-BR.js',
  './src/cards/previa-mix.pt-PT.js',
  './src/cards/pt-BR/bonus.pt-BR.js',
  './src/cards/pt-BR/clasico.pt-BR.js',
  './src/cards/pt-BR/duelo.pt-BR.js',
  './src/cards/pt-BR/eventos-especiales.pt-BR.js',
  './src/cards/pt-BR/hot.pt-BR.js',
  './src/cards/pt-BR/quien-es-mas-probable.pt-BR.js',
  './src/cards/pt-BR/reto.pt-BR.js',
  './src/cards/pt-BR/retos-especiales.pt-BR.js',
  './src/cards/pt-BR/verdad.pt-BR.js',
  './src/cards/pt-BR/yo-nunca.pt-BR.js',
  './src/cards/pt-PT/bonus.pt-PT.js',
  './src/cards/pt-PT/clasico.pt-PT.js',
  './src/cards/pt-PT/duelo.pt-PT.js',
  './src/cards/pt-PT/eventos-especiales.pt-PT.js',
  './src/cards/pt-PT/hot.pt-PT.js',
  './src/cards/pt-PT/quien-es-mas-probable.pt-PT.js',
  './src/cards/pt-PT/reto.pt-PT.js',
  './src/cards/pt-PT/retos-especiales.pt-PT.js',
  './src/cards/pt-PT/verdad.pt-PT.js',
  './src/cards/pt-PT/yo-nunca.pt-PT.js'
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
