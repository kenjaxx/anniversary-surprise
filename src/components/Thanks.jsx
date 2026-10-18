import { useState } from 'react';
import { Heart } from 'lucide-react';
import { content, sweetNotes } from '../data/content.js';
import SectionHeading from './SectionHeading.jsx';

export default function Thanks() {
  const [open, setOpen] = useState([]);
  const [note, setNote] = useState('');

  const toggle = index => setOpen(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);

  return (
    <section className="reasons section-wrap" id="reasons">
      <SectionHeading eyebrow="a year of you" title="Things I’m Thankful For" subtitle="Tap a card to open a tiny thank-you." />
      <div className="reasons-grid">
        {content.thanks.map((item, i) => (
          <button
            className={`reason-card ${open.includes(i) ? 'flipped' : ''}`}
            key={item.title}
            onClick={() => toggle(i)}
            aria-expanded={open.includes(i)}
          >
            <span className="reason-icon">{item.icon}</span>
            {open.includes(i)
              ? <><strong>{item.title}</strong><p>{item.text}</p><span className="card-tap">tap to tuck away ♡</span></>
              : <><strong>A little thank-you</strong><span className="card-tap">tap to reveal ♡</span></>}
          </button>
        ))}
      </div>
      <div className="random-note">
        <div>
          <span className="eyebrow">just because</span>
          <p>{note || 'Need a little reminder? There’s one waiting for you.'}</p>
        </div>
        <button className="outline-button" onClick={() => setNote(sweetNotes[Math.floor(Math.random() * sweetNotes.length)])}>
          Tap for a little reminder <Heart size={15} />
        </button>
      </div>
    </section>
  );
}