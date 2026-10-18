import { useState } from 'react';
import { Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import { gallery } from '../data/content.js';
import SectionHeading from './SectionHeading.jsx';
import Photo from './Photo.jsx';
import Lightbox from './Lightbox.jsx';

export default function Gallery() {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const step = delta => setIndex(prev => (prev + delta + gallery.length) % gallery.length);
  const current = gallery[index];

  return (
    <>
      <section className="gallery-section section-wrap" id="gallery">
        <SectionHeading eyebrow="little moments, kept forever" title="Our Memories" subtitle="A tiny gallery of our first year." />
        <div className="gallery-frame reveal">
          <div
            className="gallery-feature"
            onClick={() => setLightbox(index)}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter') setLightbox(index); }}
          >
            <Photo src={current.src} fallback={current.fallback} alt={current.caption} />
            <span className="gallery-caption">{current.caption}</span>
            <span className="gallery-zoom"><Camera size={17} /> view memory</span>
          </div>
          <div className="gallery-thumbs">
            {gallery.map((item, i) => (
              <button
                className={`gallery-thumb ${index === i ? 'active' : ''}`}
                key={item.caption}
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
              >
                <Photo src={item.src} fallback={item.fallback} alt="" />
              </button>
            ))}
          </div>
          <div className="gallery-controls">
            <button onClick={() => step(-1)} aria-label="Previous photo"><ChevronLeft size={18} /></button>
            <span>{index + 1} <i>/</i> {gallery.length}</span>
            <button onClick={() => step(1)} aria-label="Next photo"><ChevronRight size={18} /></button>
          </div>
        </div>
      </section>

      {/* Rendered outside .gallery-frame: a transformed parent would break position:fixed */}
      {lightbox !== null && (
        <Lightbox items={gallery} index={lightbox} onChange={setLightbox} onClose={() => setLightbox(null)} />
      )}
    </>
  );
}