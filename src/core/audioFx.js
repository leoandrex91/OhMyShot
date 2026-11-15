import { AUDIO_ASSETS } from '../config/constants.js';
import { store } from './store.js';

const MUSIC_MAX_GAIN = 0.52;
const MUSIC_CROSSFADE_SEC = 1.1;

let audioCtx = null;
let masterMusicGain = null;
let audioUnlocked = false;
let visibilityBound = false;
let visibilitySuspendTimer = null;
let musicStartedOnce = false;
let desiredMood = 'normal';
let appliedMood = null;

function createSfxSampleEntry(url, poolSize, fallbackTone) {
  return {
    url,
    poolSize,
    fallbackTone,
    rawBytes: null,
    audioBuffer: null,
    fetchPromise: null,
    decodePromise: null,
    htmlPool: [],
    poolIdx: 0
  };
}

const sfxSamples = {
  pop: createSfxSampleEntry(AUDIO_ASSETS.pop, 4, {
    freq: 520,
    endFreq: 760,
    duration: 0.07,
    type: 'triangle',
    gain: 0.05
  }),
  swoosh: createSfxSampleEntry(AUDIO_ASSETS.swoosh, 3, {
    freq: 340,
    endFreq: 680,
    duration: 0.14,
    type: 'sine',
    gain: 0.08
  }),
  count: createSfxSampleEntry(AUDIO_ASSETS.count, 3, {
    freq: 660,
    endFreq: 880,
    duration: 0.11,
    type: 'triangle',
    gain: 0.09
  }),
  go: createSfxSampleEntry(AUDIO_ASSETS.go, 2, {
    freq: 523.25,
    endFreq: 1046.5,
    duration: 0.24,
    type: 'triangle',
    gain: 0.11
  }),
  god: createSfxSampleEntry(AUDIO_ASSETS.god, 2, {
    freq: 659.25,
    endFreq: 1318.5,
    duration: 0.38,
    type: 'triangle',
    gain: 0.13
  }),
  bad: createSfxSampleEntry(AUDIO_ASSETS.bad, 2, {
    freq: 320,
    endFreq: 140,
    duration: 0.38,
    type: 'sawtooth',
    gain: 0.12
  })
};

function createMusicTrackEntry(key, url) {
  return {
    key,
    url,
    rawBytes: null,
    audioBuffer: null,
    fetchPromise: null,
    decodePromise: null,
    decodeFailed: false,
    gainNode: null,
    sourceNode: null,
    htmlEl: null,
    htmlWeight: key === 'normal' ? 1 : 0
  };
}

const musicTracks = {
  normal: createMusicTrackEntry('normal', AUDIO_ASSETS.musicBg),
  play: createMusicTrackEntry('play', AUDIO_ASSETS.musicBgPlay),
  hot: createMusicTrackEntry('hot', AUDIO_ASSETS.musicHotBg)
};

let htmlFadeTimer = null;

function getAudioContext({ allowCreate = true } = {}) {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    if (!allowCreate) return null;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended' && audioUnlocked && document.visibilityState !== 'hidden') {
    audioCtx.resume().catch(() => null);
  }
  return audioCtx;
}

function getSfxFactor() {
  const state = store.getState();
  const vol = state.sfxVolume ?? (state.soundEnabled ? 80 : 0);
  if (!state.soundEnabled || vol <= 0) return 0;
  return Math.max(0, Math.min(1, vol / 100));
}

function getMusicGainLevel() {
  const state = store.getState();
  if (state.screen === 'splash') return 0;
  const vol = state.musicVolume ?? 50;
  if (vol <= 0 || document.visibilityState === 'hidden') return 0;
  return Math.max(0, Math.min(1, vol / 100)) * MUSIC_MAX_GAIN;
}

