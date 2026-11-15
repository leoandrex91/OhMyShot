import { DESIGN_TOKENS } from '../config/constants.js';

/**
 * Efectos visuales 100% HTML5 + Web Animations API + Canvas 2D puro (sin librerias externas).
 * Incluye pop de cartas, confeti, screen flash, flares opticos y toasts.
 */

const CONFETTI_PRESETS = {
  party: {
    particleCount: 56,
    spread: 1.25,
    originY: 0.65,
    starsOnly: false,
    colors: [
      DESIGN_TOKENS.shotPink,
      DESIGN_TOKENS.mintPop,
      DESIGN_TOKENS.electricYellow,
      DESIGN_TOKENS.chaosPurple
    ]
  },
  hot: {
    particleCount: 44,
    spread: 1.15,
    originY: 0.62,
    starsOnly: false,
    colors: [DESIGN_TOKENS.fireRed, DESIGN_TOKENS.fireOrange, DESIGN_TOKENS.fireAmber]
  },
  event: {
    particleCount: 38,
    spread: 1.45,
    originY: 0.5,
    starsOnly: true,
    colors: [DESIGN_TOKENS.electricYellow, DESIGN_TOKENS.mintPop, DESIGN_TOKENS.softWhite]
  },
  duel: {
    particleCount: 32,
    spread: 1.35,
    originY: 0.54,
    starsOnly: true,
    colors: [DESIGN_TOKENS.duelCoral, DESIGN_TOKENS.mintPop, DESIGN_TOKENS.electricYellow]
  },
  intense: {
    particleCount: 30,
    spread: 1.2,
    originY: 0.56,
    starsOnly: true,
    colors: [DESIGN_TOKENS.chaosPurple, DESIGN_TOKENS.shotPink, DESIGN_TOKENS.mintPop]
  },
  winner: {
    particleCount: 74,
    spread: 1.4,
    originY: 0.56,
    starsOnly: false,
    colors: [DESIGN_TOKENS.electricYellow, DESIGN_TOKENS.mintPop, DESIGN_TOKENS.shotPink]
  }
};

function prefersReducedMotion() {
  return Boolean(
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function cancelAnimations(el) {
  if (!el || typeof el.getAnimations !== 'function') return;
  el.getAnimations().forEach((anim) => anim.cancel());
}

class PureCanvasConfetti {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.rafId = null;
    this.lastTime = 0;
  }

  launch(config) {
    if (prefersReducedMotion()) return;
    this.#ensureCanvas();
    if (!this.ctx) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const originX = w * 0.5;
    const originY = h * (config.originY ?? 0.62);
    const colors = config.colors || CONFETTI_PRESETS.party.colors;
    const baseSpeed = Math.max(460, Math.min(820, h * 0.85));

    for (let i = 0; i < (config.particleCount || 48); i++) {
      const spreadAngle = (Math.random() - 0.5) * (config.spread || 1.25);
      const angle = -Math.PI * 0.5 + spreadAngle;
      const speed = baseSpeed * (0.48 + Math.random() * 0.68);
      this.particles.push({
        x: originX + (Math.random() - 0.5) * 32,
        y: originY + (Math.random() - 0.5) * 16,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 6 + Math.random() * 6,
        color: colors[i % colors.length],
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 12,
        tiltPhase: Math.random() * Math.PI * 2,
        shape: config.starsOnly ? 'star' : i % 4 === 0 ? 'circle' : 'rect',
        life: 0,
        maxLife: 1.55 + Math.random() * 0.85
      });
    }

    if (!this.rafId) {
      this.lastTime = performance.now();
      this.rafId = requestAnimationFrame(this.#tick);
    }
  }

  #ensureCanvas() {
    const w = Math.max(1, window.innerWidth);
    const h = Math.max(1, window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    if (!this.canvas || !this.canvas.isConnected) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'oms-confetti-canvas';
      this.canvas.setAttribute('aria-hidden', 'true');
      this.canvas.style.cssText =
        'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:48;';
      document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
    }

    const targetW = Math.round(w * dpr);
    const targetH = Math.round(h * dpr);
    if (this.canvas.width !== targetW || this.canvas.height !== targetH) {
      this.canvas.width = targetW;
      this.canvas.height = targetH;
      this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  #tick = (now) => {
    const rawDt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    const dt = Math.min(0.05, Math.max(0.001, rawDt));

    if (!this.ctx || !this.canvas) {
      this.rafId = null;
      this.particles = [];
      return;
    }

    const w = window.innerWidth;
    const h = window.innerHeight;
    this.ctx.clearRect(0, 0, w, h);

    const gravity = 980;
    const drag = Math.pow(0.28, dt);
    const alive = [];

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife || p.y > h + 40) continue;

      p.vx *= drag;
      p.vy = p.vy * drag + gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vRot * dt;
      p.tiltPhase += dt * 10;

      const fade = Math.max(0, Math.min(1, (1 - p.life / p.maxLife) * 1.6));
      this.ctx.save();
      this.ctx.globalAlpha = fade;
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rot);
      this.ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size * 0.42, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.shape === 'star') {
        // Destello 4 puntas para chispas especiales de carta
        const rOuter = p.size * 0.85;
        const rInner = rOuter * 0.28;
        this.ctx.beginPath();
        for (let k = 0; k < 8; k++) {
          const rad = k % 2 === 0 ? rOuter : rInner;
          const ang = (k * Math.PI) / 4;
          const px = Math.cos(ang) * rad;
          const py = Math.sin(ang) * rad;
          if (k === 0) this.ctx.moveTo(px, py);
          else this.ctx.lineTo(px, py);
        }
        this.ctx.closePath();
        this.ctx.fill();
      } else {
        const flip = Math.max(0.25, Math.abs(Math.cos(p.tiltPhase)));
        this.ctx.fillRect(-p.size * 0.5, -p.size * 0.35 * flip, p.size, p.size * 0.7 * flip);
      }

      this.ctx.restore();
      alive.push(p);
    }

    this.particles = alive;
    if (alive.length > 0) {
      this.rafId = requestAnimationFrame(this.#tick);
    } else {
      this.rafId = null;
      this.ctx.clearRect(0, 0, w, h);
    }
  };
}

