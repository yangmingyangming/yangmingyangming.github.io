(function initArtCursor() {
  const canUseFinePointer = window.matchMedia('(pointer: fine)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!canUseFinePointer || prefersReducedMotion) {
    return;
  }

  const root = document.documentElement;
  const body = document.body;

  if (!body) {
    return;
  }

  body.classList.add('has-art-cursor');

  const dot = document.createElement('span');
  dot.className = 'art-cursor-dot';

  const ring = document.createElement('span');
  ring.className = 'art-cursor-ring';

  const glow = document.createElement('span');
  glow.className = 'art-cursor-glow';

  body.append(dot, ring, glow);

  const pos = {
    targetX: window.innerWidth / 2,
    targetY: window.innerHeight / 2,
    dotX: window.innerWidth / 2,
    dotY: window.innerHeight / 2,
    ringX: window.innerWidth / 2,
    ringY: window.innerHeight / 2,
    glowX: window.innerWidth / 2,
    glowY: window.innerHeight / 2
  };

  let isVisible = false;
  let rafId = 0;
  let lastPointerUpdate = 0;

  function setVariable(name, x, y) {
    root.style.setProperty(name + '-x', x.toFixed(2) + 'px');
    root.style.setProperty(name + '-y', y.toFixed(2) + 'px');
  }

  function animate() {
    if (document.visibilityState !== 'visible') {
      rafId = 0;
      return;
    }

    pos.dotX += (pos.targetX - pos.dotX) * 0.34;
    pos.dotY += (pos.targetY - pos.dotY) * 0.34;

    pos.ringX += (pos.targetX - pos.ringX) * 0.24;
    pos.ringY += (pos.targetY - pos.ringY) * 0.24;

    pos.glowX += (pos.targetX - pos.glowX) * 0.15;
    pos.glowY += (pos.targetY - pos.glowY) * 0.15;

    setVariable('--cursor-dot', pos.dotX, pos.dotY);
    setVariable('--cursor-ring', pos.ringX, pos.ringY);
    setVariable('--cursor-glow', pos.glowX, pos.glowY);

    const hasResidualMotion =
      Math.abs(pos.targetX - pos.dotX) > 0.06 ||
      Math.abs(pos.targetY - pos.dotY) > 0.06 ||
      Math.abs(pos.targetX - pos.ringX) > 0.06 ||
      Math.abs(pos.targetY - pos.ringY) > 0.06 ||
      Math.abs(pos.targetX - pos.glowX) > 0.06 ||
      Math.abs(pos.targetY - pos.glowY) > 0.06;
    const recentlyUpdated = performance.now() - lastPointerUpdate < 120;

    if (isVisible && (hasResidualMotion || recentlyUpdated)) {
      rafId = requestAnimationFrame(animate);
      return;
    }

    rafId = 0;
  }

  function ensureAnimation() {
    if (!rafId) {
      rafId = requestAnimationFrame(animate);
    }
  }

  function showCursor() {
    if (isVisible) {
      return;
    }

    isVisible = true;
    body.classList.add('cursor-visible');
  }

  function hideCursor() {
    isVisible = false;
    body.classList.remove('cursor-visible', 'is-cursor-hover', 'is-cursor-press');
  }

  function updateTarget(event) {
    lastPointerUpdate = performance.now();
    pos.targetX = event.clientX;
    pos.targetY = event.clientY;
    showCursor();
    ensureAnimation();
  }

  function onHoverChange(event) {
    const interactive = event.target.closest('a, button, input, textarea, select, label, [role="button"], .project-card, .btn, .toolbar-link');
    body.classList.toggle('is-cursor-hover', Boolean(interactive));
  }

  document.addEventListener('mousemove', updateTarget, { passive: true });
  document.addEventListener('mouseover', onHoverChange, { passive: true });
  document.addEventListener('mousedown', () => body.classList.add('is-cursor-press'));
  document.addEventListener('mouseup', () => body.classList.remove('is-cursor-press'));
  document.addEventListener('mouseleave', hideCursor);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && isVisible) {
      ensureAnimation();
      return;
    }

    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  });
})();
