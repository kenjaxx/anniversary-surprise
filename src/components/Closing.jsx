import { useEffect, useRef, useState } from 'react';
import { Heart } from 'lucide-react';
import { content } from '../data/content.js';
import DatePicker from './DatePicker.jsx';

// A tiny seeded generator, so the decorations are made once and never jump between renders.
const seeded = start => {
  let seed = start;
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
};

// Soft gold sparkles that twinkle in the warm sky.
const SPECKS = (() => {
  const rnd = seeded(11);
  const glyphs = ['✦', '✧'];
  return Array.from({ length: 18 }, (_, i) => ({
    left: 3 + rnd() * 94,
    top: 4 + rnd() * 56,
    size: 9 + Math.round(rnd() * 9),
    dur: 3.4 + rnd() * 3,
    delay: -(rnd() * 6), // negative = each one starts at a different point in its cycle
    glyph: glyphs[i % 2],
  }));
})();

// Petals and hearts that drift down, slowly.
const PETALS = (() => {
  const rnd = seeded(29);
  const glyphs = ['♡', '✿', '♥', '❀'];
  return Array.from({ length: 12 }, (_, i) => ({
    left: 3 + rnd() * 94,
    size: 12 + Math.round(rnd() * 12),
    dur: 17 + rnd() * 12,
    delay: -(rnd() * 24),
    dx: Math.round((rnd() - 0.5) * 90),
    glyph: glyphs[i % glyphs.length],
  }));
})();

const TYPE_MS = 45;      // time per letter
const PAUSE_MS = 190;    // small breath after , . ! ?
const START_MS = 450;    // wait before the first letter
const PICKER_DELAY_MS = 3000; // how long after the note finishes typing the date picker opens

// Types the note letter by letter straight into the DOM (no React re-render per letter = no lag).
function SecretNote({ text }) {
  const liveRef = useRef(null);

  useEffect(() => {
    const el = liveRef.current;
    if (!el) return undefined;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      el.textContent = text;
      el.classList.remove('is-typing');
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
        return;
      }
      timer = setTimeout(tick, ',.!?'.includes(text[i - 1]) ? PAUSE_MS : TYPE_MS);
    };
    timer = setTimeout(tick, START_MS);
    return () => clearTimeout(timer);
  }, [text]);

  return (
    <div className="secret-note">
      {/* the invisible full text keeps the box at its final size, so nothing jumps while typing */}
      <span className="sn-ghost" aria-hidden="true">{text}</span>
      <span className="sn-live is-typing" ref={liveRef} aria-hidden="true" />
      <span className="sr-only">{text}</span>
    </div>
  );
}

