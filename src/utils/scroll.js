const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Very gentle start and finish.
const easeInOutSine = t => -(Math.cos(Math.PI * t) - 1) / 2;

let active = null;

function stopActive() {
  if (!active) return;
  cancelAnimationFrame(active.frame);
  active.cleanup();
  active = null;
}

export function scrollToY(targetY, { duration } = {}) {
  stopActive();

  const startY = window.scrollY;
  const maxY = document.documentElement.scrollHeight - window.innerHeight;
  const to = Math.max(0, Math.min(targetY, maxY));
  const distance = to - startY;
  if (Math.abs(distance) < 2) return;

  if (prefersReducedMotion()) {
    window.scrollTo(0, to);
    return;
  }

  // Longer distance = longer, calmer glide (between 1.0s and 2.4s).
  const ms = duration ?? Math.min(2400, Math.max(1000, 700 + Math.abs(distance) * 0.45));
  const t0 = performance.now();

  // If she touches, scrolls or presses a key, give control back right away.
  const interrupts = ['wheel', 'touchstart', 'mousedown', 'keydown'];
  const cancel = () => stopActive();
  interrupts.forEach(e => window.addEventListener(e, cancel, { passive: true }));

  const state = {
    frame: 0,
    cleanup: () => interrupts.forEach(e => window.removeEventListener(e, cancel)),
  };
  active = state;

  const step = now => {
    const p = Math.min(1, (now - t0) / ms);
    window.scrollTo(0, startY + distance * easeInOutSine(p));
    if (p < 1) state.frame = requestAnimationFrame(step);
    else stopActive();
  };
  state.frame = requestAnimationFrame(step);
}

export function scrollToElement(el, { block = 'start', duration } = {}) {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  let y = window.scrollY + rect.top;
  if (block === 'center') y -= (window.innerHeight - rect.height) / 2;
  else y -= pad;
  scrollToY(y, { duration });
}

// Same call as before, so Topbar, Celebration and Closing need no changes.
export function scrollTo(id, opts) {
  scrollToElement(document.getElementById(id), opts);
}