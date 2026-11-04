import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, X } from 'lucide-react';
import Photo from './Photo.jsx';

// Each polaroid hangs a little crooked, in a repeating pattern.
const TILTS = [-1.6, 1.1, -0.7, 1.5, -1.2, 0.8];

// How many photos are drawn on each side of the middle one (the rest are not mounted at all).
const VISIBLE = 3;

// How big each step away from the middle is, and how visible it stays.
const SCALE = [1.12, 0.94, 0.84, 0.78];
const FADE = [1, 0.92, 0.6, 0];

const pad = n => String(n).padStart(2, '0');

export default function AllMemories({ items, onSelect, onClose, escapeDisabled, activeIndex }) {
  const n = items.length;
  const [cur, setCur] = useState(activeIndex ?? 0);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const stageRef = useRef(null);
  const drag = useRef(null);
  const suppress = useRef(false);

  const go = useCallback(d => setCur(c => (((c + d) % n) + n) % n), [n]);

  // Measure the stage, so the rope and the photos always fit it.
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The photo shown in the popup (or by the guided tour) is also the one in the middle here.
  useEffect(() => {
    if (activeIndex != null) setCur(activeIndex);
  }, [activeIndex]);

  // Escape closes. Arrow keys move along the line (but not while a photo popup is open on top).
  useEffect(() => {
    const onKey = e => {
      if (escapeDisabled) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, escapeDisabled, go]);

  // Stop the page behind from scrolling while this is open
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);

  // ---------- layout maths ----------
  const { w, h } = size;
  const small = w < 640;
  const cw = small ? w * 0.46 : Math.min(240, w * 0.17);        // polaroid width
  const spacing = cw * (small ? 1.1 : 1.2);                     // distance between polaroids
  const imgMax = Math.max(130, Math.min(300, h * 0.4));         // tallest a photo may be
  const edgeY = h * 0.15;                                       // height of the rope at both edges
  const sag = Math.min(64, h * 0.11);                           // how far the rope droops in the middle
  const ropeY = x => edgeY + sag * (1 - ((x - w / 2) / (w / 2)) ** 2);

  const current = items[cur];

  // Swiping / dragging sideways moves along the line.
  const onPointerDown = e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drag.current = { x: e.clientX };
  };
  const onPointerUp = e => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 50) {
      suppress.current = true;
      setTimeout(() => { suppress.current = false; }, 60);
      go(dx < 0 ? 1 : -1);
    }
  };

  return (
    <div className="all-memories" role="dialog" aria-modal="true" aria-label="All our photos">
      <div className="am-bar">
        <div className="am-bar-title">
          <Heart size={14} fill="currentColor" />
          <span>All our photos</span>
          <em>{n} moments</em>
        </div>
        <button className="am-close" onClick={onClose} aria-label="Close all photos">
          <X size={20} />
        </button>
      </div>

      <div
        className="am-stage"
        ref={stageRef}
        style={{ '--imgmax': `${imgMax}px` }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { drag.current = null; }}
      >
        {w > 0 && (
          <>
            <svg className="am-rope" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
              <path d={`M -20 ${edgeY} Q ${w / 2} ${edgeY + 2 * sag} ${w + 20} ${edgeY}`} />
            </svg>

            {items.map((item, i) => {
              // shortest way round the circle, so the line never has an end
              let off = (i - cur) % n;
              if (off > n / 2) off -= n;
              if (off < -n / 2) off += n;
              const abs = Math.abs(off);
              if (abs > VISIBLE) return null;

              const now = off === 0;
              const xc = w / 2 + off * spacing;
              const y = ropeY(xc) + 8 + (now ? 12 : 0);
              const tilt = TILTS[i % TILTS.length];

              return (
                <button
                  key={item.title + i}
                  type="button"
                  className={`am-card${now ? ' is-now' : ''}`}
                  tabIndex={abs <= 2 ? 0 : -1}
                  aria-label={now ? `Open ${item.title}` : `Show ${item.title}`}
                  aria-current={now ? 'true' : undefined}
                  style={{
                    width: cw,
                    zIndex: 10 - abs,
                    opacity: FADE[abs],
                    transform: `translate3d(${xc - cw / 2}px, ${y}px, 0) rotate(${tilt}deg) scale(${SCALE[abs]})`,
                    '--sd': `${-(i % 5) * 1.3}s`,
                  }}
                  onClick={() => {
                    if (suppress.current) return;
                    if (now) onSelect(i);
                    else setCur(i);
                  }}
                >
                  <span className="am-sway">
                    <span className="am-peg" aria-hidden="true" />
                    <span className="am-polaroid">
                      <span className="am-imgwrap">
                        <Photo className="am-img" src={item.image} fallback={item.fallback} alt={item.title} />
                      </span>
                      <span className="am-label">{item.title}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </>
        )}
      </div>

      <div className="am-foot">
        <div className="am-info" key={cur}>
          {current.date && <span className="am-date">{current.date}</span>}
          <h3>{current.title}</h3>
          {current.caption && <p>{current.caption}</p>}
        </div>

        <div className="am-nav">
          <span className="am-count">{pad(cur + 1)} <i>/</i> {pad(n)}</span>
          <button className="am-arrow" onClick={() => go(-1)} aria-label="Previous photo">
            <ChevronLeft size={20} />
          </button>
          <button className="am-arrow solid" onClick={() => go(1)} aria-label="Next photo">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}