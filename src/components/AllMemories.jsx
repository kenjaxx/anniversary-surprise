import { useEffect, useRef, useState } from 'react';
import { Heart, X } from 'lucide-react';
import Photo from './Photo.jsx';

const TILTS = [-0.8, 0.6, -0.4, 0.9];

// Photos are dealt out row by row, so the numbers read left to right.
function useColumnCount() {
  const calc = () => {
    const w = window.innerWidth;
    return w < 640 ? 2 : w < 1250 ? 3 : 4;
  };
  const [n, setN] = useState(calc);
  useEffect(() => {
    const onResize = () => setN(calc());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return n;
}

export default function AllMemories({ items, onSelect, onClose, escapeDisabled, activeIndex }) {
  const cols = useColumnCount();
  const tiles = useRef([]);

  // Close with Escape (but not while a photo popup is open on top)
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape' && !escapeDisabled) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, escapeDisabled]);

  // Stop the page behind from scrolling while this is open
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);

  // Keep the photo being shown in view behind the popup, so it is right there when the popup closes.
  useEffect(() => {
    if (activeIndex == null) return;
    tiles.current[activeIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeIndex]);

  const columns = Array.from({ length: cols }, () => []);
  items.forEach((item, i) => columns[i % cols].push({ item, i }));

  return (
    <div className="all-memories" role="dialog" aria-modal="true" aria-label="All our photos">
      <div className="am-bar">
        <div className="am-bar-title">
          <Heart size={14} fill="currentColor" />
          <span>All our photos</span>
          <em>{items.length} moments</em>
        </div>
        <button className="am-close" onClick={onClose} aria-label="Close all photos">
          <X size={20} />
        </button>
      </div>

      <header className="am-intro">
        <span className="am-line" aria-hidden="true" />
        <span className="am-eyebrow">every little moment</span>
        <h2>Our year, <em>in full</em></h2>
        <p>Every photo, exactly as it was taken. Nothing cropped, nothing left out.</p>
      </header>

      <div className="am-grid">
        {columns.map((col, c) => (
          <div className="am-col" key={c}>
            {col.map(({ item, i }) => (
              <button
                key={item.title + i}
                ref={el => { tiles.current[i] = el; }}
                className={`am-tile${activeIndex === i ? ' is-now' : ''}`}
                style={{ '--i': i, '--r': `${TILTS[i % TILTS.length]}deg` }}
                onClick={() => onSelect(i)}
                aria-label={`Open ${item.title}`}
              >
                <span className="am-photo">
                  <Photo src={item.image} fallback={item.fallback} alt={item.title} />
                  <span className="am-num">{String(i + 1).padStart(2, '0')}</span>
                  {item.caption && <span className="am-cap">{item.caption}</span>}
                </span>
                <span className="am-title">{item.title}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      <p className="am-end">That’s all of us, so far <span>♡</span></p>
    </div>
  );
}