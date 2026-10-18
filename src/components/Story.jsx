import { content, photoFallbacks } from '../data/content.js';
import SectionHeading from './SectionHeading.jsx';
import Photo from './Photo.jsx';

export default function Story() {
  return (
    <section className="story section-wrap" id="story">
      <SectionHeading eyebrow="the chapters that made us" title="Our Little Love Story" subtitle="A few moments from this year I want to keep close." />
      <div className="memory-grid">
        {content.memories.map((memory, i) => (
          <article className="memory-card reveal" key={memory.title} style={{ '--delay': `${i * 90}ms` }}>
            <div className={`polaroid tilt-${i % 4}`}>
              <Photo src={memory.photo} fallback={photoFallbacks[i]} alt={memory.title} />
              <span className="photo-heart">♡</span>
            </div>
            <div className="memory-meta"><span>{memory.date}</span><h3>{memory.title}</h3><p>{memory.text}</p></div>
          </article>
        ))}
      </div>
      <p className="section-footnote">Every little moment belongs in our story. <span>♡</span></p>
    </section>
  );
}