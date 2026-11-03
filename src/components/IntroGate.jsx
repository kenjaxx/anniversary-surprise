import { useEffect, useState } from 'react';
import { Heart, Volume2 } from 'lucide-react';
import { content } from '../data/content.js';

const FADE_MS = 950;

// The first screen. Her tap is the "permission" browsers need, so the music can start with sound.
export default function IntroGate({ onEnter }) {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  // No scrolling behind the gate
  useEffect(() => {
    if (leaving) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [leaving]);

  useEffect(() => {
    if (!leaving) return undefined;
    const id = setTimeout(() => setGone(true), FADE_MS);
    return () => clearTimeout(id);
  }, [leaving]);

  const enter = () => {
    if (leaving) return;
    onEnter();          // starts the music, directly inside her tap
    setLeaving(true);
  };

  if (gone) return null;

  return (
    <div className={`intro-gate${leaving ? ' is-leaving' : ''}`} role="dialog" aria-modal="true" aria-label="Welcome">
      <div className="gate-inner">
        <span className="gate-eyebrow">for {content.partnerNickname}</span>
        <h1 className="gate-title">I made you something.</h1>
        <button className="gate-btn" onClick={enter} autoFocus>
          Tap to begin <Heart size={17} fill="currentColor" />
        </button>
        <p className="gate-note"><Volume2 size={15} aria-hidden="true" /> best with the sound on</p>
      </div>
    </div>
  );
}