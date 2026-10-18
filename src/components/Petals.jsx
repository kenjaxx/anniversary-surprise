import { useMemo } from 'react';

export default function Petals({ count = 16 }) {
  const petals = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.round(Math.random() * 100),
    size: 12 + Math.round(Math.random() * 16),
    delay: -Math.random() * 18,
    duration: 14 + Math.random() * 12,
    glyph: ['♡', '✿', '♥', '✦'][i % 4],
  })), [count]);

  return (
    <div className="petals" aria-hidden="true">
      {petals.map(p => (
        <span key={p.id} style={{ left: `${p.left}%`, fontSize: p.size, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s` }}>
          {p.glyph}
        </span>
      ))}
    </div>
  );
}