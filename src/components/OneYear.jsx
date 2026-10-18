import { Heart } from 'lucide-react';
import { content } from '../data/content.js';
import TimeTogether from './TimeTogether.jsx';

export default function OneYear({ onCelebrate }) {
  return (
    <section className="invitation section-wrap" id="together">
      <div className="invitation-card reveal">
        <div className="card-sparkle">✧</div>
        <span className="eyebrow">our first anniversary</span>
        <div className="heart-bloom">♥</div>
        <h2>Hey, my love<span>...</span></h2>
        <p className="muted">Look how far we’ve come.</p>
        <h3>{content.headline}</h3>
        <TimeTogether start={content.startDate} anniversary={content.anniversaryDate} />
        <button className="yes-button" onClick={onCelebrate}>Celebrate us <Heart size={16} fill="currentColor" /></button>
        <p className="whisper">psst... I’d do this year all over again <span>♡</span></p>
      </div>
    </section>
  );
}