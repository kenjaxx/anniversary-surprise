import { ArrowRight } from 'lucide-react';
import { content } from '../data/content.js';
import { scrollTo } from '../utils/scroll.js';

export default function Celebration() {
  return (
    <section className="celebration section-wrap" id="celebration">
      <div className="celebration-card reveal visible">
        <div className="floating-hearts">♥　♡　♥</div>
        <div className="big-heart">♥</div>
        <span className="eyebrow">happy anniversary</span>
        <h2>Happy 1 Year! 🥹❤️</h2>
        <h3>{content.celebrateMessage}</h3>
        <p>Scroll down. I have a few more things I want you to know.</p>
        <button className="primary-button" onClick={() => scrollTo('story')}>Our story so far <ArrowRight size={16} /></button>
      </div>
    </section>
  );
}