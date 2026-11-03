import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Photo from './Photo.jsx';

export default function MemoryModal({ item, onClose, onPrev, onNext }) {
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

  return (
    <div className="memory-modal" role="dialog" aria-modal="true" aria-label={item.title} onClick={onClose}>
      {onPrev && (
        <button className="memory-modal-arrow left" onClick={e => go(e, onPrev)} aria-label="Previous photo">
          <ChevronLeft size={22} />
        </button>
      )}

      <div className="memory-modal-card" onClick={e => e.stopPropagation()}>
        <button className="memory-modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        <Photo src={item.image} fallback={item.fallback} alt={item.title} />
        <div className="memory-modal-body">
          {item.date && <span className="memory-modal-date">{item.date}</span>}
          <h3>{item.title}</h3>
          {item.caption && <p>{item.caption}</p>}
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