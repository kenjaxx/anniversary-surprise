import { useEffect, useRef } from 'react';

// Returns a ref for the progress bar. Also drives the soft background parallax.
export default function useScrollProgress() {
  const barRef = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bar = barRef.current;
    const layers = Array.from(document.querySelectorAll('[data-parallax]')).map(el => ({
      el,
      speed: parseFloat(el.dataset.parallax) || 0,
    }));

    let target = window.scrollY;
    let current = target;
    let raf = 0;

    const paint = y => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      if (bar) bar.style.transform = `scaleX(${p})`;
      if (!reduce) {
        layers.forEach(({ el, speed }) => {
          el.style.transform = `translate3d(0, ${(y * speed).toFixed(2)}px, 0)`;
        });
      }
    };

    // Glide toward the real scroll position a little each frame (soft lag).
    const tick = () => {
      const diff = target - current;
      if (reduce || Math.abs(diff) < 0.1) {
        current = target;
        paint(current);
        raf = 0;
        return;
      }
      current += diff * 0.1;
      paint(current);
      raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      target = window.scrollY;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    paint(current);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return barRef;
}