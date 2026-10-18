import confetti from 'canvas-confetti';

export function fireConfetti(duration = 1700) {
  const end = Date.now() + duration;
  const colors = ['#f06b83', '#ffd6a5', '#f7a9b8', '#fff0e6'];
  (function frame() {
    confetti({ particleCount: 5, angle: 60, spread: 65, origin: { x: 0 }, colors, scalar: 0.9 });
    confetti({ particleCount: 5, angle: 120, spread: 65, origin: { x: 1 }, colors, scalar: 0.9 });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}