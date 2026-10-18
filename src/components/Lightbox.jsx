import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Photo from './Photo.jsx';

export default function Lightbox({ items, index, onChange, onClose }) {
  const item = items[index];
  const go = (e, delta) => { e.stopPropagation(); onChange((index + delta + items.length) % items.length); };

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Close photo"><X /></button>
      <button className="lightbox-arrow left" onClick={e => go(e, -1)} aria-label="Previous photo"><ChevronLeft /></button>
      <Photo src={item.src} fallback={item.fallback} alt={item.caption} />
      <button className="lightbox-arrow right" onClick={e => go(e, 1)} aria-label="Next photo"><ChevronRight /></button>
      <p>{item.caption}</p>
    </div>
  );
}