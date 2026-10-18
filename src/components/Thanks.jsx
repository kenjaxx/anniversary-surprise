import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { content, sweetNotes } from '../data/content.js';
import SectionHeading from './SectionHeading.jsx';
import FlipCard from './FlipCard.jsx';

function useIsSmall(breakpoint = 560) {
  const [small, setSmall] = useState(() => window.innerWidth < breakpoint);
  useEffect(() => {
    const onResize = () => setSmall(window.innerWidth < breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return small;
}

// Front face: your photo. If the file is missing, the gradient + emoji stay visible instead.
function FeelingFront({ item }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="feeling-front" style={{ '--from': item.from, '--to': item.to }}>
      <span className="feeling-glyph" aria-hidden="true">{item.glyph}</span>
      {!failed && <img src={item.photo} alt="" draggable={false} onError={() => setFailed(true)} />}
      <div className="feeling-label">
        <span>{item.word}</span>
        <small>tap to flip ♡</small>
      </div>
    </div>
  );
}

function FeelingBack({ item }) {
  return (
    <div className="feeling-back">
      <span className="feeling-back-heart" aria-hidden="true">♡</span>
      <h3>{item.title}</h3>
      <p>{item.text}</p>
    </div>
  );
}

export default function Thanks() {
  const [note, setNote] = useState('');
  const small = useIsSmall();

  return (
    <section className="reasons section-wrap" id="reasons">
      <SectionHeading
        eyebrow="a year of you"
        title="How You Make Me Feel"
        subtitle="Tap a card to flip it."
      />

      <div className="feelings-grid reveal">
        {content.feelings.map(item => (
          <FlipCard
            key={item.word}
            ariaLabel={`${item.word}. Flip to read why.`}
            front={<FeelingFront item={item} />}
            back={<FeelingBack item={item} />}
            width={small ? 160 : 260}
            height={small ? 240 : 360}
            radius={small ? 18 : 24}
            background="#fff9f2"
            color="#48252b"
            shadowColor="#a35c4d"
            shadowOpacity={0.35}
            glareOpacity={0.28}
            tiltMax={10}
          />
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