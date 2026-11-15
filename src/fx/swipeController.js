/**
 * Controlador tactil y de mouse (Pointer Events + Web Animations API nativo, sin dependencias)
 * para deslizar cartas hacia izquierda (Pasar) o derecha (Hecho).
 */
export function attachCardSwipe(
  cardEl,
  {
    onSwipeLeft,
    onSwipeRight,
    canSwipeLeft = true,
    canSwipeRight = true,
    onBlockedSwipe = null,
    onDragProgress = null,
    onDragEnd = null
  } = {}
) {
  if (!cardEl) return () => {};

  const stageEl = cardEl.closest('.swipe-card-stage') || cardEl.parentElement;
  const badgeLeft = cardEl.querySelector('.swipe-stamp-left');
  const badgeRight = cardEl.querySelector('.swipe-stamp-right');

  let dragging = false;
  let locked = false;
  let activePointerId = null;
  let startX = 0;
  let startY = 0;
  let dx = 0;
  let dy = 0;
  let pendingRaf = null;
  let latestHoverPoint = null;

  const abortController = new AbortController();
  const { signal } = abortController;

  const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

  const setReflection = (nx = 0, ny = -0.25, intensity = 0.58) => {
    const safeNx = clamp(nx, -1, 1);
    const safeNy = clamp(ny, -1, 1);
    const tx = clamp(safeNx * 40, -42, 42);
    const ty = clamp(safeNy * 30, -34, 34);
    const rot = -28 + safeNx * 24 - safeNy * 14;
    const gx = clamp(50 + safeNx * 42, 6, 94);
    const gy = clamp(42 + safeNy * 38, 6, 94);
    const bgPosX = clamp(50 - safeNx * 34, 8, 92);
    const bgPosY = clamp(50 - safeNy * 34, 8, 92);
    const angle = Math.round(132 + safeNx * 52 - safeNy * 26);
    cardEl.style.setProperty('--glare-tx', `${tx.toFixed(1)}%`);
    cardEl.style.setProperty('--glare-ty', `${ty.toFixed(1)}%`);
    cardEl.style.setProperty('--glare-rot', `${rot.toFixed(1)}deg`);
    cardEl.style.setProperty('--glare-x', `${gx.toFixed(1)}%`);
    cardEl.style.setProperty('--glare-y', `${gy.toFixed(1)}%`);
    cardEl.style.setProperty('--bg-pos-x', `${bgPosX.toFixed(1)}%`);
    cardEl.style.setProperty('--bg-pos-y', `${bgPosY.toFixed(1)}%`);
    cardEl.style.setProperty('--tilt-px', safeNx.toFixed(3));
    cardEl.style.setProperty('--tilt-py', safeNy.toFixed(3));
    cardEl.style.setProperty('--glare-angle', `${angle}deg`);
    cardEl.style.setProperty('--glare-opacity', String(clamp(intensity, 0.52, 1).toFixed(2)));
  };

  const resetReflection = () => {
    setReflection(0, -0.25, 0.58);
  };

  resetReflection();

  const fadeStamp = (badge, targetOpacity, duration = 180) => {
    if (!badge) return;
    if (typeof badge.animate === 'function') {
      badge.getAnimations?.().forEach((a) => a.cancel());
      badge.animate([{ opacity: Number(badge.style.opacity) || 0 }, { opacity: targetOpacity }], {
        duration,
        easing: 'ease-out',
        fill: 'forwards'
      });
    } else {
      badge.style.opacity = String(targetOpacity);
    }
  };

  const clearPendingRaf = () => {
    if (pendingRaf !== null) {
      cancelAnimationFrame(pendingRaf);
      pendingRaf = null;
    }
  };

  const resetPosition = () => {
    clearPendingRaf();
    dx = 0;
    dy = 0;
    cardEl.classList.remove('is-dragging', 'is-hovering');
    onDragEnd?.();
    resetReflection();

    const currentTransform =
      cardEl.style.transform ||
      'perspective(960px) translate3d(0px, 0px, 0px) rotate(0deg) rotateX(0deg) rotateY(0deg)';
    cardEl.getAnimations?.().forEach((a) => a.cancel());

    if (typeof cardEl.animate === 'function') {
      const anim = cardEl.animate(
        [
          { transform: currentTransform },
          {
            transform:
              'perspective(960px) translate3d(0px, 0px, 0px) rotate(0deg) rotateX(0deg) rotateY(0deg)'
          }
        ],
        {
          duration: 280,
          easing: 'cubic-bezier(0.22, 1.32, 0.36, 1)',
          fill: 'none'
        }
      );
      anim.onfinish = () => {
        cardEl.style.transform = '';
      };
    } else {
      cardEl.style.transform = '';
    }
  };

  const triggerOut = (direction) => {
    clearPendingRaf();
    locked = true;
    cardEl.classList.remove('is-hovering');
    cardEl.classList.add('is-dragging');
    setReflection(direction * 0.95, -0.1, 0.85);
    onDragProgress?.({
      dx: direction * 100,
      progress: 1,
      direction: direction > 0 ? 'right' : 'left',
      isRight: direction > 0,
      isLeft: direction < 0
    });
    const targetX = direction * Math.max(360, window.innerWidth * 0.95);
    const targetY = dy * 0.35 + 18;
    const targetRot = direction * 22;
    const tiltY = direction * 18;
    const currentTransform =
      cardEl.style.transform || 'perspective(960px) translate3d(0px, 0px, 0px) rotate(0deg)';

    cardEl.getAnimations?.().forEach((a) => a.cancel());

    if (typeof cardEl.animate === 'function') {
      cardEl.animate(
        [
          { transform: currentTransform, opacity: 1 },
          {
            transform: `perspective(960px) translate3d(${targetX}px, ${targetY}px, 24px) rotate(${targetRot}deg) rotateY(${tiltY}deg)`,
            opacity: 0
          }
        ],
        {
          duration: 160,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'forwards'
        }
      );
    }

    cardEl.classList.remove('is-dragging', 'is-hovering');
    if (direction < 0) onSwipeLeft?.();
    else onSwipeRight?.();
  };

  const applyDragVisuals = () => {
    if (!dragging || locked) return;
    const isBlockedDir = (dx < 0 && !canSwipeLeft) || (dx > 0 && !canSwipeRight);
    const visualDx = isBlockedDir ? dx * 0.24 : dx;
    const visualDy = dy * 0.22;
    const rotation = visualDx * 0.048;
    const nx = clamp(visualDx / 110, -1, 1);
    const ny = clamp(visualDy / 78, -1, 1);
    const tiltY = (nx * 20).toFixed(2);
    const tiltX = (-ny * 12).toFixed(2);

    cardEl.style.transform = `perspective(880px) translate3d(${visualDx.toFixed(
      1
    )}px, ${visualDy.toFixed(1)}px, 20px) rotate(${rotation.toFixed(
      2
    )}deg) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.03)`;
    setReflection(nx, ny, 0.84 + Math.min(0.16, Math.hypot(nx, ny) * 0.18));

    const threshold = Math.min(105, Math.max(75, window.innerWidth * 0.22));
    const progress = Math.min(1, Math.abs(dx) / threshold);
    onDragProgress?.({
      dx,
      progress,
      direction: dx > 0 ? 'right' : dx < 0 ? 'left' : 'none',
      isRight: dx > 0,
      isLeft: dx < 0
    });
  };

  const applyHoverVisuals = (clientX, clientY) => {
    if (dragging || locked) return;
    const refEl = stageEl || cardEl;
    const rect = refEl.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const px = clamp(((clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
    const py = clamp(((clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
    const tiltX = (-py * 10).toFixed(2);
    const tiltY = (px * 14).toFixed(2);
    cardEl.classList.add('is-hovering');
    cardEl.style.transform = `perspective(880px) translate3d(0px, -3px, 12px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.018)`;
    setReflection(px, py, 0.8 + Math.min(0.2, Math.hypot(px, py) * 0.2));
  };

  const onPointerDown = (e) => {
    if (locked || !e.isPrimary) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (e.target.closest('button, a, input, select, textarea')) return;

    dragging = true;
    activePointerId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    dx = 0;
    dy = 0;

    clearPendingRaf();
    cardEl.classList.remove('is-hovering');
    cardEl.classList.add('is-dragging');
    cardEl.getAnimations?.().forEach((a) => a.cancel());

    const refEl = stageEl || cardEl;
    const rect = refEl.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const px = clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
      const py = clamp(((e.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
      setReflection(px, py, 0.86);
    }

    try {
      cardEl.setPointerCapture(e.pointerId);
    } catch {
      // ignora navegadores que no permiten captura
    }
  };

  const onPointerMove = (e) => {
    if (locked) return;

    if (!dragging) {
      if (e.pointerType === 'mouse') {
        latestHoverPoint = { x: e.clientX, y: e.clientY };
        if (pendingRaf === null) {
          pendingRaf = requestAnimationFrame(() => {
            pendingRaf = null;
            if (latestHoverPoint) applyHoverVisuals(latestHoverPoint.x, latestHoverPoint.y);
          });
        }
      }
      return;
    }

    if (e.pointerId !== activePointerId) return;
    dx = e.clientX - startX;
    dy = e.clientY - startY;
    applyDragVisuals();
  };

  const finishDrag = () => {
    const threshold = Math.min(105, Math.max(75, window.innerWidth * 0.22));
    if (dx > threshold) {
      if (canSwipeRight) {
        triggerOut(1);
      } else {
        resetPosition();
        onBlockedSwipe?.('right');
      }
    } else if (dx < -threshold) {
      if (canSwipeLeft) {
        triggerOut(-1);
      } else {
        resetPosition();
        onBlockedSwipe?.('left');
      }
    } else {
      if ((dx > 45 && !canSwipeRight) || (dx < -45 && !canSwipeLeft)) {
        onBlockedSwipe?.(dx > 0 ? 'right' : 'left');
      }
      resetPosition();
    }
  };

  const onPointerUp = (e) => {
    if (!dragging || locked || e.pointerId !== activePointerId) return;
    dragging = false;
    activePointerId = null;
    try {
      if (cardEl.hasPointerCapture?.(e.pointerId)) {
        cardEl.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }
    finishDrag();
  };

  const onPointerCancel = (e) => {
    if (!dragging || e.pointerId !== activePointerId) return;
    dragging = false;
    activePointerId = null;
    if (!locked) resetPosition();
  };

  const onPointerLeave = (e) => {
    if (dragging || locked || e.pointerType !== 'mouse') return;
    resetPosition();
  };

  // Respaldo tactil para evitar que navegadores moviles cancelen el gesto horizontal
  const onTouchMove = (e) => {
    if (!dragging || locked || !e.touches?.length) return;
    if (e.cancelable) e.preventDefault();
  };

  cardEl.addEventListener('pointerdown', onPointerDown, { signal });
  cardEl.addEventListener('pointermove', onPointerMove, { signal });
  cardEl.addEventListener('pointerup', onPointerUp, { signal });
  cardEl.addEventListener('pointercancel', onPointerCancel, { signal });
  cardEl.addEventListener('pointerleave', onPointerLeave, { signal });
  cardEl.addEventListener('touchmove', onTouchMove, { signal, passive: false });

  return () => {
    clearPendingRaf();
    cardEl.classList.remove('is-dragging', 'is-hovering');
    abortController.abort();
  };
}
