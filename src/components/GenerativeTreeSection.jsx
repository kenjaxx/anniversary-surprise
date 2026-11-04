
import { useEffect, useRef } from 'react';

const clamp = (value, min, max) =>
  Math.min(Math.max(value, min), max);

function createParticles(count) {
  return Array.from({ length: count }, (_, index) => ({
    x: Math.random(),
    y: Math.random(),
    radius: Math.random() * 1.8 + 0.5,
    speed: Math.random() * 0.000035 + 0.000012,
    drift: Math.random() * 0.000025 - 0.0000125,
    phase: Math.random() * Math.PI * 2,
    opacity: Math.random() * 0.45 + 0.2,
    index,
  }));
}

function drawBranch(ctx, length, depth, maxDepth, progress, time, seed = 0) {
  if (depth > maxDepth) return;

  const depthProgress = clamp(
    (progress - depth * 0.105) / 0.24,
    0,
    1
  );

  if (depthProgress <= 0) return;

  const swayAmount = 0.012 + depth * 0.006;
  const sway =
    Math.sin(time * 0.00055 + depth * 0.8 + seed) *
    swayAmount;

  const currentLength = length * depthProgress;
  const thickness = Math.max(0.65, 5.5 - depth * 0.68);

  ctx.save();

  ctx.rotate(sway);

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -currentLength);

  const gradient = ctx.createLinearGradient(
    0,
    0,
    0,
    -currentLength
  );

  gradient.addColorStop(0, '#98703d');
  gradient.addColorStop(1, '#d6b477');

  ctx.strokeStyle = gradient;
  ctx.lineWidth = thickness;
  ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(205, 164, 91, 0.25)';
  ctx.shadowBlur = depth < 3 ? 7 : 3;

  ctx.stroke();

  ctx.translate(0, -currentLength);

  if (depth === maxDepth) {
    drawLeaves(ctx, time, seed);
  } else {
    const nextLength = length * 0.73;
    const spread = depth < 2 ? 0.53 : 0.57;

    ctx.save();
    ctx.rotate(-spread + Math.sin(time * 0.0004 + seed) * 0.025);
    drawBranch(
      ctx,
      nextLength,
      depth + 1,
      maxDepth,
      progress,
      time,
      seed + 1.7
    );
    ctx.restore();

    ctx.save();
    ctx.rotate(spread + Math.sin(time * 0.00045 + seed + 2) * 0.025);
    drawBranch(
      ctx,
      nextLength,
      depth + 1,
      maxDepth,
      progress,
      time,
      seed + 3.2
    );
    ctx.restore();
  }

  ctx.restore();
}

function drawLeaves(ctx, time, seed) {
  const shimmer = 0.75 + Math.sin(time * 0.0015 + seed) * 0.2;

  for (let i = 0; i < 3; i++) {
    const angle = (i - 1) * 0.75;
    const distance = i === 1 ? 0 : 5;

    ctx.save();
    ctx.translate(distance, -distance);
    ctx.rotate(angle + Math.sin(time * 0.0007 + seed + i) * 0.08);

    ctx.beginPath();
    ctx.ellipse(0, -4, 2.2, 5.2, 0, 0, Math.PI * 2);

    ctx.fillStyle = `rgba(204, 165, 99, ${shimmer})`;
    ctx.shadowColor = 'rgba(212, 175, 112, 0.6)';
    ctx.shadowBlur = 8;
    ctx.fill();

    ctx.restore();
  }
}