function fetchBytesCached(entry) {
  if (entry.rawBytes) return Promise.resolve(entry.rawBytes);
  if (entry.fetchPromise) return entry.fetchPromise;
  if (typeof fetch !== 'function') return Promise.resolve(null);

  entry.fetchPromise = fetch(entry.url)
    .then((res) => (res && res.ok ? res.arrayBuffer() : null))
    .then((buf) => {
      if (buf) entry.rawBytes = buf;
      entry.fetchPromise = null;
      return entry.rawBytes;
    })
    .catch(() => {
      entry.fetchPromise = null;
      return null;
    });

  return entry.fetchPromise;
}

function ensureBufferDecoded(entry, ctx, onReady = null) {
  if (entry.audioBuffer) return Promise.resolve(entry.audioBuffer);
  if (!ctx || typeof ctx.decodeAudioData !== 'function') return Promise.resolve(null);
  if (entry.decodePromise) return entry.decodePromise;

  entry.decodePromise = fetchBytesCached(entry)
    .then((raw) => {
      if (!raw) return null;
      return ctx.decodeAudioData(raw.slice(0));
    })
    .then((decoded) => {
      entry.decodePromise = null;
      if (decoded) {
        entry.audioBuffer = decoded;
        entry.decodeFailed = false;
        if (onReady) onReady(entry);
      } else {
        entry.decodeFailed = true;
      }
      return entry.audioBuffer;
    })
    .catch(() => {
      entry.decodePromise = null;
      entry.decodeFailed = true;
      if (onReady) onReady(entry);
      return null;
    });

  return entry.decodePromise;
}

function ensureMusicBus(ctx) {
  if (!ctx) return null;
  const now = ctx.currentTime;
  if (!masterMusicGain) {
    masterMusicGain = ctx.createGain();
    masterMusicGain.gain.setValueAtTime(0, now);
    masterMusicGain.connect(ctx.destination);
  }
  for (const key of Object.keys(musicTracks)) {
    const track = musicTracks[key];
    if (!track.gainNode) {
      track.gainNode = ctx.createGain();
      track.gainNode.gain.setValueAtTime(key === desiredMood ? 1 : 0, now);
      track.gainNode.connect(masterMusicGain);
    }
  }
  return masterMusicGain;
}

function scheduleTrackCrossfade(track, targetWeight, now, durationSec = MUSIC_CROSSFADE_SEC) {
  if (!track?.gainNode) return;
  const param = track.gainNode.gain;
  const current = Math.max(0, Math.min(1, Number.isFinite(param.value) ? param.value : 0));
  param.cancelScheduledValues(now);
  param.setValueAtTime(current, now);

  if (durationSec <= 0 || Math.abs(targetWeight - current) < 0.005) {
    param.setValueAtTime(targetWeight, now);
    return;
  }

  // Rampa en 2 tramos igual-potencia (0.7071 en t/2) para evitar caidas de volumen
  const mid = targetWeight > current
    ? current + (targetWeight - current) * 0.7071
    : current * 0.7071;

  param.linearRampToValueAtTime(mid, now + durationSec * 0.5);
  param.linearRampToValueAtTime(targetWeight, now + durationSec);
}

function ensureTrackSourceStarted(track, ctx) {
  if (!track || !track.audioBuffer || !track.gainNode || track.sourceNode) return false;
  if (!ctx || !audioUnlocked || document.visibilityState === 'hidden') return false;

  try {
    const src = ctx.createBufferSource();
    src.buffer = track.audioBuffer;
    src.loop = true;
    src.connect(track.gainNode);
    src.start(0);
    track.sourceNode = src;
    src.onended = () => {
      if (track.sourceNode === src) track.sourceNode = null;
    };
    return true;
  } catch {
    return false;
  }
}

function applyMusicMood(ctx, { immediate = false } = {}) {
  const anyReady = Object.values(musicTracks).some((t) => Boolean(t.sourceNode));
  if (!anyReady) return;

  const now = ctx.currentTime;
  const targetTrack = musicTracks[desiredMood];

  if (!musicStartedOnce || immediate) {
    for (const key of Object.keys(musicTracks)) {
      scheduleTrackCrossfade(musicTracks[key], key === desiredMood ? 1 : 0, now, 0);
    }
    appliedMood = desiredMood;
    musicStartedOnce = true;
    return;
  }

  // Espera a que la pista destino haya iniciado su source para cruzar sin silencios
  if (appliedMood !== desiredMood && targetTrack?.sourceNode) {
    for (const key of Object.keys(musicTracks)) {
      scheduleTrackCrossfade(
        musicTracks[key],
        key === desiredMood ? 1 : 0,
        now,
        MUSIC_CROSSFADE_SEC
      );
    }
    appliedMood = desiredMood;
  }
}

