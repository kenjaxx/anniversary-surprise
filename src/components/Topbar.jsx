import { Music2 } from 'lucide-react';
import { scrollTo } from '../utils/scroll.js';

export default function Topbar({ musicOn, musicStatus, onToggleMusic }) {
  return (
    <nav className="topbar">
      <a className="brand" href="#top" onClick={e => { e.preventDefault(); scrollTo('top'); }}>
        <span>♡</span> one year of us
      </a>
      <div className="nav-links">
        <button onClick={() => scrollTo('story')}>Our story</button>
        <button onClick={() => scrollTo('reasons')}>Thank you</button>
        <button onClick={() => scrollTo('letter')}>A letter</button>
      </div>
      <button
        className="music-toggle"
        onClick={onToggleMusic}
        aria-label={musicOn ? 'Pause music' : 'Play background music'}
        title="Add your own track at public/music.mp3"
      >
        <Music2 size={16} /><span>{musicOn ? 'Music on' : (musicStatus || 'Music')}</span>
      </button>
    </nav>
  );
}