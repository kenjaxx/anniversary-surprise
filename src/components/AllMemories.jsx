import { useEffect } from 'react';
import { X } from 'lucide-react';
import Photo from './Photo.jsx';

export default function AllMemories({ items, onSelect, onClose, escapeDisabled }) {
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

  return (
    <div className="all-memories" role="dialog" aria-modal="true" aria-label="All our photos">
      <div className="all-memories-bar">
        <div>
          <span className="all-memories-eyebrow">every little moment</span>
          <h2>All our photos</h2>
        </div>
        <button className="all-memories-close" onClick={onClose} aria-label="Close all photos">
          <X size={20} />
        </button>
      </div>

      <div className="all-memories-grid">
        {items.map((item, i) => (
          <button
            key={item.title + i}
            className="all-memory"
            onClick={() => onSelect(i)}
            aria-label={`Open ${item.title}`}
          >
            <Photo src={item.image} fallback={item.fallback} alt={item.title} />
            <span>{item.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}