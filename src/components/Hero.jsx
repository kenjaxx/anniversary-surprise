import { ArrowRight, Heart } from 'lucide-react';
import { content } from '../data/content.js';

export default function Hero({ opened, onOpen, stageRef }) {
  return (
    <section className="hero section-wrap" id="top">
      <div className="hero-copy reveal">
        <span className="eyebrow"><span className="tiny-heart">♥</span> 1 year, and counting</span>
        <h1>{content.openingLine}</h1>
        <p>I made you a tiny corner of the internet to say thank you for this whole year.</p>
        <button className="primary-button" onClick={onOpen} disabled={opened}>
          {opened ? 'Opening your surprise…' : 'Open your little surprise'} <ArrowRight size={16} />
        </button>
        <div className="handwritten hero-note">made with love, just for you <span>♡</span></div>
      </div>

      <div
        ref={stageRef}
        className={`envelope-stage reveal ${opened ? 'is-open' : ''}`}
        onClick={onOpen}
        role="button"
        tabIndex={0}
        aria-label="Open the love letter"
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}
      >
        <div className="sparkle s1">✦</div><div className="sparkle s2">♡</div>
        <div className="envelope">
          <div className="envelope-back" />
          <div className="letter-peek"><span>Happy 1 year</span><Heart fill="currentColor" size={18} /></div>
          <div className="envelope-flap" />
          <div className="envelope-front" />
          <div className="wax-seal"><Heart fill="currentColor" size={22} /></div>
        </div>
        <span className="envelope-hint">{opened ? 'Your little surprise awaits ↓' : 'tap the envelope to open'}</span>
      </div>

      <div className="hero-flower flower-a">✿</div><div className="hero-flower flower-b">✾</div>
    </section>
  );
}