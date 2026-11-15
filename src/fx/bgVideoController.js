/**
 * Controlador de video de fondo adaptativo:
 * - Vertical (movil / portrait): assets/videos/video_bg_vertical.webm
 * - Horizontal (tablet / desktop / landscape): assets/videos/video_bg_horizontal.webm
 * Incluye deteccion de soporte WebM y fallback silencioso para iOS Safari y modos de ahorro,
 * evitando mostrar controles o iconos rotos sobre la esfera 3D de particulas.
 */

const VIDEO_SOURCES = {
  vertical: './assets/videos/video_bg_vertical.webm',
  horizontal: './assets/videos/video_bg_horizontal.webm'
};

function detectFormat() {
  return window.innerHeight > window.innerWidth ? 'vertical' : 'horizontal';
}

function supportsWebmPlayback(videoEl) {
  if (!videoEl || typeof videoEl.canPlayType !== 'function') return false;
  return Boolean(
    videoEl.canPlayType('video/webm; codecs="vp9"') ||
      videoEl.canPlayType('video/webm; codecs="vp8"') ||
      videoEl.canPlayType('video/webm')
  );
}

export function initBgVideo(videoSelector = '#bg-video') {
  const videoEl = document.querySelector(videoSelector);
  if (!videoEl) return () => {};

  const hideVideoGracefully = () => {
    videoEl.hidden = true;
    videoEl.style.display = 'none';
    videoEl.style.opacity = '0';
  };

  if (!supportsWebmPlayback(videoEl)) {
    hideVideoGracefully();
    return () => {};
  }

  let currentFormat = null;
  let videoFailed = false;

  const ensureMutedAndInline = () => {
    videoEl.muted = true;
    videoEl.defaultMuted = true;
    videoEl.playsInline = true;
    videoEl.setAttribute('playsinline', '');
    videoEl.setAttribute('webkit-playsinline', 'true');
  };

  const tryPlay = () => {
    if (videoFailed || document.hidden) return;
    ensureMutedAndInline();
    const p = videoEl.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {
        // Silencioso en iOS/Chrome bajo ahorro de bateria hasta primer toque
      });
    }
  };

  const applyVideoFormat = () => {
    if (videoFailed) return;
    const nextFormat = detectFormat();
    if (nextFormat === currentFormat) return;
    currentFormat = nextFormat;

    const src = VIDEO_SOURCES[nextFormat];
    videoEl.hidden = false;
    videoEl.style.display = '';
    videoEl.style.opacity = '';
    videoEl.dataset.format = nextFormat;
    ensureMutedAndInline();
    if (videoEl.getAttribute('src') !== src) {
      videoEl.setAttribute('src', src);
      videoEl.load();
    }
    tryPlay();
  };

  const onError = () => {
    videoFailed = true;
    hideVideoGracefully();
  };

  videoEl.addEventListener('error', onError);
  videoEl.addEventListener('loadeddata', () => {
    if (!videoFailed) {
      videoEl.style.opacity = '';
      tryPlay();
    }
  });
  videoEl.addEventListener('canplay', tryPlay);

  applyVideoFormat();

  let resizeTimer = null;
  const handleResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(applyVideoFormat, 140);
  };

  const onFirstInteract = () => {
    tryPlay();
  };

  const onVisibility = () => {
    if (!document.hidden) tryPlay();
  };

  window.addEventListener('resize', handleResize, { passive: true });
  window.addEventListener('orientationchange', applyVideoFormat, { passive: true });
  window.addEventListener('pointerdown', onFirstInteract, { once: true, passive: true });
  document.addEventListener('visibilitychange', onVisibility, { passive: true });

  return () => {
    clearTimeout(resizeTimer);
    videoEl.removeEventListener('error', onError);
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', applyVideoFormat);
    window.removeEventListener('pointerdown', onFirstInteract);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
