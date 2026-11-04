import { useEffect, useRef, useState } from 'react';
import { Heart, Moon } from 'lucide-react';
import { content } from '../data/content.js';
import DatePicker from './DatePicker.jsx';

// A fixed set of stars, generated once (not on every render) from a tiny seeded generator.
const STARS = (() => {
  let seed = 11;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const glyphs = ['✦', '✧'];
  return Array.from({ length: 20 }, (_, i) => ({
    left: 3 + rnd() * 94,
    top: 3 + rnd() * 55,
    size: 9 + Math.round(rnd() * 9),
    dur: 3.2 + rnd() * 3,
    delay: -(rnd() * 6), // negative = each star starts at a different point in its cycle
    glyph: glyphs[i % 2],
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

  // Only animate while the night sky is on screen. Off screen, every animation is paused (saves battery and frames).
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
      <section className="final-section" id="final">
        <div className="night-sky" ref={skyRef}>
          <div className="sky-glow" aria-hidden="true" />

          {STARS.map((s, i) => (
            <span
              key={i}
              className="star"
              aria-hidden="true"
              style={{ left: `${s.left}%`, top: `${s.top}%`, fontSize: s.size, '--d': `${s.dur}s`, '--dl': `${s.delay}s` }}
            >
              {s.glyph}
            </span>
          ))}

          <span className="shoot shoot-1" aria-hidden="true" />
          <span className="shoot shoot-2" aria-hidden="true" />

          <div className="sky-moon" aria-hidden="true">
            <Moon size={46} fill="currentColor" strokeWidth={0} />
          </div>

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

          <svg className="sky-hills" viewBox="0 0 680 130" preserveAspectRatio="none" aria-hidden="true">
            <polygon points="0,70 120,40 260,66 420,34 560,60 680,44 680,130 0,130" fill="#4a3452" />
            <polygon points="0,96 150,74 300,98 470,70 620,96 680,84 680,130 0,130" fill="#2c2440" />
            <polygon points="0,116 200,100 400,114 600,98 680,108 680,130 0,130" fill="#1b1830" />
          </svg>

          <div className="sky-couple" aria-hidden="true">
            <span className="sky-couple-heart">♥</span>
            <svg viewBox="0 0 60 42" width="64" height="45">
              <ellipse cx="30" cy="30" rx="26" ry="14" fill="#16132a" />
              <circle cx="22" cy="14" r="8" fill="#16132a" />
              <circle cx="38" cy="14" r="8" fill="#16132a" />
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