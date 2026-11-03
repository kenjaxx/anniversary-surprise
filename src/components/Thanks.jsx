import { useEffect, useState } from 'react';
import { ArrowRight, Eye, Flame, Heart, ShieldCheck, Sun, Waves } from 'lucide-react';
import { content } from '../data/content.js';
import FlipCard from './FlipCard.jsx';

// Line icons instead of emojis. Matched by the card's "word" in content.js.
const ICONS = {
  Calm: Waves,
  Safe: ShieldCheck,
  Joy: Sun,
  Loved: Heart,
  Wanted: Flame,
  Seen: Eye,
};

function useIsSmall(breakpoint = 560) {
  const [small, setSmall] = useState(() => window.innerWidth < breakpoint);
  useEffect(() => {
    const onResize = () => setSmall(window.innerWidth < breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return small;
}

// Front face: your photo as the full background. If the file is missing, a soft pastel gradient shows.
function FeelingFront({ item, index }) {
  const [failed, setFailed] = useState(false);
  const Icon = ICONS[item.word] || Heart;
  return (
    <div className="feeling-front" style={{ '--from': item.from, '--to': item.to }}>
      {!failed && <img src={item.photo} alt="" draggable={false} onError={() => setFailed(true)} />}
      <i className="feeling-frame" aria-hidden="true" />
      <span className="feeling-num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      <span className="feeling-icon" aria-hidden="true"><Icon size={22} strokeWidth={1.4} /></span>
      <div className="feeling-label">
        <small>You make me feel</small>
        <span>{item.word}</span>
        <em>Turn me over <ArrowRight size={13} strokeWidth={1.8} /></em>
      </div>
    </div>
  );
}

function FeelingBack({ item }) {
  const Icon = ICONS[item.word] || Heart;
  return (
    <div className="feeling-back">
      <i className="feeling-frame" aria-hidden="true" />
      <span className="feeling-back-icon" aria-hidden="true"><Icon size={20} strokeWidth={1.4} /></span>
      <small className="feeling-back-eyebrow">the truth is</small>
      <h3>{item.title}</h3>
      <span className="feeling-rule" aria-hidden="true" />
      <p>{item.text}</p>
    </div>
  );
}

export default function Thanks() {
  const small = useIsSmall();
  // which cards are turned over, by index (the guided tour also flips them)
  const [flipped, setFlipped] = useState({});

  useEffect(() => {
    const onFlip = e => setFlipped(f => ({ ...f, [e.detail.index]: e.detail.value }));
    const onReset = () => setFlipped({});
    window.addEventListener('tour:flip', onFlip);
    window.addEventListener('tour:reset', onReset);
    return () => {
      window.removeEventListener('tour:flip', onFlip);
      window.removeEventListener('tour:reset', onReset);
    };
  }, []);

  return (
    <section className="reasons section-wrap" id="reasons">
      <div className="feelings-head reveal">
        <span className="feelings-line" aria-hidden="true" />
        <span className="eyebrow">a year of you</span>
        <h2>How You Make Me <em>Feel</em></h2>
        <p>Touch a card. I’ll tell you exactly why.</p>
      </div>

      <div className="feelings-grid reveal">
        {content.feelings.map((item, i) => (
          <FlipCard
            key={item.word}
            ariaLabel={`${item.word}. Flip to read why.`}
            front={<FeelingFront item={item} index={i} />}
            back={<FeelingBack item={item} />}
            flipped={!!flipped[i]}
            onFlipChange={v => setFlipped(f => ({ ...f, [i]: v }))}
            width={small ? 160 : 260}
            height={small ? 250 : 380}
            radius={small ? 18 : 22}
            background="#fff3ec"
            color="#48252b"
            shadowColor="#d98a96"
            shadowOpacity={0.35}
            glareOpacity={0.22}
            tiltMax={9}
          />
        ))}
      </div>
    </section>
  );
}