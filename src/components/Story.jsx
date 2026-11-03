import { useEffect, useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import { content, photoFallbacks } from '../data/content.js';
import SectionHeading from './SectionHeading.jsx';
import DriftWall from './DriftWall.jsx';
import MemoryModal from './MemoryModal.jsx';
import AllMemories from './AllMemories.jsx';

const items = content.moments.map((m, i) => ({
  image: m.photo,
  title: m.title,
  date: m.date,
  caption: m.caption,
  fallback: photoFallbacks[i % photoFallbacks.length],
}));

function useIsSmall(breakpoint = 640) {
  const [small, setSmall] = useState(() => window.innerWidth < breakpoint);
  useEffect(() => {
    const onResize = () => setSmall(window.innerWidth < breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return small;
}

export default function Story() {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const small = useIsSmall();

  const openItem = item => {
    const i = items.indexOf(item);
    if (i !== -1) setSelectedIndex(i);
  };
  const step = delta => setSelectedIndex(prev => (prev + delta + items.length) % items.length);

  return (
    <>
      <section className="story section-wrap" id="story">
        <SectionHeading
          eyebrow="the chapters that made us"
          title="Our Little Love Story"
          subtitle="A few moments from this year I want to keep close."
        />

        {/* .wall-bleed lets the wall be wider than the normal content column */}
        <div className="wall-bleed">
          <div className="wall-stage reveal" style={{ height: small ? 540 : 720 }}>
            <DriftWall
              items={items}
              columns={small ? 3 : 5}
              tileWidth={small ? 170 : 300}
              tileHeight={small ? 126 : 200}
              gap={small ? 14 : 20}
              radius={small ? 12 : 16}
              tilt={small ? 12 : 16}
              turn={small ? -10 : -14}
              perspective={1200}
              depth={small ? 70 : 100}
              speed={small ? 30 : 40}
              lift={small ? 44 : 72}
              fade={0.5}
              dim={0.72}
              overlayColor="#2a1420"
              onSelect={openItem}
            />
            <p className="wall-hint">{small ? 'tap a photo' : 'hover to pause · click to open'} ♡</p>
          </div>
        </div>

        <div className="wall-actions">
          <button className="outline-button" onClick={() => setShowAll(true)}>
            <LayoutGrid size={15} /> View all photos
          </button>
        </div>

        <p className="section-footnote">Every little moment belongs in our story. <span>♡</span></p>
      </section>

      {/* Rendered outside the .reveal wrapper: a transformed parent would break position:fixed */}
      {showAll && (
        <AllMemories
          items={items}
          onSelect={i => setSelectedIndex(i)}
          onClose={() => setShowAll(false)}
          escapeDisabled={selectedIndex !== null}
        />
      )}
      {selectedIndex !== null && (
        <MemoryModal
          item={items[selectedIndex]}
          onClose={() => setSelectedIndex(null)}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
        />
      )}
    </>
  );
}