import { useEffect } from 'react';

// Fades in every `.reveal` element when it scrolls into view.
// Pass values that change when new `.reveal` elements appear on the page.
export default function useReveal(deps = []) {
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}