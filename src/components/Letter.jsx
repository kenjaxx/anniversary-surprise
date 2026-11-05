import { useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { content } from '../data/content.js';
import SectionHeading from './SectionHeading.jsx';

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1); // 0 -> 1 between a and b
const ease = x => x * x * (3 - 2 * x);                    // soft start and finish

const LIFT_SHADOW = '0 22px 40px -26px rgba(122,60,60,.55)';

// "My Love, Ehrica" -> "Ehrica", so the letter says "My dearest Ehrica," (not "My dearest My Love, Ehrica,").
const NAME = content.partnerNickname.replace(/^\s*my love\s*,?\s*/i, '').trim() || content.partnerNickname;

// Little pressed flowers for the corners.
const Flowers = ({ corners }) => (
  <>
    {corners.includes('tl') && <span className="tf-fl tl" aria-hidden="true">✿</span>}
    {corners.includes('tr') && <span className="tf-fl tr" aria-hidden="true">❀</span>}
    {corners.includes('bl') && <span className="tf-fl bl" aria-hidden="true">❀</span>}
    {corners.includes('br') && <span className="tf-fl br" aria-hidden="true">✿</span>}
  </>
);

// The letter text. It is drawn three times (once per panel); each panel shows its own third.
function LetterText() {
  return (
    <div className="tf-text">
      <p className="tf-salutation">My dearest {NAME},</p>
      <p className="tf-orn" aria-hidden="true">✿ ♡ ✿</p>
      {content.letter.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
      <p className="tf-signature">
        Forever yours,<br />{content.senderName} <Heart size={18} fill="currentColor" />
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// THE TRI-FOLD LETTER
// The page scroll drives everything. `p` goes from 0 to 1 while the pinned letter is on screen:
//   0.02 - 0.13  unfolds (top panel first, then the bottom one)
//   0.13 - 0.88  the open sheet is read: the text glides up through it
//   0.88 - 0.99  folds shut again (bottom panel first, then the top one)
// If you change READ, also change letterOpenAt / letterReadEnd in data/tour.js.
// ---------------------------------------------------------------------------------------------
const OPEN_TOP = [0.02, 0.08];
const OPEN_BOTTOM = [0.06, 0.13];
const READ = [0.13, 0.88];
const CLOSE_BOTTOM = [0.88, 0.94];
const CLOSE_TOP = [0.93, 0.99];

function TriFold() {
  const trackRef = useRef(null);
  const stickyRef = useRef(null);
  const stageRef = useRef(null);
  const glowRef = useRef(null);
  const hintRef = useRef(null);
  const coverRef = useRef(null);
  const panels = useRef([]);
  const wins = useRef([]);
  const texts = useRef([]);
  const shades = useRef([]);

  useEffect(() => {
    const track = trackRef.current;
    const sticky = stickyRef.current;
    const stage = stageRef.current;
    const glow = glowRef.current;
    const hint = hintRef.current;
    const cover = coverRef.current;
    if (!track || !sticky || !stage) return undefined;

    const m = { top: 86, pw: 520, ph: 200, maxOff: 0 };

    // sizes: the sheet is one panel wide x one panel tall when folded, and three panels tall when open
    const layout = () => {
      m.top = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 86;
      track.style.setProperty('--tf-top', `${m.top}px`);

      const sw = stage.clientWidth;
      const sh = stage.clientHeight;
      m.pw = Math.max(240, Math.min(540, sw - 24));
      // whole pixels only, so the panels meet exactly (no hairline between them)
      m.ph = Math.round(Math.max(110, Math.min((sh - 64) / 3, 250)));
      // wider side margins, so the text never touches the corner flowers
      const pad = Math.round(Math.min(50, Math.max(34, m.pw * 0.09)));

      stage.style.setProperty('--pw', `${m.pw}px`);
      stage.style.setProperty('--ph', `${m.ph}px`);
      stage.style.setProperty('--pad', `${pad}px`);
      stage.style.setProperty('--fs', m.pw < 430 ? '14.5px' : '16px');

      // how far the text has to travel so its last line ends up at the bottom of the open sheet
      m.maxOff = Math.max(0, texts.current[0].offsetHeight - 3 * m.ph);
    };

    const paint = p => {
      const a = ease(seg(p, OPEN_TOP[0], OPEN_TOP[1])) * (1 - ease(seg(p, CLOSE_TOP[0], CLOSE_TOP[1]))); // top panel
      const c = ease(seg(p, OPEN_BOTTOM[0], OPEN_BOTTOM[1])) * (1 - ease(seg(p, CLOSE_BOTTOM[0], CLOSE_BOTTOM[1]))); // bottom panel
      const persp = m.pw * 2.4;

      // top panel hinges on its bottom edge, bottom panel on its top edge
      panels.current[0].style.transform = a > 0.999 ? 'none' : `perspective(${persp}px) rotateX(${-180 * (1 - a)}deg)`;
      panels.current[2].style.transform = c > 0.999 ? 'none' : `perspective(${persp}px) rotateX(${180 * (1 - c)}deg)`;

      // the drop shadow only exists while the letter is folded or folding: the open sheet is one clean page
      panels.current[0].style.boxShadow = a > 0.999 ? 'none' : LIFT_SHADOW;
      panels.current[2].style.boxShadow = c > 0.999 ? 'none' : LIFT_SHADOW;

      // once a panel has swung past halfway you see its back: blank paper (the top one shows the cover)
      wins.current[0].style.visibility = a >= 0.5 ? 'visible' : 'hidden';
      wins.current[2].style.visibility = c >= 0.5 ? 'visible' : 'hidden';
      cover.style.visibility = a < 0.5 ? 'visible' : 'hidden';

      // a little shade while a panel is mid-fold
      shades.current[0].style.opacity = (Math.sin(Math.PI * a) * 0.28).toFixed(3);
      shades.current[2].style.opacity = (Math.sin(Math.PI * c) * 0.28).toFixed(3);

      glow.style.opacity = (0.3 + 0.7 * ((a + c) / 2)).toFixed(3);
      hint.style.opacity = (1 - seg(p, 0, 0.03)).toFixed(3);

      // reading: every panel shows its own third of the same long text, all moved together
      const off = m.maxOff * seg(p, READ[0], READ[1]);
      texts.current.forEach((el, i) => {
        if (el) el.style.transform = `translate3d(0,${(-(i * m.ph + off)).toFixed(1)}px,0)`;
      });
    };

    // scroll position -> p, with a soft glide so it never feels jumpy
    let cur = 0;
    let target = 0;
    let raf = 0;

    const readTarget = () => {
      const r = track.getBoundingClientRect();
      const total = r.height - sticky.offsetHeight;
      target = total > 0 ? clamp((m.top - r.top) / total, 0, 1) : 0;
    };
    const loop = () => {
      raf = 0;
      const diff = target - cur;
      cur = Math.abs(diff) < 0.0004 ? target : cur + diff * 0.09;
      paint(cur);
      if (cur !== target) raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      readTarget();
      if (!raf) raf = requestAnimationFrame(loop);
    };

    layout();
    readTarget();
    cur = target;
    paint(cur);

    const ro = new ResizeObserver(() => {
      layout();
      readTarget();
      cur = target;
      paint(cur);
    });
    ro.observe(stage);

    // the text height changes once the web fonts have loaded
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { layout(); kick(); });
    }

    window.addEventListener('scroll', kick, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('scroll', kick);
    };
  }, []);

  return (
    <>
      {/* screen readers get the letter once, as plain text */}
      <div className="sr-only">
        <p>My dearest {NAME},</p>
        {content.letter.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
        <p>Forever yours, {content.senderName}</p>
      </div>

      <div className="tf-track" ref={trackRef}>
        <div className="tf-sticky" ref={stickyRef}>
          <div className="tf-stage" ref={stageRef} aria-hidden="true">
            <div className="tf-glow" ref={glowRef} />

            <div className="tf-sheet">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className={`tf-panel tf-panel-${i}`}
                  ref={el => { panels.current[i] = el; }}
                >
                  <div className="tf-win" ref={el => { wins.current[i] = el; }}>
                    <div className="tf-text-wrap" ref={el => { texts.current[i] = el; }}>
                      <LetterText />
                    </div>
                    {/* flowers sit in the outer corners of the whole open sheet */}
                    {i === 0 && <Flowers corners={['tl', 'tr']} />}
                    {i === 2 && <Flowers corners={['bl', 'br']} />}
                  </div>
                  <span className="tf-shade" ref={el => { shades.current[i] = el; }} />

                  {/* the cover is printed on the BACK of the top panel, so it shows while the letter is folded */}
                  {i === 0 && (
                    <div className="tf-cover" ref={coverRef}>
                      <Flowers corners={['tl', 'tr', 'bl', 'br']} />
                      <span className="tf-seal"><Heart size={20} fill="currentColor" /></span>
                      <h3>A note for {NAME}</h3>
                      <p>Written with all my love, and meant only for you.</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p className="tf-hint" ref={hintRef}>scroll slowly to open it ♡</p>
          </div>
        </div>
      </div>
    </>
  );
}

// For people who prefer reduced motion: the letter is simply open, no pinning, no folding.
function StaticLetter() {
  return (
    <div className="letter-paper reveal">
      <Flowers corners={['tl', 'tr', 'bl', 'br']} />
      <div className="letter-content">
        <p className="handwritten salutation">My dearest {NAME},</p>
        <p className="tf-orn" aria-hidden="true">✿ ♡ ✿</p>
        {content.letter.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
        <p className="handwritten signature">
          Forever yours,<br />{content.senderName} <Heart size={18} fill="currentColor" />
        </p>
      </div>
    </div>
  );
}

export default function Letter() {
  const reduce = useReducedMotion();

  return (
    <section className="letter-section section-wrap" id="letter">
      <SectionHeading
        eyebrow="from my heart to yours"
        title="A Little Thank-You Letter"
        subtitle="Some things deserve more than a text."
      />
      {reduce ? <StaticLetter /> : <TriFold />}
    </section>
  );
}