function ensureHtmlMusicFallbackElements() {
  if (typeof Audio === 'undefined') return;
  for (const key of Object.keys(musicTracks)) {
    const track = musicTracks[key];
    if (track.htmlEl) continue;
    try {
      const el = new Audio(track.url);
      el.loop = true;
      el.preload = 'auto';
      el.volume = 0;
      track.htmlEl = el;
    } catch {
      track.htmlEl = null;
    }
  }
}

function updateHtmlMusicFallback(level) {
  const anyDecodeFailed = Object.values(musicTracks).some((t) => t.decodeFailed);
  const noWebAudio = typeof (window.AudioContext || window.webkitAudioContext) !== 'function';
  if (!noWebAudio && !anyDecodeFailed) return;

  ensureHtmlMusicFallbackElements();
  const shouldPlay = audioUnlocked && level > 0 && document.visibilityState !== 'hidden';
  if (!shouldPlay) {
    for (const key of Object.keys(musicTracks)) {
      musicTracks[key].htmlEl?.pause?.();
    }
    if (htmlFadeTimer) {
      clearInterval(htmlFadeTimer);
      htmlFadeTimer = null;
    }
    return;
  }

  for (const key of Object.keys(musicTracks)) {
    const track = musicTracks[key];
    if (!track.htmlEl) continue;
    if (track.htmlEl.paused) {
      track.htmlEl.play().catch(() => null);
    }
  }

  if (!htmlFadeTimer) {
    const stepMs = 45;
    const stepDelta = stepMs / (MUSIC_CROSSFADE_SEC * 1000);
    htmlFadeTimer = setInterval(() => {
      const lvl = getMusicGainLevel();
      if (!audioUnlocked || lvl <= 0 || document.visibilityState === 'hidden') {
        clearInterval(htmlFadeTimer);
        htmlFadeTimer = null;
        return;
      }
      let settled = true;
      for (const key of Object.keys(musicTracks)) {
        const track = musicTracks[key];
        const targetW = key === desiredMood ? 1 : 0;
        const diff = targetW - track.htmlWeight;
        if (Math.abs(diff) <= stepDelta) {
          track.htmlWeight = targetW;
        } else {
          track.htmlWeight += Math.sign(diff) * stepDelta;
          settled = false;
        }
        if (track.htmlEl) {
          try {
            track.htmlEl.volume = Math.max(0, Math.min(1, track.htmlWeight * lvl));
          } catch {
            // Safari iOS ignora audio.volume (solo lectura)
          }
        }
      }
      if (settled && htmlFadeTimer) {
        clearInterval(htmlFadeTimer);
        htmlFadeTimer = null;
      }
    }, stepMs);
  }
}

