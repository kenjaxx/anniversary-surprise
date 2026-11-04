import { useEffect, useState } from 'react';
import { scrollTo } from '../utils/scroll.js';

// The "love-letter strip": cream paper, a gold hairline frame and a wax-seal heart.
// The three links are the same sections as before. The one she is currently reading stays underlined.
const LINKS = [
  { id: 'story', label: 'Our story' },
  { id: 'reasons', label: 'Thank you' },
  { id: 'letter', label: 'A letter' },
];

// Opens the "Where to next, love?" date picker (Closing.jsx listens for this event).
const openDatePicker = () => window.dispatchEvent(new CustomEvent('tour:date-picker'));

export default function Topbar() {
  const [active, setActive] = useState('');

  useEffect(() => {
    const onScroll = () => {
      const line = window.innerHeight * 0.4;
      let current = '';
      LINKS.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      });
      // once she reaches the night sky, nothing is highlighted any more
      const end = document.getElementById('final');
      if (end && end.getBoundingClientRect().top <= line) current = '';
      setActive(prev => (prev === current ? prev : current));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <nav className="topbar letter-bar" aria-label="Main">
      <span className="lb-frame" aria-hidden="true" />

      <a className="lb-brand" href="#top" onClick={e => { e.preventDefault(); scrollTo('top'); }}>
        <span className="lb-seal" aria-hidden="true">♥</span>
        <span className="lb-name">one year of us</span>
      </a>

      <div className="lb-links">
        {LINKS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`lb-link${active === id ? ' is-active' : ''}`}
            aria-current={active === id ? 'true' : undefined}
            onClick={() => scrollTo(id)}
          >
            {label}
          </button>
        ))}

        <button type="button" className="lb-date" onClick={openDatePicker} aria-label="Plan our next date">
          <span className="lb-date-heart" aria-hidden="true">♡</span>
          <span className="lb-date-full">Plan our next date</span>
          <span className="lb-date-short">Next date</span>
        </button>
      </div>
    </nav>
  );
}