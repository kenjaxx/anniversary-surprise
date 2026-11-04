// A one-shot burst of petals that flies out of a card when it turns over.
// Positions are generated once (seeded), so they never jump between renders.
const PETALS = (() => {
  let seed = 19;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const colors = ['#f4a3b8', '#f7c2cf', '#e9b872', '#ef8aa0'];

  return Array.from({ length: 10 }, (_, i) => {
    const side = i % 2 === 0 ? -1 : 1; // alternate left / right
    return {
      x: Math.round(side * (60 + rnd() * 110)),   // how far sideways
      y: -Math.round(30 + rnd() * 95),            // how high they float first
      fall: Math.round(70 + rnd() * 110),         // how far they drift down afterwards
      size: 9 + Math.round(rnd() * 6),
      rot: Math.round((rnd() - 0.5) * 520),
      delay: Math.round((0.3 + rnd() * 0.35) * 100) / 100, // starts as the card turns edge-on
      dur: Math.round((2.3 + rnd()) * 100) / 100,
      color: colors[i % colors.length],
    };
  });
})();

export default function PetalBurst() {
  return (
    <div className="petal-burst" aria-hidden="true">
      {PETALS.map((p, i) => (
        <i
          key={i}
          className="petal"
          style={{
            '--x': `${p.x}px`,
            '--y': `${p.y}px`,
            '--fall': `${p.fall}px`,
            '--s': `${p.size}px`,
            '--rot': `${p.rot}deg`,
            '--d': `${p.delay}s`,
            '--dur': `${p.dur}s`,
            '--c': p.color,
          }}
        />
      ))}
    </div>
  );
}