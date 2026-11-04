import { useEffect, useState } from 'react';
import { elapsed, pad } from '../utils/time.js';

// Live "time together" counter, hung on a clothesline as six little polaroids.
// Its own component so only it re-renders every second.
export default function TimeTogether({ start, anniversary }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const startMs = new Date(start).getTime();
  const annivMs = new Date(anniversary).getTime();
  const t = elapsed(startMs, Math.max(now, startMs));
  const units = [
    ['years', t.years],
    ['months', t.months],
    ['days', t.days],
    ['hours', t.hours],
    ['minutes', t.minutes],
    ['seconds', t.seconds],
  ];

  // Two short lines of three: side by side on a computer (they read as one line of six),
  // stacked on a phone so every polaroid hangs from a line.
  const rows = [units.slice(0, 3), units.slice(3)];

  const remaining = annivMs - now;
  const rh = Math.floor(remaining / 36e5);
  const rm = Math.floor(remaining / 6e4) % 60;
  const rs = Math.floor(remaining / 1e3) % 60;

  return (
    <>
      <div
        className="clothesline rise"
        style={{ '--d': 5 }}
        role="timer"
        aria-label="Time we’ve been together"
      >
        <div className="counter-grid">
          {rows.map((row, r) => (
            <div className="counter-row" key={r}>
              {row.map(([label, value], c) => (
                <div className="counter-box" style={{ '--i': r * 3 + c }} key={label}>
                  {/* the key makes the number "pop" every time it changes */}
                  <strong key={value}>{value}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {remaining > 0
        ? <p className="countdown-line rise" style={{ '--d': 6 }}>✦ {rh > 0 ? `${rh}h ` : ''}{pad(rm)}m {pad(rs)}s until our 1st anniversary ✦</p>
        : <p className="countdown-line done rise" style={{ '--d': 6 }}>✦ We made it to one year ✦</p>}
    </>
  );
}