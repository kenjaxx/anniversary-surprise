import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { content } from '../data/content.js';

// How long the whole gate takes after her tap, until it is gone (matches gate.css):
// seal pop + cover opens + a moment to read "Hi my Love" + the card lifts away with petals + the gate fades.
// App.jsx imports this, so the text and the tree always start after the gate has really left.
export const GATE_CLOSE_MS = 5500;
export const GATE_REDUCED_MS = 350; // for people who prefer reduced motion

// Soft gold specks, generated once from a tiny seeded generator.
const DUST = (() => {
  let seed = 5;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: 14 }, () => ({
    left: 8 + rnd() * 84,
    size: 3 + rnd() * 5,
    dur: 9 + rnd() * 7,
    delay: -(rnd() * 14),
    drift: (rnd() - 0.5) * 70,
  }));
})();

// The petals that rise from the card when it closes. Generated once, so they never jump between renders.
// ox / oy = where they start, as a fraction of the card width, measured from the middle of the card.
const PETALS = (() => {
  let seed = 31;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const glyphs = ['♥', '♡', '✿', '✦'];
  const colors = ['#e0a1a8', '#f0b7c0', '#e9b872', '#d9788a'];
  return Array.from({ length: 26 }, (_, i) => ({
    glyph: glyphs[i % glyphs.length],
    color: colors[(i * 3) % colors.length],
    ox: (rnd() - 0.5) * 0.95,
    oy: -0.3 + rnd() * 0.62,
    size: 12 + Math.round(rnd() * 14),
    dx: Math.round((rnd() - 0.5) * 150),
    dy: -Math.round(120 + rnd() * 190),
    rot: Math.round((rnd() - 0.5) * 220),
    delay: Math.round(rnd() * 600) / 1000,
    dur: Math.round((1.4 + rnd() * 0.3) * 100) / 100,
  }));
})();

// A little rose-gold sprig drawn as line art (used in two corners of the cover).
function Sprig({ className }) {
  return (
    <svg className={`ig-sprig ${className}`} viewBox="0 0 100 100" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
        <path d="M8 92C28 66 52 42 92 10" />
        <path d="M28 70c-8-2-12-8-12-14 8 0 13 6 12 14zM44 54c-8 0-14-5-15-12 8-1 14 4 15 12zM60 38c-6-3-9-9-8-15 7 2 11 8 8 15zM36 62c4-7 11-9 17-7-1 7-8 10-17 7zM52 46c5-6 12-7 18-4-2 7-9 9-18 4z" />
      </g>
    </svg>
  );
}

// The first screen. Her tap on the seal is the "permission" browsers need, so the music can start with sound.
// The same tap also starts the automatic tour (App.jsx does that inside onEnter).
export default function IntroGate({ onEnter }) {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const tapped = useRef(false);

  // No scrolling behind the gate, and no scrollbar flashing in while it plays.
  // The lock stays until the gate has completely left. The page keeps the width the
  // scrollbar used to take (padding), so nothing jumps sideways when the lock is released.
  useLayoutEffect(() => {
    if (gone) return undefined;
    const html = document.documentElement;
    const body = document.body;
    const prev = { h: html.style.overflow, b: body.style.overflow, p: body.style.paddingRight };
    const barWidth = window.innerWidth - html.clientWidth;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    if (barWidth > 0) body.style.paddingRight = `${barWidth}px`;
    return () => {
      html.style.overflow = prev.h;
      body.style.overflow = prev.b;
      body.style.paddingRight = prev.p;
    };
  }, [gone]);

  useEffect(() => {
    if (!leaving) return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const id = setTimeout(() => setGone(true), reduce ? GATE_REDUCED_MS : GATE_CLOSE_MS);
    return () => clearTimeout(id);
  }, [leaving]);

  const enter = () => {
    if (tapped.current) return;
    tapped.current = true;
    onEnter();          // starts the music and the auto tour, directly inside her tap
    setLeaving(true);
  };

  if (gone) return null;

  return (
    <div className={`ig${leaving ? ' is-leaving' : ''}`} role="dialog" aria-modal="true" aria-label="Welcome">
      <div className="ig-glow" aria-hidden="true" />

      <div className="ig-dust" aria-hidden="true">
        {DUST.map((d, i) => (
          <i
            key={i}
            style={{
              left: `${d.left}%`,
              width: d.size,
              height: d.size,
              animationDuration: `${d.dur}s`,
              animationDelay: `${d.delay}s`,
              '--dx': `${d.drift}px`,
            }}
          />
        ))}
      </div>

      {/* the card lifts away as one piece when the gate closes */}
      <div className="ig-lift">
        <div className="ig-stage">
          <div className="ig-book">
            {/* the inside right page, revealed when the cover opens */}
            <div className="ig-face ig-page">
              <span className="ig-orn" aria-hidden="true">♥</span>
              <h2 className="ig-tt">Hi my Love ♥</h2>
              <p className="ig-nt">don’t scroll.<br />Just sit back and watch.</p>
            </div>

            <div className="ig-cover">
              {/* the front of the card */}
              <div className="ig-face ig-front" onClick={enter}>
                <Sprig className="s1" />
                <Sprig className="s2" />
                <div className="ig-lbl">
                  <span className="ig-eb">for {content.partnerNickname}</span>
                  <h1 className="ig-tt">I made you<br />something.</h1>

                  <div className="ig-sealwrap">
                    <i className="ig-burst" aria-hidden="true" />
                    <button
                      type="button"
                      className="ig-seal"
                      onClick={e => { e.stopPropagation(); enter(); }}
                      autoFocus
                      aria-label="Tap to open"
                    >
                      ♥
                    </button>
                  </div>

                  <span className="ig-cta">Tap to open</span>
                </div>
              </div>

              {/* the inside left page (back of the cover) */}
              <div className="ig-face ig-back">
                <span className="ig-orn" aria-hidden="true">♥</span>
                <p className="ig-nt">One year, kept<br />just for you ♥</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* petals that rise from the card while it closes */}
      <div className="ig-petals" aria-hidden="true">
        {PETALS.map((p, i) => (
          <span
            key={i}
            className="ig-petal"
            style={{
              '--ox': p.ox,
              '--oy': p.oy,
              '--s': `${p.size}px`,
              '--dx': `${p.dx}px`,
              '--dy': `${p.dy}px`,
              '--rot': `${p.rot}deg`,
              '--d': `${p.delay}s`,
              '--dur': `${p.dur}s`,
              '--c': p.color,
            }}
          >
            {p.glyph}
          </span>
        ))}
      </div>

      <p className="ig-sound">
        <Volume2 size={14} aria-hidden="true" /> best with the sound on
      </p>
    </div>
  );
}