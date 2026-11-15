import { DESIGN_TOKENS } from '../config/constants.js';

/**
 * Escena 3D pura en HTML5 Canvas 2D (cero dependencias externas):
 * Esfera de particulas Fibonacci + nucleo armonico + anillos orbitales y bokeh
 * con la paleta oficial de Oh My Shot! Design Kit v1.
 */

const SPHERE_PALETTE = [
  DESIGN_TOKENS.shotPink,
  DESIGN_TOKENS.mintPop,
  DESIGN_TOKENS.electricYellow,
  DESIGN_TOKENS.partyCoral,
  DESIGN_TOKENS.chaosPurple,
  DESIGN_TOKENS.softWhite
];

const HOT_PALETTE = [
  '#FF1F2D',
  '#FF4818',
  '#FF6E1A',
  '#FF951C',
  '#FFB833',
  '#FFE0A3'
];

const SPECIAL_MODE_SPRITES = Object.freeze({
  hot: [0, 1, 2, 3, 4, 5],
  event: [2, 1, 5, 2, 1, 5],
  duel: [3, 1, 3, 1, 4, 5],
  intense: [4, 0, 1, 4, 0, 5]
});

function parseHexToRgb(hex) {
  if (typeof hex === 'number' && Number.isFinite(hex)) {
    return {
      r: (hex >> 16) & 255,
      g: (hex >> 8) & 255,
      b: hex & 255
    };
  }
  const clean = String(hex || DESIGN_TOKENS.shotPink)
    .trim()
    .replace(/^#/, '');
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16) || 255,
      g: parseInt(clean[1] + clean[1], 16) || 79,
      b: parseInt(clean[2] + clean[2], 16) || 163
    };
  }
  const num = parseInt(clean.slice(0, 6), 16);
  if (!Number.isFinite(num)) {
    return { r: 255, g: 79, b: 163 };
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function createGlowSprite(rgb, size = 64) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  if (!ctx) return c;

  const half = size / 2;
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.22, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.92)`);
  grad.addColorStop(0.55, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.32)`);
  grad.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return c;
}

function createStarSprite(rgb, size = 72) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  if (!ctx) return c;

  const half = size / 2;
  const glow = ctx.createRadialGradient(half, half, 0, half, half, half);
  glow.addColorStop(0, 'rgba(255, 255, 255, 1)');
  glow.addColorStop(0.18, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`);
  glow.addColorStop(0.55, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.18)`);
  glow.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  // Destello estelar en cruz 4 puntas pre-renderizado (cero costo por frame)
  ctx.save();
  ctx.translate(half, half);
  for (let arm = 0; arm < 2; arm++) {
    ctx.rotate(Math.PI * 0.5);
    const beam = ctx.createLinearGradient(-half, 0, half, 0);
    beam.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
    beam.addColorStop(0.42, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.55)`);
    beam.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
    beam.addColorStop(0.58, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.55)`);
    beam.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.ellipse(0, 0, half * 0.94, size * 0.045, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  return c;
}

class ParticleSphereStage {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.width = 0;
    this.height = 0;
    this.dpr = 1;
    this.initialized = false;
    this.disposed = false;
    this.rafId = null;

    this.targetRgb = parseHexToRgb(DESIGN_TOKENS.shotPink);
    this.currentRgb = { ...this.targetRgb };
    this.pulseEnergy = 0;
    this.spinBurst = 0;
    this.fxMode = 'ambient';
    this.fxEnergy = 0;
    this.elapsed = 0;
    this.lastFrameTime = 0;

    this.pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.reducedMotion = false;

    this.paletteSprites = [];
    this.starSprites = [];
    this.hotGlowSprites = [];
    this.hotStarSprites = [];
    this.auraCanvas = null;
    this.hotAuraCanvas = null;
    this.lastAuraKey = '';
    this.hotMix = 0;
    this.particles = [];
    this.embers = [];
    this.projected = [];

    this.boundResize = () => this.#handleResize();
    this.boundPointerMove = (e) => {
      this.pointer.targetX = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
      this.pointer.targetY = -(e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
    };
    this.boundVisibility = () => {
      if (!document.hidden && this.initialized && !this.disposed) {
        this.lastFrameTime = performance.now();
      }
    };
  }

