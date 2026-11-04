import { useRef } from 'react';
import { Heart } from 'lucide-react';
import { content } from '../data/content.js';
import TimeTogether from './TimeTogether.jsx';

// A few soft petals that drift down inside the card. Generated once from a tiny seeded generator.
const PETALS = (() => {
  let seed = 23;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const glyphs = ['♡', '✿', '♥'];
  return Array.from({ length: 9 }, (_, i) => ({
    left: 4 + rnd() * 90,
    size: 12 + Math.round(rnd() * 10),
    dur: 15 + rnd() * 9,
    delay: -(rnd() * 20), // negative = each petal starts at a different point of its fall
    glyph: glyphs[i % 3],
  }));
})();

export default function OneYear({ onCelebrate }) {
  const cardRef = useRef(null);
  const btnRef = useRef(null);

  // A little burst of hearts from the button (only when she presses it herself).
  const burst = () => {
    const card = cardRef.current;
    const btn = btnRef.current;
    if (!card || !btn) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const c = card.getBoundingClientRect();
    const b = btn.getBoundingClientRect();
    const glyphs = ['♥', '♡', '✦'];

    for (let i = 0; i < 18; i += 1) {
      const s = document.createElement('span');
      s.className = 'anniv-fly';
      s.textContent = glyphs[i % 3];
      s.style.left = `${b.left - c.left + b.width / 2}px`;
      s.style.top = `${b.top - c.top + b.height / 2}px`;
      s.style.fontSize = `${14 + Math.round(Math.random() * 14)}px`;
      s.style.setProperty('--x', `${Math.round((Math.random() - 0.5) * 340)}px`);
      s.style.setProperty('--y', `${-Math.round(90 + Math.random() * 170)}px`);
      card.appendChild(s);
      setTimeout(() => s.remove(), 1700);
    }
  };

  const handleCelebrate = () => {
    burst();
    onCelebrate();
  };

  return (
    <section className="invitation section-wrap" id="together">
      <div className="invitation-card anniv-card reveal" ref={cardRef}>
        {/* soft petals behind the content */}
        <div className="anniv-fx" aria-hidden="true">
          {PETALS.map((p, i) => (
            <i
              key={i}
              data-g={p.glyph}
              style={{
                '--l': `${p.left}%`,
                '--s': `${p.size}px`,
                '--dur': `${p.dur}s`,
                '--dl': `${p.delay}s`,
              }}
            />
          ))}
        </div>

        <div className="card-sparkle" aria-hidden="true">✧</div>

        <div className="anniv-body">
          <span className="eyebrow rise" style={{ '--d': 0 }}>our first anniversary</span>

          <div className="rise" style={{ '--d': 1 }}>
            <div className="heart-bloom">♥</div>
          </div>

          <h2 className="anniv-h2 rise" style={{ '--d': 2 }}>Hey, my love<span>...</span></h2>
          <p className="anniv-sub rise" style={{ '--d': 3 }}>Look how far we’ve come.</p>
          <h3 className="anniv-h3 rise" style={{ '--d': 4 }}>{content.headline}</h3>

          <TimeTogether start={content.startDate} anniversary={content.anniversaryDate} />

          <div className="anniv-cta rise" style={{ '--d': 7 }}>
            <button className="yes-button" ref={btnRef} onClick={handleCelebrate}>
              Celebrate us <Heart size={16} fill="currentColor" />
            </button>
          </div>

          <div className="anniv-whisper rise" style={{ '--d': 8 }}>
            <p className="whisper">psst... I’d do this year all over again <span>♡</span></p>
          </div>
        </div>
      </div>
    </section>
  );
}