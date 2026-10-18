import { useState } from 'react';
import { Heart } from 'lucide-react';
import { content } from '../data/content.js';

export default function Closing({ onReplay }) {
  const [secret, setSecret] = useState(false);

  const replay = () => { setSecret(false); onReplay(); };

  return (
    <section className="final-section" id="final">
      <div className="night-sky">
        <span className="star star-1">✦</span><span className="star star-2">✧</span><span className="star star-3">✦</span><span className="star star-4">✧</span><span className="star star-5">✦</span>
        <div className="final-content">
          <span className="eyebrow">and this is only the beginning</span>
          <p className="handwritten">Here’s to year two.</p>
          <h2>{content.closing}</h2>
          <p className="final-love">I love you. <Heart fill="currentColor" size={22} /></p>
          <button className="light-button" onClick={() => setSecret(s => !s)}>
            {secret ? 'Your secret is safe with me ♡' : 'One last little secret'} <Heart size={15} fill="currentColor" />
          </button>
          {secret && <div className="secret-note">{content.secret}</div>}
          <button className="replay-button" onClick={replay}>↺ &nbsp; Start our little story again</button>
        </div>
        <div className="silhouette"><span>♥</span></div>
        <div className="night-hills" />
      </div>
      <footer>made with a little extra love <Heart size={12} fill="currentColor" /> for {content.partnerNickname}</footer>
    </section>
  );
}