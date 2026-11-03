import { useEffect } from 'react';

// Softly reveals every `.reveal` element as it scrolls into view.
// Elements that arrive at the same moment appear one after another.
// Pass values that change when new `.reveal` elements appear on the page.
export default function useReveal(deps = []) {
  useEffect(() => {
    const targets = document.querySelectorAll('.reveal:not(.visible)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce || !('IntersectionObserver' in window)) {
      targets.forEach(el => el.classList.add('visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      entries => {
        let n = 0;
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.style.setProperty('--delay', `${n * 140}ms`);
          n += 1;
          observer.unobserve(el);
          requestAnimationFrame(() => el.classList.add('visible'));
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );

    targets.forEach(el => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}