function updateMusicLoop() {
  const level = getMusicGainLevel();
  const isHidden = document.visibilityState === 'hidden';
  const ctx = getAudioContext({ allowCreate: audioUnlocked && level > 0 && !isHidden });

  if (ctx) {
    if (isHidden) {
      if (masterMusicGain) {
        const now = ctx.currentTime;
        masterMusicGain.gain.cancelScheduledValues(now);
        masterMusicGain.gain.setTargetAtTime(0, now, 0.04);
      }
      if (!visibilitySuspendTimer && ctx.state === 'running') {
        visibilitySuspendTimer = setTimeout(() => {
          visibilitySuspendTimer = null;
          if (document.visibilityState === 'hidden' && audioCtx?.state === 'running') {
            audioCtx.suspend().catch(() => null);
          }
        }, 160);
      }
      updateHtmlMusicFallback(0);
      return;
    }

    if (visibilitySuspendTimer) {
      clearTimeout(visibilitySuspendTimer);
      visibilitySuspendTimer = null;
    }

    if (audioUnlocked && level > 0) {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => null);
      }
      ensureMusicBus(ctx);
      const now = ctx.currentTime;
      const tau = musicStartedOnce ? 0.07 : 0.2;
      masterMusicGain.gain.cancelScheduledValues(now);
      masterMusicGain.gain.setTargetAtTime(level, now, tau);

      for (const key of Object.keys(musicTracks)) {
        const track = musicTracks[key];
        if (track.audioBuffer) {
          ensureTrackSourceStarted(track, ctx);
        } else {
          ensureBufferDecoded(track, ctx, () => {
            if (audioUnlocked && getMusicGainLevel() > 0 && document.visibilityState !== 'hidden') {
              const activeCtx = getAudioContext({ allowCreate: false });
              if (activeCtx) {
                ensureMusicBus(activeCtx);
                ensureTrackSourceStarted(track, activeCtx);
                applyMusicMood(activeCtx);
              }
            }
          });
        }
      }

      applyMusicMood(ctx);
    } else if (masterMusicGain) {
      const now = ctx.currentTime;
      masterMusicGain.gain.cancelScheduledValues(now);
      masterMusicGain.gain.setTargetAtTime(0, now, 0.05);
    }
  }

  updateHtmlMusicFallback(level);
}

function bindVisibilityOnce() {
  if (visibilityBound || typeof document === 'undefined') return;
  visibilityBound = true;
  document.addEventListener('visibilitychange', () => {
    updateMusicLoop();
  });
}

function playTone({ freq = 440, endFreq = null, duration = 0.14, type = 'sine', gain = 0.08, delay = 0 }) {
  const sfxFactor = getSfxFactor();
  if (sfxFactor <= 0) return;

  audioUnlocked = true;
  bindVisibilityOnce();
  const ctx = getAudioContext({ allowCreate: true });
  if (!ctx) return;

  const scaledGain = Math.max(0.002, gain * sfxFactor);
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const vol = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (endFreq) {
    osc.frequency.exponentialRampToValueAtTime(endFreq, start + duration);
  }

  vol.gain.setValueAtTime(0.001, start);
  vol.gain.linearRampToValueAtTime(scaledGain, start + 0.015);
  vol.gain.exponentialRampToValueAtTime(0.001, start + duration);

  osc.connect(vol);
  vol.connect(ctx.destination);

  osc.start(start);
  osc.stop(start + duration + 0.02);
  updateMusicLoop();
}

function ensureSampleHtmlPool(entry) {
  if (entry.htmlPool.length > 0 || typeof Audio === 'undefined') return entry.htmlPool;
  for (let i = 0; i < entry.poolSize; i++) {
    try {
      const audio = new Audio(entry.url);
      audio.preload = 'auto';
      entry.htmlPool.push(audio);
    } catch {
      break;
    }
  }
  return entry.htmlPool;
}

function playHtmlPoolFallback(entry, sfxFactor) {
  const pool = ensureSampleHtmlPool(entry);
  if (pool.length > 0) {
    const el = pool[entry.poolIdx % pool.length];
    entry.poolIdx += 1;
    try {
      el.volume = Math.min(1, sfxFactor);
      el.currentTime = 0;
      const playPromise = el.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => playTone(entry.fallbackTone));
      }
      return;
    } catch {
      // continua a respaldo sintetico
    }
  }
  playTone(entry.fallbackTone);
}