// A little bird, drawn as a single line.
function Bird({ className }) {
  return (
    <svg className={`gs-bird ${className}`} viewBox="0 0 24 10" width="26" height="11" aria-hidden="true">
      <path d="M1 7 Q6 0 12 6 Q18 0 23 7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function Closing({ onReplay }) {
  const [secret, setSecret] = useState(false);
  const [picker, setPicker] = useState(false);
  const pickerShown = useRef(false); // the picker opens by itself only once per visit
  const skyRef = useRef(null);

  // The guided tour reveals the secret note, and opens the date picker, at the very end.
  useEffect(() => {
    const onSecret = () => setSecret(true);
    const onPicker = () => { pickerShown.current = true; setPicker(true); };
    const onClosePicker = () => setPicker(false);
    const onReset = () => { setSecret(false); setPicker(false); pickerShown.current = false; };
    window.addEventListener('tour:secret', onSecret);
    window.addEventListener('tour:date-picker', onPicker);
    window.addEventListener('tour:close-all', onClosePicker);
    window.addEventListener('tour:reset', onReset);
    return () => {
      window.removeEventListener('tour:secret', onSecret);
      window.removeEventListener('tour:date-picker', onPicker);
      window.removeEventListener('tour:close-all', onClosePicker);
      window.removeEventListener('tour:reset', onReset);
    };
  }, []);

  // Once the secret note has finished typing, wait a moment, then open the date picker.
  useEffect(() => {
    if (!secret || pickerShown.current) return undefined;
    const typing = START_MS + content.secret.length * TYPE_MS + 700; // 700 = the small pauses after punctuation
    const id = setTimeout(() => {
      if (pickerShown.current) return;
      pickerShown.current = true;
      setPicker(true);
    }, typing + PICKER_DELAY_MS);
    return () => clearTimeout(id);
  }, [secret]);

  // Only animate while the sky is on screen. Off screen, every animation is paused (saves battery and frames).
  useEffect(() => {
    const el = skyRef.current;
    if (!el) return undefined;
    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-live');
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => el.classList.toggle('is-live', entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const replay = () => {
    setSecret(false);
    setPicker(false);
    pickerShown.current = false;
    onReplay();
  };

  return (
    <>
      <section className="final-section golden" id="final">
        {/* "night-sky" is kept in the class list on purpose: the guided tour scrolls to it */}
        <div className="night-sky golden-sky" ref={skyRef}>
          <div className="gs-sun" aria-hidden="true" />

          {SPECKS.map((s, i) => (
            <span
              key={`s${i}`}
              className="gs-speck"
              aria-hidden="true"
              style={{ left: `${s.left}%`, top: `${s.top}%`, fontSize: s.size, '--d': `${s.dur}s`, '--dl': `${s.delay}s` }}
            >
              {s.glyph}
            </span>
          ))}

          {PETALS.map((p, i) => (
            <span
              key={`p${i}`}
              className="gs-petal"
              aria-hidden="true"
              style={{ left: `${p.left}%`, fontSize: p.size, '--dur': `${p.dur}s`, '--dl': `${p.delay}s`, '--dx': `${p.dx}px` }}
            >
              {p.glyph}
            </span>
          ))}

          <Bird className="b1" />
          <Bird className="b2" />
          <Bird className="b3" />

          <div className="final-content">
            <span className="eyebrow">and this is only the beginning</span>
            <p className="handwritten">Here’s to year two.</p>
            <h2>{content.closing}</h2>
            <p className="final-love">I love you. <Heart fill="currentColor" size={22} /></p>

            <div className="secret-slot">
              {secret ? (
                <SecretNote text={content.secret} />
              ) : (
                <button className="light-button" onClick={() => setSecret(true)}>
                  One last little secret <Heart size={15} fill="currentColor" />
                </button>
              )}
            </div>

            {secret && (
              <div className="dp-reopen-wrap">
                <button className="light-button" onClick={() => { pickerShown.current = true; setPicker(true); }}>
                  Plan our next date <Heart size={15} fill="currentColor" />
                </button>
              </div>
            )}

            <button className="replay-button" onClick={replay}>↺ &nbsp; Start our little story again</button>
          </div>

          {/* three rolling hills, from light rose to deep wine */}
          <svg className="sky-hills" viewBox="0 0 680 130" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 70 C110 38 210 82 340 56 S570 36 680 64 L680 130 L0 130 Z" fill="#c9707f" />
            <path d="M0 96 C130 70 250 108 390 84 S600 78 680 90 L680 130 L0 130 Z" fill="#a24662" />
            <path d="M0 116 C160 98 300 120 460 106 S620 102 680 110 L680 130 L0 130 Z" fill="#7a2e45" />
          </svg>

          {/* the two of them, watching the sun go down */}
          <div className="sky-couple" aria-hidden="true">
            <span className="sky-couple-heart">♥</span>
            <svg viewBox="0 0 60 42" width="64" height="45">
              <ellipse cx="30" cy="30" rx="26" ry="14" fill="#4a1a2c" />
              <circle cx="22" cy="14" r="8" fill="#4a1a2c" />
              <circle cx="38" cy="14" r="8" fill="#4a1a2c" />
            </svg>
          </div>
        </div>

        <footer>made with a little extra love <Heart size={12} fill="currentColor" /> for {content.partnerNickname}</footer>
      </section>

      {/* Rendered through a portal, so it sits above everything (including the tour bar) */}
      <DatePicker open={picker} onClose={() => setPicker(false)} />
    </>
  );
}