const confettiEngine = new PureCanvasConfetti();

export const visualFx = {
  animateCardPop(element) {
    this.animateCardSlideInLeft(element);
  },

  animateCardSlideInLeft(element) {
    if (!element) return;
    cancelAnimations(element);

    if (prefersReducedMotion() || typeof element.animate !== 'function') {
      element.style.opacity = '1';
      element.style.transform = 'none';
      return;
    }

    element.animate(
      [
        {
          transform: 'perspective(960px) translate3d(-140px, 0, 0) rotate(-6deg) scale(0.94)',
          opacity: 0
        },
        {
          transform: 'perspective(960px) translate3d(8px, 0, 0) rotate(0.8deg) scale(1.015)',
          opacity: 1,
          offset: 0.65
        },
        {
          transform: 'perspective(960px) translate3d(0, 0, 0) rotate(0deg) scale(1)',
          opacity: 1
        }
      ],
      {
        duration: 420,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'none'
      }
    );
  },

  triggerConfetti(preset = 'party') {
    const config = CONFETTI_PRESETS[preset] || CONFETTI_PRESETS.party;
    confettiEngine.launch(config);
  },

  syncGameFxState(isInGame = false, fxMode = 'ambient') {
    if (typeof document === 'undefined' || !document.body) return;
    document.body.dataset.inGame = isInGame ? 'true' : 'false';
    document.body.dataset.cardFx = isInGame && fxMode && fxMode !== 'ambient' ? fxMode : 'ambient';
  },

  triggerSpecialCardFx(fxMode, cardEl, _accentCssColor = DESIGN_TOKENS.shotPink) {
    if (!fxMode || fxMode === 'ambient') return;
    this.triggerConfetti(CONFETTI_PRESETS[fxMode] ? fxMode : 'intense');

    if (!cardEl || prefersReducedMotion() || typeof cardEl.animate !== 'function') return;
    cancelAnimations(cardEl);

    const keyframesByMode = {
      hot: [
        { transform: 'perspective(960px) translate3d(-140px, 10px, 0) rotate(-7deg) scale(0.92)', opacity: 0 },
        { transform: 'perspective(960px) translate3d(10px, -2px, 0) rotate(1.2deg) scale(1.025)', opacity: 1, offset: 0.65 },
        { transform: 'perspective(960px) translate3d(0, 0, 0) rotate(0deg) scale(1)', opacity: 1 }
      ],
      event: [
        { transform: 'perspective(960px) translate3d(-140px, 0, 0) rotate(-6deg) scale(0.92)', opacity: 0 },
        { transform: 'perspective(960px) translate3d(8px, 0, 0) rotate(0.8deg) scale(1.02)', opacity: 1, offset: 0.68 },
        { transform: 'perspective(960px) translate3d(0, 0, 0) rotate(0deg) scale(1)', opacity: 1 }
      ],
      duel: [
        { transform: 'perspective(960px) translate3d(-140px, 0, 0) rotate(-6deg) scale(0.92)', opacity: 0 },
        { transform: 'perspective(960px) translate3d(8px, 0, 0) rotate(1deg) scale(1.02)', opacity: 1, offset: 0.7 },
        { transform: 'perspective(960px) translate3d(0, 0, 0) rotate(0deg) scale(1)', opacity: 1 }
      ],
      intense: [
        { transform: 'perspective(960px) translate3d(-140px, 6px, 0) rotate(-6deg) scale(0.92)', opacity: 0 },
        { transform: 'perspective(960px) translate3d(8px, -2px, 0) rotate(0.8deg) scale(1.02)', opacity: 1, offset: 0.66 },
        { transform: 'perspective(960px) translate3d(0, 0, 0) rotate(0deg) scale(1)', opacity: 1 }
      ],
      bonus: [
        { transform: 'perspective(960px) translate3d(-140px, 0, 0) rotate(-6deg) scale(0.92)', opacity: 0 },
        { transform: 'perspective(960px) translate3d(8px, 0, 0) rotate(1deg) scale(1.025)', opacity: 1, offset: 0.65 },
        { transform: 'perspective(960px) translate3d(0, 0, 0) rotate(0deg) scale(1)', opacity: 1 }
      ]
    };

    cardEl.animate(keyframesByMode[fxMode] || keyframesByMode.intense, {
      duration: 420,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      fill: 'none'
    });
  },

  triggerScreenFlash(accentCssColor = DESIGN_TOKENS.shotPink) {
    const overlay = document.querySelector('#fx-flash-overlay');
    if (overlay) {
      overlay.style.background = `radial-gradient(circle at 50% 42%, ${accentCssColor}2e, transparent 72%)`;
      cancelAnimations(overlay);

      if (!prefersReducedMotion() && typeof overlay.animate === 'function') {
        overlay.animate([{ opacity: 0 }, { opacity: 0.2, offset: 0.25 }, { opacity: 0 }], {
          duration: 380,
          easing: 'ease-out',
          fill: 'none'
        });
      }
    }
  },

  triggerLensFlare(accentCssColor = DESIGN_TOKENS.shotPink) {
    const layer = document.querySelector('#lens-fx-layer');
    if (!layer || prefersReducedMotion()) return;

    layer.style.setProperty('--flare-color', accentCssColor);

    const streak = layer.querySelector('.lens-anamorphic-streak, .lens-streak');
    if (streak && typeof streak.animate === 'function') {
      cancelAnimations(streak);
      streak.animate(
        [
          { opacity: 0.11 },
          { opacity: 0.24, offset: 0.35 },
          { opacity: 0.11 }
        ],
        { duration: 680, easing: 'ease-out', fill: 'none' }
      );
    }
  },

  showToast(message) {
    const container = document.querySelector('#toast-container');
    if (!container) return;

    const item = document.createElement('div');
    item.className = 'toast-pill';
    item.textContent = message;
    container.appendChild(item);

    if (prefersReducedMotion() || typeof item.animate !== 'function') {
      setTimeout(() => item.remove(), 2500);
      return;
    }

    item.animate(
      [
        { transform: 'translate3d(0, 14px, 0)', opacity: 0 },
        { transform: 'translate3d(0, 0, 0)', opacity: 1 }
      ],
      { duration: 220, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' }
    );

    const exitAnim = item.animate(
      [
        { transform: 'translate3d(0, 0, 0)', opacity: 1 },
        { transform: 'translate3d(0, -10px, 0)', opacity: 0 }
      ],
      {
        delay: 2350,
        duration: 240,
        easing: 'ease-in',
        fill: 'forwards'
      }
    );

    exitAnim.onfinish = () => item.remove();
    setTimeout(() => {
      if (item.isConnected) item.remove();
    }, 2800);
  }
};
