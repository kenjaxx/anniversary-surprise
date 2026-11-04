import { useEffect, useRef } from 'react';

// Types text letter by letter straight into the DOM (no React re-render per letter).
// An invisible copy of the full text keeps the layout from jumping while it is "written".
export default function Typed({ text, run = true, delay = 0, speed = 50, onDone }) {
  const liveRef = useRef(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const el = liveRef.current;
    if (!el) return undefined;

    if (!run) {
      el.textContent = '';
      el.classList.remove('is-typing');
      return undefined;
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      el.textContent = text;
      el.classList.remove('is-typing');
      doneRef.current?.();
      return undefined;
    }

    let i = 0;
    let timer;
    el.textContent = '';
    el.classList.add('is-typing');

    const tick = () => {
      i += 1;
      el.textContent = text.slice(0, i);
      if (i >= text.length) {
        el.classList.remove('is-typing');
        doneRef.current?.();
        return;
      }
      // a small breath after punctuation, like someone writing by hand
      timer = setTimeout(tick, ',.!?'.includes(text[i - 1]) ? speed * 4 : speed);
    };

    timer = setTimeout(tick, delay);
    return () => clearTimeout(timer);
  }, [run, text, delay, speed]);

  return (
    <span className="typed">
      <span className="typed-ghost" aria-hidden="true">{text}</span>
      <span className="typed-live" ref={liveRef} aria-hidden="true" />
      <span className="sr-only">{text}</span>
    </span>
  );
}