import { useState } from 'react';
import { ArrowRight, Heart } from 'lucide-react';
import { content } from '../data/content.js';
import SectionHeading from './SectionHeading.jsx';

export default function Letter() {
  const [show, setShow] = useState(false);

  return (
    <section className="letter-section section-wrap" id="letter">
      <SectionHeading eyebrow="from my heart to yours" title="A Little Thank-You Letter" subtitle="Some things deserve more than a text." />
      <div className="letter-paper reveal">
        <div className="paper-flower">✿</div>
        {!show ? (
          <div className="letter-closed">
            <div className="letter-seal"><Heart fill="currentColor" /></div>
            <h3>A note for {content.partnerNickname}</h3>
            <p>Written with all my love, and meant only for you.</p>
            <button className="primary-button" onClick={() => setShow(true)}>Open your letter <ArrowRight size={16} /></button>
          </div>
        ) : (
          <div className="letter-content">
            <p className="handwritten salutation">My dearest {content.partnerNickname},</p>
            {content.letter.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
            <p className="handwritten signature">Forever yours,<br />{content.senderName} <Heart size={18} fill="currentColor" /></p>
          </div>
        )}
        <div className="paper-stamp">♡</div>
      </div>
    </section>
  );
}