  init(canvasSelector = '#stage-3d') {
    if (this.initialized) return true;
    const canvas = document.querySelector(canvasSelector);
    if (!canvas) return false;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return false;

    this.canvas = canvas;
    this.ctx = ctx;
    this.reducedMotion = Boolean(
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

    this.#buildSprites();
    this.#buildParticleCloud();
    this.#handleResize();

    window.addEventListener('resize', this.boundResize, { passive: true });
    window.addEventListener('pointermove', this.boundPointerMove, { passive: true });
    document.addEventListener('visibilitychange', this.boundVisibility, { passive: true });

    this.initialized = true;
    this.lastFrameTime = performance.now();
    this.#renderFrame(this.lastFrameTime);
    return true;
  }

  setMoodColor(hex = DESIGN_TOKENS.shotPink) {
    this.targetRgb = parseHexToRgb(hex);
  }

  setSpecialFx(mode = 'ambient', hex = null) {
    const validMode =
      mode === 'hot' || mode === 'event' || mode === 'duel' || mode === 'intense'
        ? mode
        : 'ambient';
    const modeChanged = validMode !== this.fxMode;
    this.fxMode = validMode;

    if (hex !== null && hex !== undefined) {
      this.setMoodColor(hex);
    }

    if (validMode === 'ambient') {
      this.fxEnergy = 0;
    } else if (modeChanged) {
      this.fxEnergy = 1;
      this.pulseEnergy = Math.max(this.pulseEnergy, validMode === 'hot' ? 0.45 : 1.05);
      this.spinBurst = Math.max(this.spinBurst, validMode === 'hot' ? 0.2 : 1.15);
    }
  }

  pulse(hex = null) {
    if (hex !== null && hex !== undefined) {
      this.setMoodColor(hex);
    }
    const isHot = this.fxMode === 'hot';
    this.pulseEnergy = Math.min(isHot ? 0.85 : 1.6, this.pulseEnergy + (isHot ? 0.35 : 0.9));
    this.spinBurst = Math.min(isHot ? 0.35 : 1.5, this.spinBurst + (isHot ? 0.14 : 0.55));
  }

  rollDiceAnimation() {
    this.pulseEnergy = 1.45;
    this.spinBurst = 2.4;
  }

  destroy() {
    this.disposed = true;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    window.removeEventListener('resize', this.boundResize);
    window.removeEventListener('pointermove', this.boundPointerMove);
    document.removeEventListener('visibilitychange', this.boundVisibility);
  }

  #buildSprites() {
    this.paletteSprites = SPHERE_PALETTE.map((hex) => createGlowSprite(parseHexToRgb(hex), 48));
    this.starSprites = SPHERE_PALETTE.map((hex) => createStarSprite(parseHexToRgb(hex), 72));
    this.hotGlowSprites = HOT_PALETTE.map((hex) => createGlowSprite(parseHexToRgb(hex), 48));
    this.hotStarSprites = HOT_PALETTE.map((hex) => createStarSprite(parseHexToRgb(hex), 72));

    this.auraCanvas = document.createElement('canvas');
    this.auraCanvas.width = 160;
    this.auraCanvas.height = 160;
    this.#updateAuraSprite(
      Math.round(this.currentRgb.r),
      Math.round(this.currentRgb.g),
      Math.round(this.currentRgb.b)
    );