function playSampleSfx(sampleKey, { delay = 0, gainScale = 1 } = {}) {
  const entry = sfxSamples[sampleKey];
  if (!entry) return;
  const sfxFactor = getSfxFactor();
  if (sfxFactor <= 0) return;

  audioUnlocked = true;
  bindVisibilityOnce();
  const ctx = getAudioContext({ allowCreate: true });
  updateMusicLoop();

  if (ctx) {
    if (entry.audioBuffer) {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => null);
      }
      try {
        const src = ctx.createBufferSource();
        const gainNode = ctx.createGain();
        src.buffer = entry.audioBuffer;
        gainNode.gain.setValueAtTime(Math.min(1, sfxFactor * gainScale), ctx.currentTime);
        src.connect(gainNode);
        gainNode.connect(ctx.destination);
        src.start(delay > 0 ? ctx.currentTime + delay : 0);
        return;
      } catch {
        // continua a respaldo HTMLAudioElement
      }
    } else {
      ensureBufferDecoded(entry, ctx);
    }
  }

  if (delay > 0) {
    setTimeout(() => playHtmlPoolFallback(entry, Math.min(1, sfxFactor * gainScale)), Math.round(delay * 1000));
  } else {
    playHtmlPoolFallback(entry, Math.min(1, sfxFactor * gainScale));
  }
}

export function vibrate(pattern = 25) {
  if (getSfxFactor() <= 0) return;
  const userActive =
    typeof navigator !== 'undefined' &&
    (!navigator.userActivation || navigator.userActivation.isActive);
  if (userActive && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(pattern);
    } catch {
      // ignore
    }
  }
}

export const audioFx = {
  preload() {
    for (const sample of Object.values(sfxSamples)) {
      ensureSampleHtmlPool(sample);
      fetchBytesCached(sample);
    }
    for (const track of Object.values(musicTracks)) {
      fetchBytesCached(track);
    }
  },

  unlock() {
    audioUnlocked = true;
    bindVisibilityOnce();
    const ctx = getAudioContext({ allowCreate: true });
    for (const sample of Object.values(sfxSamples)) {
      if (ctx) ensureBufferDecoded(sample, ctx);
      ensureSampleHtmlPool(sample);
    }
    updateMusicLoop();
    if (!ctx) return Promise.resolve(true);
    if (ctx.state === 'running') return Promise.resolve(true);
    return ctx
      .resume()
      .then(() => {
        updateMusicLoop();
        return ctx.state === 'running';
      })
      .catch(() => false);
  },

  syncVolumes() {
    bindVisibilityOnce();
    updateMusicLoop();
  },

  setMusicMood(mood = 'normal') {
    const nextMood = musicTracks[mood] ? mood : 'normal';
    if (desiredMood === nextMood && appliedMood === nextMood) return;
    desiredMood = nextMood;
    if (audioUnlocked) {
      const ctx = getAudioContext({ allowCreate: false });
      if (ctx) {
        ensureMusicBus(ctx);
        const track = musicTracks[nextMood];
        if (track?.audioBuffer) {
          ensureTrackSourceStarted(track, ctx);
        }
      }
      updateMusicLoop();
    }
  },

  tap() {
    playSampleSfx('pop');
    vibrate(12);
  },

  swoosh(options = {}) {
    playSampleSfx('swoosh', options);
  },

  count(options = {}) {
    playSampleSfx('count', options);
    vibrate(18);
  },

  go(options = {}) {
    playSampleSfx('go', options);
    vibrate([30, 35, 55]);
  },

  god(options = {}) {
    playSampleSfx('god', options);
    vibrate([28, 35, 55]);
  },

  bad(options = {}) {
    playSampleSfx('bad', options);
    vibrate([45, 50, 45]);
  },

  cardFlip(options = {}) {
    playSampleSfx('swoosh', options);
    vibrate([18, 25, 22]);
  },

  diceRoll() {
    [0, 0.07, 0.14, 0.22].forEach((delay, idx) => {
      playTone({
        freq: 240 + idx * 95,
        endFreq: 180 + idx * 110,
        duration: 0.06,
        type: 'square',
        gain: 0.045,
        delay
      });
    });
    vibrate([20, 35, 20, 45]);
  },

  partyBurst() {
    playTone({ freq: 523.25, duration: 0.12, type: 'triangle', gain: 0.07, delay: 0 });
    playTone({ freq: 659.25, duration: 0.12, type: 'triangle', gain: 0.07, delay: 0.08 });
    playTone({ freq: 783.99, duration: 0.22, type: 'triangle', gain: 0.08, delay: 0.16 });
    vibrate([30, 40, 60]);
  }
};
