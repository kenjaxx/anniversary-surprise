import { useEffect } from 'react';
import { X } from 'lucide-react';
import Photo from './Photo.jsx';

export default function MemoryModal({ item, onClose }) {
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="memory-modal" role="dialog" aria-modal="true" aria-label={item.title} onClick={onClose}>
      <div className="memory-modal-card" onClick={e => e.stopPropagation()}>
        <button className="memory-modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        <Photo src={item.image} fallback={item.fallback} alt={item.title} />
        <div className="memory-modal-body">
          {item.date && <span className="memory-modal-date">{item.date}</span>}
          <h3>{item.title}</h3>
          <p>{item.caption}</p>
        </div>
      </div>
    </div>
  );
}