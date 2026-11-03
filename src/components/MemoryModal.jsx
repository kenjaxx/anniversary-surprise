import { Fragment, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Photo from './Photo.jsx';

const OUT_MS = 420; // how long the old photo takes to dissolve

export default function MemoryModal({ item, total, onClose, onPrev, onNext }) {
  // `shown` lags behind `item` so the old photo can fade out before the new one blooms in.
  const [shown, setShown] = useState(item);
  const [leaving, setLeaving] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (item === shown) { setLeaving(false); return undefined; }
    setLeaving(true);
    timer.current = setTimeout(() => { setShown(item); setLeaving(false); }, OUT_MS);
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onPrev, onNext]);

  const go = (e, fn) => { e.stopPropagation(); fn(); };
  const words = (shown.caption || '').split(/\s+/).filter(Boolean);
  const num = String((shown.index ?? 0) + 1).padStart(2, '0');

  return (
    <div className="memory-modal" role="dialog" aria-modal="true" aria-label={shown.title} onClick={onClose}>
      {onPrev && (
        <button className="memory-modal-arrow left" onClick={e => go(e, onPrev)} aria-label="Previous photo">
          <ChevronLeft size={22} />
        </button>
      )}

      <div className={`memory-modal-card${leaving ? ' is-leaving' : ''}`} onClick={e => e.stopPropagation()}>
        <button className="memory-modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>

        <div className="mm-swap" key={`${shown.index}-${shown.title}`}>
          <div className="mm-stage">
            <Photo className="mm-bg" src={shown.image} fallback={shown.fallback} alt="" />
            <Photo className="mm-fg" src={shown.image} fallback={shown.fallback} alt={shown.title} />
            <span className="mm-count">{num} <i>/</i> {String(total).padStart(2, '0')}</span>
            <span className="mm-float f1" aria-hidden="true">♡</span>
            <span className="mm-float f2" aria-hidden="true">♥</span>
            <span className="mm-float f3" aria-hidden="true">♡</span>
          </div>

          <div className="mm-body">
            {shown.date && <span className="mm-date">{shown.date}</span>}
            <h3>{shown.title}</h3>
            <span className="mm-rule" aria-hidden="true" />
            {words.length > 0 && (
              <p className="mm-caption">
                {words.map((w, i) => (
                  <Fragment key={i}>
                    <span style={{ '--w': i }}>{w}</span>{' '}
                  </Fragment>
                ))}
              </p>
            )}
          </div>
        </div>
      </div>

      {onNext && (
        <button className="memory-modal-arrow right" onClick={e => go(e, onNext)} aria-label="Next photo">
          <ChevronRight size={22} />
        </button>
      )}
    </div>
  );
}