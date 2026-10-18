import { useEffect, useState } from 'react';
import { elapsed, pad } from '../utils/time.js';

// Live "time together" counter. Its own component so only it re-renders every second.
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

  const remaining = annivMs - now;
  const rh = Math.floor(remaining / 36e5);
  const rm = Math.floor(remaining / 6e4) % 60;
  const rs = Math.floor(remaining / 1e3) % 60;

  return (
    <>
      <div className="counter-grid" role="timer" aria-label="Time we've been together">
        {units.map(([label, value]) => (
          <div className="counter-box" key={label}><strong>{value}</strong><span>{label}</span></div>
        ))}
      </div>
      {remaining > 0
        ? <p className="countdown-line">✦ {rh > 0 ? `${rh}h ` : ''}{pad(rm)}m {pad(rs)}s until our 1st anniversary ✦</p>
        : <p className="countdown-line done">✦ We made it to one year ✦</p>}
    </>
  );
}