    this.hotAuraCanvas = document.createElement('canvas');
    this.hotAuraCanvas.width = 160;
    this.hotAuraCanvas.height = 160;
    const hCtx = this.hotAuraCanvas.getContext('2d');
    if (hCtx) {
      const grad = hCtx.createRadialGradient(80, 80, 3, 80, 80, 80);
      grad.addColorStop(0, 'rgba(255, 84, 24, 0.34)');
      grad.addColorStop(0.45, 'rgba(220, 26, 30, 0.22)');
      grad.addColorStop(1, 'rgba(48, 6, 8, 0)');
      hCtx.fillStyle = grad;
      hCtx.fillRect(0, 0, 160, 160);
    }
  }

  #updateAuraSprite(rInt, gInt, bInt) {
    if (!this.auraCanvas) return;
    const qr = (rInt >> 2) << 2;
    const qg = (gInt >> 2) << 2;
    const qb = (bInt >> 2) << 2;
    const key = `${qr},${qg},${qb}`;
    if (key === this.lastAuraKey) return;
    this.lastAuraKey = key;

    const ctx = this.auraCanvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 160, 160);
    const grad = ctx.createRadialGradient(80, 80, 3, 80, 80, 80);
    grad.addColorStop(0, `rgba(${qr}, ${qg}, ${qb}, 0.24)`);
    grad.addColorStop(0.45, 'rgba(117, 74, 193, 0.14)');
    grad.addColorStop(1, 'rgba(16, 11, 34, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 160, 160);
  }

  #buildParticleCloud() {
    const items = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    // 1. Esfera principal Fibonacci (136 nodos luminosos bien definidos)
    const shellCount = 136;
    for (let i = 0; i < shellCount; i++) {
      const y = 1 - (i / (shellCount - 1)) * 2;
      const rAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * i;
      const radialJitter = 0.94 + (i % 7) * 0.018;
      items.push({
        kind: 'shell',
        bx: Math.cos(theta) * rAtY * radialJitter,
        by: y * radialJitter,
        bz: Math.sin(theta) * rAtY * radialJitter,
        size: 3.4 + (i % 5) * 0.7,
        alpha: 0.76 + (i % 3) * 0.08,
        spriteIdx: i % (SPHERE_PALETTE.length - 1),
        phase: i * 0.37,
        amp: 0.048 + (i % 4) * 0.014,
        twinkleRate: 0.4 + (i % 5) * 0.28,
        isStar: i % 11 === 0
      });
    }

    // 2. Nucleo interno energetico (34 particulas compactas)
    const coreCount = 34;
    for (let i = 0; i < coreCount; i++) {
      const y = 1 - (i / (coreCount - 1)) * 2;
      const rAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = -goldenAngle * i * 1.15;
      const radiusScale = 0.42 + (i % 5) * 0.055;
      items.push({
        kind: 'core',
        bx: Math.cos(theta) * rAtY * radiusScale,
        by: y * radiusScale,
        bz: Math.sin(theta) * rAtY * radiusScale,
        size: 3.8 + (i % 4) * 0.85,
        alpha: 0.72,
        spriteIdx: i % 4 === 0 ? 5 : i % 3,
        phase: i * 0.53,
        amp: 0.065,
        twinkleRate: 0.9 + (i % 4) * 0.35,
        isStar: i % 5 === 0
      });
    }

    // 3. Dos anillos orbitales inclinados con contra-precesion (52 nodos)
    const ringCount = 26;
    const tiltA = 0.52;
    const cosA = Math.cos(tiltA);
    const sinA = Math.sin(tiltA);
    for (let i = 0; i < ringCount; i++) {
      const a = (i / ringCount) * Math.PI * 2;
      const rx = Math.cos(a) * 1.32;
      const rz = Math.sin(a) * 1.32;
      items.push({
        kind: 'ringA',
        bx: rx,
        by: rz * sinA,
        bz: rz * cosA,
        size: i % 3 === 0 ? 4.8 : 2.9,
        alpha: 0.72,
        spriteIdx: i % 2 === 0 ? 1 : 2,
        phase: a,
        amp: 0.03,
        twinkleRate: 0.7 + (i % 3) * 0.35,
        isStar: i % 6 === 0
      });

      const b = a + 0.14;
      const rx2 = Math.cos(b) * 1.46;
      const rz2 = Math.sin(b) * 1.46;
      items.push({
        kind: 'ringB',
        bx: rx2 * Math.cos(-0.45) - rz2 * Math.sin(-0.45) * 0.25,
        by: -rz2 * sinA * 0.92,
        bz: rz2 * cosA,
        size: i % 4 === 0 ? 4.6 : 2.7,
        alpha: 0.6,
        spriteIdx: i % 2 === 0 ? 0 : 4,
        phase: b * 1.4,
        amp: 0.026,
        twinkleRate: 0.65 + (i % 4) * 0.3,
        isStar: i % 7 === 0
      });
    }

    // 4. Bokeh ambiental disperso en profundidad (28 particulas lentas)
    const bokehCount = 28;
    for (let i = 0; i < bokehCount; i++) {
      const seedA = ((i * 73) % 360) * (Math.PI / 180);
      const seedB = ((i * 137) % 180) * (Math.PI / 180);
      const dist = 1.9 + (i % 7) * 0.34;
      items.push({
        kind: 'bokeh',
        bx: Math.sin(seedB) * Math.cos(seedA) * dist,
        by: Math.cos(seedB) * dist * 0.88,
        bz: Math.sin(seedB) * Math.sin(seedA) * dist,
        size: 6.2 + (i % 5) * 2.1,
        alpha: 0.32 + (i % 4) * 0.05,
        spriteIdx: i % SPHERE_PALETTE.length,
        phase: i * 0.71,
        amp: 0.09,
        twinkleRate: 0.35 + (i % 3) * 0.22,
        isStar: i % 9 === 0
      });
    }

    this.particles = items;
    this.projected = items.map(() => ({
      sx: 0,
      sy: 0,
      sz: 0,
      r: 0,
      a: 0,
      spriteIdx: 0,
      isStar: false,
      kind: 'shell'
    }));

    // 5. Chispas / destellos especiales pre-alocados (solo activos dentro de cartas especiales)
    this.embers = Array.from({ length: 24 }, (_, idx) => ({
      xSeed: (idx * 0.6180339) % 1,
      phase: idx * 0.83,
      speed: 0.16 + (idx % 5) * 0.055,
      size: 4.5 + (idx % 4) * 2.2,
      sway: 14 + (idx % 5) * 9,
      spriteIdx: idx % SPHERE_PALETTE.length
    }));
  }

  #drawAmbientFilaments(ctx, cx, cy, count) {
    if (this.reducedMotion) return;
    const stride = this.fxMode === 'duel' ? 2 : 3;
    let prevX = null;
    let prevY = null;
    let drawn = 0;
    const maxLinks = this.fxMode === 'ambient' ? 14 : 22;
    ctx.lineWidth = this.fxMode === 'ambient' ? 0.9 : 1.3;

    for (let i = 0; i < count && drawn < maxLinks; i += stride) {
      const pt = this.projected[i];
      if (!pt || (pt.kind !== 'core' && pt.kind !== 'ringA') || pt.sz > 0.35 || pt.a < 0.35) {
        continue;
      }
      if (prevX !== null && Math.hypot(pt.sx - prevX, pt.sy - prevY) < 160) {
        const { r, g, b } = this.currentRgb;
        ctx.strokeStyle = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${
          this.fxMode === 'ambient' ? 0.16 : 0.32
        })`;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(pt.sx, pt.sy);
        ctx.stroke();
        drawn++;
      }
      prevX = pt.sx;
      prevY = pt.sy;
    }

    // Destello focal suave (sin parpadeo rapido) para cartas Evento / Duelo
    if (this.fxMode === 'event' || this.fxMode === 'duel') {
      const spr = this.starSprites[this.fxMode === 'event' ? 2 : 1];
      if (spr) {
        const size = 56 + Math.sin(this.elapsed * 0.9) * 5;
        ctx.globalAlpha = 0.28;
        ctx.drawImage(spr, cx - size * 0.5, cy - size * 0.5, size, size);
      }
    }
  }

  #drawHotFireBackdrop(ctx, w, h, t, mix) {
    if (mix <= 0.01) return;
    const motionTime = this.reducedMotion ? t * 0.25 : t;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // Resplandores calidos ultra lentos (el fuego inferior corre por CSS Only Fire en .lens-hot-flames-bed)
    const plumes = [
      {
        cx: w * (0.28 + Math.sin(motionTime * 0.075) * 0.12),
        cy: h * (0.68 + Math.cos(motionTime * 0.06) * 0.08),
        r: Math.max(w, h) * 0.56,
        c0: `rgba(220, 32, 24, ${(0.22 * mix).toFixed(3)})`,
        c1: `rgba(140, 14, 16, ${(0.1 * mix).toFixed(3)})`
      },
      {
        cx: w * (0.72 + Math.cos(motionTime * 0.065) * 0.12),
        cy: h * (0.6 + Math.sin(motionTime * 0.085) * 0.08),
        r: Math.max(w, h) * 0.52,
        c0: `rgba(245, 96, 18, ${(0.2 * mix).toFixed(3)})`,
        c1: `rgba(175, 36, 12, ${(0.08 * mix).toFixed(3)})`
      },
      {
        cx: w * (0.5 + Math.sin(motionTime * 0.095 + 1.8) * 0.14),
        cy: h * (0.36 + Math.cos(motionTime * 0.07 + 0.9) * 0.07),
        r: Math.max(w, h) * 0.48,
        c0: `rgba(215, 48, 16, ${(0.15 * mix).toFixed(3)})`,
        c1: `rgba(120, 12, 16, ${(0.06 * mix).toFixed(3)})`
      }
    ];

    for (let i = 0; i < plumes.length; i++) {
      const p = plumes[i];
      const grad = ctx.createRadialGradient(p.cx, p.cy, 0, p.cx, p.cy, p.r);
      grad.addColorStop(0, p.c0);
      grad.addColorStop(0.55, p.c1);
      grad.addColorStop(1, 'rgba(30, 4, 6, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.restore();
  }

  #drawSpecialEmbers(ctx, w, h, cx, cy, sphereRadius) {
    if (this.fxMode === 'ambient' || this.reducedMotion) return;
    const paletteMap = SPECIAL_MODE_SPRITES[this.fxMode];
    const t = this.elapsed;
    const useHotSprites = this.fxMode === 'hot' && this.hotGlowSprites.length > 0;
    const glowBank = useHotSprites ? this.hotGlowSprites : this.paletteSprites;
    const starBank = useHotSprites ? this.hotStarSprites : this.starSprites;

    for (let i = 0; i < this.embers.length; i++) {
      const e = this.embers[i];
      const spriteIdx = paletteMap ? paletteMap[e.spriteIdx % paletteMap.length] : e.spriteIdx;
      const spr =
        (i % 2 === 0 ? starBank[spriteIdx] : glowBank[spriteIdx]) || glowBank[spriteIdx];
      if (!spr) continue;

      let sx;
      let sy;
      let alpha;

      if (this.fxMode === 'hot') {
        // Pavesas cálidas subiendo suavemente desde el fuego inferior
        const life = (t * e.speed * 0.34 + e.phase) % 1;
        sy = h * (1.02 - life * 0.96);
        sx =
          w * (0.08 + e.xSeed * 0.84) +
          Math.sin(t * 0.42 + e.phase) * (e.sway * (0.6 + life * 0.75));
        alpha = Math.sin(life * Math.PI) * 0.65;
      } else if (this.fxMode === 'event') {
        const life = (t * e.speed * 0.95 + e.phase) % 1;
        const ang = e.xSeed * Math.PI * 2 + t * 0.28;
        const dist = sphereRadius * (0.3 + life * 1.55);
        sx = cx + Math.cos(ang) * dist;
        sy = cy + Math.sin(ang) * dist * 0.82;
        alpha = Math.sin(life * Math.PI) * 0.72;
      } else if (this.fxMode === 'duel') {
        const side = i % 2 === 0 ? -1 : 1;
        const life = (t * e.speed * 1.35 + e.phase) % 1;
        sx = cx + side * w * 0.44 * (1 - life);
        sy = cy + Math.sin(t * 2.1 + e.phase) * (sphereRadius * 0.65);
        alpha = Math.sin(life * Math.PI) * 0.7;
      } else {
        const life = (t * e.speed * 0.9 + e.phase) % 1;
        const ang = life * Math.PI * 4.2 + e.xSeed * Math.PI * 2;
        const rad = sphereRadius * (0.65 + Math.sin(life * Math.PI) * 0.9);
        sx = cx + Math.cos(ang) * rad;
        sy = cy + Math.sin(ang) * rad * 0.55 - (life - 0.5) * h * 0.28;
        alpha = Math.sin(life * Math.PI) * 0.68;
      }

      if (alpha <= 0.03) continue;
      const d = e.size * 2.5;
      ctx.globalAlpha = alpha;
      ctx.drawImage(spr, sx - d * 0.5, sy - d * 0.5, d, d);
    }
  }

  #handleResize() {
    if (!this.canvas || !this.ctx) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    this.canvas.width = Math.max(1, Math.round(this.width * this.dpr));
    this.canvas.height = Math.max(1, Math.round(this.height * this.dpr));
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // Repintar inmediatamente para evitar parpadeo transparente tras rotacion o resize
    if (this.initialized && !this.disposed) {
      this.#drawScene(0);
    }
  }

  #renderFrame = (now) => {
    if (this.disposed || !this.ctx) return;
    this.rafId = requestAnimationFrame(this.#renderFrame);

    if (document.hidden) return;

    const rawDt = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;
    const dt = Math.min(0.05, Math.max(0.001, rawDt));
    this.#drawScene(dt);
  };

  #drawScene(dt = 0) {
    if (this.disposed || !this.ctx) return;

    if (dt > 0) {
      const fxBoost = this.fxMode === 'ambient' || this.fxMode === 'hot' ? 0 : 0.42;
      const speedFactor = this.reducedMotion ? 0.15 : 1 + fxBoost + this.spinBurst * 1.1;
      this.elapsed += dt * speedFactor;

      this.pulseEnergy *= Math.pow(0.08, dt);
      this.spinBurst *= Math.pow(0.1, dt);

      const targetHot = this.fxMode === 'hot' ? 1 : 0;
      this.hotMix += (targetHot - this.hotMix) * Math.min(1, dt * 2.4);

      const lerpT = Math.min(1, dt * 4.8);
      this.currentRgb.r += (this.targetRgb.r - this.currentRgb.r) * lerpT;
      this.currentRgb.g += (this.targetRgb.g - this.currentRgb.g) * lerpT;
      this.currentRgb.b += (this.targetRgb.b - this.currentRgb.b) * lerpT;

      this.pointer.x += (this.pointer.targetX - this.pointer.x) * Math.min(1, dt * 6);
      this.pointer.y += (this.pointer.targetY - this.pointer.y) * Math.min(1, dt * 6);
    }

    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    ctx.clearRect(0, 0, w, h);

    const t = this.elapsed;
    const minDim = Math.min(w, h);
    const modeRadiusBoost = this.reducedMotion ? 1 : 1 + Math.sin(t * 0.72) * 0.024;

    const sphereRadius =
      Math.max(120, Math.min(270, minDim * 0.34)) *
      (1 + this.pulseEnergy * 0.06) *
      modeRadiusBoost;
    const floatY = this.reducedMotion ? 0 : Math.sin(t * 0.65) * Math.min(10, h * 0.013);
    const cx = w * 0.5 + this.pointer.x * Math.min(28, w * 0.04);
    const cy = h * 0.46 + floatY - this.pointer.y * Math.min(24, h * 0.04);

    if (this.hotMix > 0.01) {
      this.#drawHotFireBackdrop(ctx, w, h, t, this.hotMix);
    }

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    this.#updateAuraSprite(
      Math.round(this.currentRgb.r),
      Math.round(this.currentRgb.g),
      Math.round(this.currentRgb.b)
    );
    const auraR = sphereRadius * (1.3 + (this.fxMode !== 'ambient' ? 0.12 : 0));
    const activeAura = this.fxMode === 'hot' && this.hotAuraCanvas ? this.hotAuraCanvas : this.auraCanvas;
    if (activeAura) {
      ctx.globalAlpha = 0.72;
      ctx.drawImage(activeAura, cx - auraR, cy - auraR, auraR * 2, auraR * 2);
    }

    // Rotaciones independientes para esfera, nucleo, anillos inclinados y bokeh
    const rotY = t * 0.28 + this.pointer.x * 0.35;
    const rotX = Math.sin(t * 0.22) * 0.3 + this.pointer.y * 0.32;
    const sinY = Math.sin(rotY);
    const cosY = Math.cos(rotY);
    const sinX = Math.sin(rotX);
    const cosX = Math.cos(rotX);

    const coreRotY =
      -t * (this.fxMode === 'ambient' || this.fxMode === 'hot' ? 0.42 : 0.92) +
      this.pointer.x * 0.2;
    const sinCY = Math.sin(coreRotY);
    const cosCY = Math.cos(coreRotY);

    const ringSpeed = this.fxMode === 'event' ? 1.15 : this.fxMode === 'duel' ? 0.95 : 0.42;
    const ringARotY = t * ringSpeed;
    const sinRA = Math.sin(ringARotY);
    const cosRA = Math.cos(ringARotY);

    const ringBRotZ = -t * ringSpeed * 0.85;
    const sinRB = Math.sin(ringBRotZ);
    const cosRB = Math.cos(ringBRotZ);

    const bokehRotY = t * 0.075;
    const sinBY = Math.sin(bokehRotY);
    const cosBY = Math.cos(bokehRotY);

    const spriteOverride = SPECIAL_MODE_SPRITES[this.fxMode] || null;
    const fov = 4.2;
    const count = this.particles.length;

    for (let i = 0; i < count; i++) {
      const p = this.particles[i];
      let wave =
        this.reducedMotion || p.amp === 0 ? 1 : 1 + Math.sin(t * 1.65 + p.phase) * p.amp;

      if (!this.reducedMotion && p.kind === 'shell') {
        if (this.fxMode === 'event') {
          wave += Math.sin(t * 4.6 - Math.abs(p.by) * 3.8) * 0.11;
        } else if (this.fxMode === 'intense') {
          wave += Math.sin(t * 3.8 + p.by * 3.5 + p.phase) * 0.1;
        }
      }

      let x = p.bx * wave;
      let y = p.by * wave;
      let z = p.bz * wave;

      if (!this.reducedMotion && p.kind === 'shell') {
        if (this.fxMode === 'hot') {
          // Oscilacion ascendente lenta y serena para modo HOT
          const twist = p.by * 0.65 + Math.sin(t * 0.55) * 0.16;
          const ct = Math.cos(twist);
          const st = Math.sin(twist);
          const nx = x * ct - z * st;
          const nz = x * st + z * ct;
          x = nx;
          z = nz;
        } else if (this.fxMode === 'duel') {
          // Giro bipolar enfrentado entre hemisferio superior e inferior
          const opp = (p.by >= 0 ? 1 : -1) * (t * 0.9);
          const co = Math.cos(opp);
          const so = Math.sin(opp);
          const nx = x * co - z * so;
          const nz = x * so + z * co;
          x = nx;
          z = nz;
        }
      }

      if (p.kind === 'core') {
        const x1 = x * cosCY - z * sinCY;
        const z1 = x * sinCY + z * cosCY;
        x = x1;
        z = z1;
      } else if (p.kind === 'ringA') {
        const x1 = x * cosRA - z * sinRA;
        const z1 = x * sinRA + z * cosRA;
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;
        x = x1;
        y = y2;
        z = z2;
      } else if (p.kind === 'ringB') {
        const x1 = x * cosRB - y * sinRB;
        const y1 = x * sinRB + y * cosRB;
        const rx = x1 * cosY - z * sinY;
        const rz = x1 * sinY + z * cosY;
        x = rx;
        y = y1;
        z = rz;
      } else if (p.kind === 'bokeh') {
        const x1 = x * cosBY - z * sinBY;
        const z1 = x * sinBY + z * cosBY;
        x = x1;
        z = z1;
      } else {
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;
        x = x1;
        y = y2;
        z = z2;
      }

      const depth = fov + z;
      const persp = fov / Math.max(1.2, depth);
      const sx = cx + x * sphereRadius * persp;
      const sy = cy + y * sphereRadius * persp;

      // Brillo continuo sin parpadeos rapidos para evitar vibracion luminica en el fondo
      const depthFade = p.kind === 'bokeh' ? 0.82 : Math.max(0.2, Math.min(0.95, (1.45 - z) * 0.55));
      const specialScale = this.fxMode !== 'ambient' && p.isStar ? 1.24 : 1;
      const boost =
        (p.kind === 'core' ? 1 + this.pulseEnergy * 0.12 : 1 + this.pulseEnergy * 0.08) *
        specialScale;
      const radius = p.size * persp * boost;
      const alpha = Math.min(0.88, p.alpha * depthFade * 0.86);

      const out = this.projected[i];
      out.sx = sx;
      out.sy = sy;
      out.sz = z;
      out.r = radius;
      out.a = alpha;
      out.isStar = p.isStar || (this.fxMode !== 'ambient' && i % 6 === 0);
      out.kind = p.kind;
      out.spriteIdx = spriteOverride
        ? spriteOverride[p.spriteIdx % spriteOverride.length]
        : p.spriteIdx;
    }

    // Painter's algorithm de atras hacia adelante para sensacion real 3D
    this.projected.sort((a, b) => b.sz - a.sz);

    this.#drawAmbientFilaments(ctx, cx, cy, count);

    const useHotBank = this.fxMode === 'hot' && this.hotGlowSprites.length > 0;
    const glowSprites = useHotBank ? this.hotGlowSprites : this.paletteSprites;
    const starSprites = useHotBank ? this.hotStarSprites : this.starSprites;
    for (let i = 0; i < count; i++) {
      const pt = this.projected[i];
      if (pt.a <= 0.02 || pt.r <= 0.2) continue;
      const spr =
        pt.isStar && starSprites[pt.spriteIdx]
          ? starSprites[pt.spriteIdx]
          : glowSprites[pt.spriteIdx];
      if (!spr) continue;
      const d = pt.r * (pt.isStar ? 3.5 : 2.8);
      ctx.globalAlpha = pt.a;
      ctx.drawImage(spr, pt.sx - d * 0.5, pt.sy - d * 0.5, d, d);
    }

    this.#drawSpecialEmbers(ctx, w, h, cx, cy, sphereRadius);
    ctx.restore();
  }
}

export const stage3d = new ParticleSphereStage();