function drawTree(ctx, width, height, progress, time, particles) {
  ctx.clearRect(0, 0, width, height);

  // Soft champagne glow behind the tree
  const glow = ctx.createRadialGradient(
    width / 2,
    height * 0.56,
    10,
    width / 2,
    height * 0.56,
    height * 0.53
  );

  glow.addColorStop(0, 'rgba(226, 198, 150, 0.18)');
  glow.addColorStop(0.55, 'rgba(242, 225, 194, 0.09)');
  glow.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // Floating golden particles
  particles.forEach((particle) => {
    const x =
      particle.x * width +
      Math.sin(time * 0.0004 + particle.phase) * 15;

    const y =
      ((particle.y * height - time * particle.speed * height * 60) %
        height +
        height) %
      height;

    const pulse =
      0.65 + Math.sin(time * 0.001 + particle.phase) * 0.3;

    ctx.beginPath();
    ctx.arc(x, y, particle.radius, 0, Math.PI * 2);

    ctx.fillStyle = `rgba(190, 151, 87, ${
      particle.opacity * pulse
    })`;

    ctx.shadowColor = 'rgba(211, 173, 111, 0.65)';
    ctx.shadowBlur = 9;
    ctx.fill();
  });

  // Tree trunk and branches
  ctx.save();

  const treeHeight = Math.min(height * 0.77, width * 0.83);
  const treeWidth = Math.min(width * 0.78, 550);

  ctx.translate(width / 2, height * 0.91);
  ctx.scale(treeWidth / 550, treeHeight / 550);

  // Ground glow
  const groundGlow = ctx.createRadialGradient(
    0,
    0,
    2,
    0,
    0,
    110
  );

  groundGlow.addColorStop(0, 'rgba(208, 171, 112, 0.20)');
  groundGlow.addColorStop(1, 'rgba(208, 171, 112, 0)');

  ctx.fillStyle = groundGlow;
  ctx.beginPath();
  ctx.ellipse(0, 0, 110, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  drawBranch(ctx, 155, 0, 7, progress, time);

  ctx.restore();
}

function GenerativeTree() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let frameId = null;
    let lastTime = 0;
    let elapsed = 0;
    let isVisible = false;
    let isPageVisible = !document.hidden;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const particles = createParticles(55);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();

      width = rect.width;
      height = rect.height;

      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      drawTree(
        ctx,
        width,
        height,
        reducedMotion ? 1 : clamp(elapsed / 4800, 0, 1),
        performance.now(),
        particles
      );
    };

    const render = (timestamp) => {
      if (!isVisible || !isPageVisible) return;

      if (lastTime) {
        elapsed += Math.min(timestamp - lastTime, 50);
      }

      lastTime = timestamp;

      const growthProgress = clamp(elapsed / 4800, 0, 1);

      drawTree(
        ctx,
        width,
        height,
        growthProgress,
        timestamp,
        particles
      );

      if (!reducedMotion) {
        frameId = requestAnimationFrame(render);
      }
    };

    const start = () => {
      if (isVisible && isPageVisible && frameId === null) {
        lastTime = 0;

        if (reducedMotion) {
          drawTree(ctx, width, height, 1, performance.now(), particles);
        } else {
          frameId = requestAnimationFrame(render);
        }
      }
    };

    const stop = () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }

      lastTime = 0;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;

        if (isVisible) {
          start();
        } else {
          stop();
        }
      },
      { threshold: 0.05 }
    );

    const handleVisibility = () => {
      isPageVisible = !document.hidden;

      if (isPageVisible) {
        start();
      } else {
        stop();
      }
    };

    const resizeObserver = new ResizeObserver(resize);

    observer.observe(canvas);
    resizeObserver.observe(canvas);

    document.addEventListener('visibilitychange', handleVisibility);

    resize();

    return () => {
      stop();
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener(
        'visibilitychange',
        handleVisibility
      );
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="growth-canvas"
      aria-label="An animated golden tree with gently swaying branches and floating lights"
      role="img"
    />
  );
}

export function GenerativeTreeSection() {
  return (
    <section id="growing-together" className="growth-section">
      <div className="growth-decoration growth-decoration-left" />
      <div className="growth-decoration growth-decoration-right" />

      <div className="growth-copy">
        <span className="growth-eyebrow">
          A YEAR OF MEMORIES, A LIFETIME TO GROW
        </span>

        <h2>Still Growing Together.</h2>

        <p>
          Like the branches of this little tree, every moment,
          every laugh, and every memory has helped us grow.
        </p>
      </div>

      <div className="growth-tree">
        <GenerativeTree />
      </div>

      <p className="growth-caption">
        Here's to everything we've grown into,
        <br />
        and everything still to come.
      </p>

      <span className="growth-bottom-mark" aria-hidden="true">
        ✦
      </span>
    </section>
  );
}

export default GenerativeTreeSection;
