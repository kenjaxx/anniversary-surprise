import { useEffect, useRef, useState } from 'react';

const FONT_SERIF = '"Playfair Display", Georgia, serif';
const FONT_SANS = '"DM Sans", "Helvetica Neue", Arial, sans-serif';
const FONT_SCRIPT = 'Caveat, cursive';

// Two cloth shapes: a wide banner for computers, a tall one for phones.
// W / H = texture size in px, BW = cloth width in 3D units, the rest are text positions (fractions of H).
const LAYOUTS = {
  wide: {
    W: 1400, H: 880, BW: 4.4, inset: 44,
    hearts: 0.155, eyebrow: 0.24, title: 0.385, rule: 0.5, msg: 0.65, sign: 0.84,
    eyebrowPx: 26, titleStart: 170, titleMax: 0.6, msgPx: 54, msgMax: 0.62, signPx: 46, ruleHalf: 0.14,
  },
  tall: {
    W: 800, H: 1200, BW: 3.0, inset: 36,
    hearts: 0.14, eyebrow: 0.22, title: 0.34, rule: 0.44, msg: 0.6, sign: 0.84,
    eyebrowPx: 22, titleStart: 130, titleMax: 0.8, msgPx: 56, msgMax: 0.74, signPx: 42, ruleHalf: 0.2,
  },
};

const FOV = 38;
const DT = 1 / 60;
const GRAV = -3.1;
const DAMP = 0.985;

// ---------- drawing helpers (the cloth texture) ----------

function heartPath(ctx, cx, cy, size) {
  const s = size / 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.95);
  ctx.bezierCurveTo(cx - s * 1.9, cy - s * 0.15, cx - s * 0.95, cy - s * 1.5, cx, cy - s * 0.5);
  ctx.bezierCurveTo(cx + s * 0.95, cy - s * 1.5, cx + s * 1.9, cy - s * 0.15, cx, cy + s * 0.95);
  ctx.closePath();
}

function spacedText(ctx, text, x, y, gap) {
  const chars = [...text];
  const widths = chars.map(c => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + gap * (chars.length - 1);
  let cx = x - total / 2;
  ctx.textAlign = 'left';
  chars.forEach((c, i) => {
    ctx.fillText(c, cx, y);
    cx += widths[i] + gap;
  });
  ctx.textAlign = 'center';
}

function wrapLines(ctx, text, maxW) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  words.forEach(w => {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > maxW && line) {
      lines.push(line);
      line = w;
    } else {
      line = t;
    }
  });
  if (line) lines.push(line);
  return lines;
}

function paintCloth(L, { eyebrow, title, message, signature }) {
  const { W, H, inset } = L;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const x = canvas.getContext('2d');
  x.textAlign = 'center';
  x.textBaseline = 'middle';

  // blush ground with a soft light in the middle
  const ground = x.createLinearGradient(0, 0, 0, H);
  ground.addColorStop(0, '#fdeae3');
  ground.addColorStop(0.55, '#fbdcd4');
  ground.addColorStop(1, '#f8d0c9');
  x.fillStyle = ground;
  x.fillRect(0, 0, W, H);

  const glow = x.createRadialGradient(W / 2, H * 0.42, 10, W / 2, H * 0.42, Math.max(W, H) * 0.6);
  glow.addColorStop(0, 'rgba(255,249,244,.85)');
  glow.addColorStop(1, 'rgba(255,249,244,0)');
  x.fillStyle = glow;
  x.fillRect(0, 0, W, H);

  // hems: rose, gold, hairline
  const i1 = inset;
  const i2 = inset + 22;
  const i3 = inset + 36;
  x.lineJoin = 'round';
  x.strokeStyle = '#c94f68';
  x.lineWidth = 9;
  x.strokeRect(i1, i1, W - i1 * 2, H - i1 * 2);
  x.strokeStyle = '#c9a063';
  x.lineWidth = 3;
  x.strokeRect(i2, i2, W - i2 * 2, H - i2 * 2);
  x.strokeStyle = 'rgba(201,79,104,.5)';
  x.lineWidth = 1.5;
  x.strokeRect(i3, i3, W - i3 * 2, H - i3 * 2);

  // little heart medallions in the four corners
  [[i2, i2], [W - i2, i2], [i2, H - i2], [W - i2, H - i2]].forEach(([cx, cy]) => {
    x.fillStyle = '#fbe3dc';
    x.beginPath();
    x.arc(cx, cy, 23, 0, Math.PI * 2);
    x.fill();
    x.strokeStyle = '#c9a063';
    x.lineWidth = 2;
    x.stroke();
    heartPath(x, cx, cy, 22);
    x.fillStyle = '#c94f68';
    x.fill();
  });

  // three hearts
  const hy = L.hearts * H;
  const gap = W * 0.085;
  [[-gap, 30, false], [0, 42, true], [gap, 30, false]].forEach(([dx, size, filled]) => {
    heartPath(x, W / 2 + dx, hy, size);
    if (filled) {
      x.fillStyle = '#e96f83';
      x.fill();
    } else {
      x.strokeStyle = '#e58b9a';
      x.lineWidth = 3;
      x.stroke();
    }
  });

  // eyebrow
  x.fillStyle = '#b56c71';
  x.font = `700 ${L.eyebrowPx}px ${FONT_SANS}`;
  spacedText(x, eyebrow.toUpperCase(), W / 2, L.eyebrow * H, L.eyebrowPx * 0.42);

  // title, shrunk until it fits
  const maxTitle = W * L.titleMax;
  let px = L.titleStart;
  x.font = `500 ${px}px ${FONT_SERIF}`;
  const w0 = x.measureText(title).width;
  if (w0 > maxTitle) px = Math.floor((px * maxTitle) / w0);
  x.font = `500 ${px}px ${FONT_SERIF}`;
  const tg = x.createLinearGradient(W / 2 - maxTitle / 2, 0, W / 2 + maxTitle / 2, 0);
  tg.addColorStop(0, '#8f3a52');
  tg.addColorStop(0.55, '#b0445d');
  tg.addColorStop(1, '#c94f68');
  x.fillStyle = tg;
  x.fillText(title, W / 2, L.title * H);

  // gold rule with a heart
  const ry = L.rule * H;
  const half = W * L.ruleHalf;
  x.strokeStyle = '#c9a063';
  x.lineWidth = 2.5;
  x.beginPath();
  x.moveTo(W / 2 - half, ry);
  x.lineTo(W / 2 - 30, ry);
  x.moveTo(W / 2 + 30, ry);
  x.lineTo(W / 2 + half, ry);
  x.stroke();
  heartPath(x, W / 2, ry, 24);
  x.fillStyle = '#c94f68';
  x.fill();

  // message
  x.font = `italic 500 ${L.msgPx}px ${FONT_SERIF}`;
  x.fillStyle = '#5e3e43';
  const lines = wrapLines(x, message, W * L.msgMax);
  const lh = L.msgPx * 1.38;
  const startY = L.msg * H - ((lines.length - 1) * lh) / 2;
  lines.forEach((line, i) => x.fillText(line, W / 2, startY + i * lh));

  // handwritten signature + heart
  if (signature) {
    x.font = `400 ${L.signPx}px ${FONT_SCRIPT}`;
    const tw = x.measureText(signature).width;
    const total = tw + 16 + 26;
    const sx = W / 2 - total / 2;
    x.textAlign = 'left';
    x.fillStyle = '#a8677a';
    x.fillText(signature, sx, L.sign * H);
    x.textAlign = 'center';
    heartPath(x, sx + tw + 16 + 13, L.sign * H + 2, 24);
    x.fillStyle = '#e96f83';
    x.fill();
  }

  // woven thread grid
  for (let yy = 0; yy < H; yy += 3) {
    x.fillStyle = 'rgba(120,50,50,.045)';
    x.fillRect(0, yy, W, 1);
  }
  for (let xx = 0; xx < W; xx += 3) {
    x.fillStyle = 'rgba(255,255,255,.09)';
    x.fillRect(xx, 0, 1, H);
  }

  // fabric slub noise
  const img = x.getImageData(0, 0, W, H);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() * 2 - 1) * 8;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  x.putImageData(img, 0, 0);

  return canvas;
}

async function loadFonts() {
  if (!document.fonts || !document.fonts.load) return;
  const all = Promise.all([
    document.fonts.load(`500 100px ${FONT_SERIF}`),
    document.fonts.load(`italic 500 100px ${FONT_SERIF}`),
    document.fonts.load(`700 40px ${FONT_SANS}`),
    document.fonts.load(`400 40px ${FONT_SCRIPT}`),
  ]);
  await Promise.race([all, new Promise(r => setTimeout(r, 2500))]);
}

// ---------- the component ----------

export default function WovenCloth({
  eyebrow = 'happy anniversary',
  title = 'Happy 1 Year!',
  message = '',
  signature = 'with all my love',
  className = '',
}) {
  const mountRef = useRef(null);
  const [portrait, setPortrait] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 560px)').matches
  );
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  // switch between the wide and the tall cloth
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 560px)');
    const on = () => setPortrait(mq.matches);
    if (mq.addEventListener) mq.addEventListener('change', on);
    else mq.addListener(on);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', on);
      else mq.removeListener(on);
    };
  }, []);

  useEffect(() => {
    const host = mountRef.current;
    if (!host) return undefined;

    let alive = true;
    let cleanup = () => {};
    setReady(false);
    setFailed(false);

    (async () => {
      let THREE;
      try {
        THREE = await import('three');
      } catch {
        if (alive) setFailed(true);
        return;
      }
      if (!alive) return;

      try {
        await loadFonts();
      } catch {
        /* fall back to system fonts */
      }
      if (!alive) return;

      const L = portrait ? LAYOUTS.tall : LAYOUTS.wide;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // a fresh canvas each time, so React StrictMode re-mounts never reuse a dead one
      const canvas = document.createElement('canvas');
      canvas.className = 'cloth-canvas';
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
      } catch {
        setFailed(true);
        return;
      }
      renderer.setClearColor(0x000000, 0);
      host.appendChild(canvas);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);

      // ----- cloth mesh -----
      const GX = portrait ? 30 : 44;
      const GY = portrait ? 44 : 28;
      const BW = L.BW;
      const BH = (BW * L.H) / L.W;

      const texture = new THREE.CanvasTexture(paintCloth(L, { eyebrow, title, message, signature }));
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

      const geo = new THREE.PlaneGeometry(BW, BH, GX, GY);
      const mat = new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.DoubleSide,
        shininess: 8,
        specular: 0x3a2a26,
      });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);

      // ----- gold rod it hangs from -----
      const rodGeo = new THREE.CylinderGeometry(0.05, 0.05, BW + 0.5, 24);
      const knobGeo = new THREE.SphereGeometry(0.085, 20, 16);
      const rodMat = new THREE.MeshPhongMaterial({ color: 0xd4a85f, specular: 0xfff0c8, shininess: 70 });
      const rod = new THREE.Mesh(rodGeo, rodMat);
      rod.rotation.z = Math.PI / 2;
      rod.position.set(0, BH / 2 + 0.012, 0.03);
      scene.add(rod);
      [-1, 1].forEach(side => {
        const knob = new THREE.Mesh(knobGeo, rodMat);
        knob.position.set(side * (BW / 2 + 0.27), BH / 2 + 0.012, 0.03);
        scene.add(knob);
      });

      // ----- light (bright, so the cloth stays pastel on the white page) -----
      scene.add(new THREE.AmbientLight(0xfff1e6, 2.0));
      const key = new THREE.DirectionalLight(0xffffff, 1.7);
      key.position.set(-2.5, 3.5, 4.5);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xff9fb0, 0.7);
      rim.position.set(3, -1.5, 2.5);
      scene.add(rim);

      // ----- physics (Verlet), the top row is pinned to the rod -----
      const pos = geo.attributes.position;
      const N = (GX + 1) * (GY + 1);
      const cur = new Float32Array(N * 3);
      const prev = new Float32Array(N * 3);
      for (let i = 0; i < N; i += 1) {
        cur[i * 3] = prev[i * 3] = pos.getX(i);
        cur[i * 3 + 1] = prev[i * 3 + 1] = pos.getY(i);
        cur[i * 3 + 2] = prev[i * 3 + 2] = 0;
      }
      const idx = (ix, iy) => ix + iy * (GX + 1);
      const restH = BW / GX;
      const restV = BH / GY;
      const wf = [0, 0, 0];
      const push = { x: 0.5, y: 0.5, power: 0 };

      const wind = (cx, cy, t) => {
        const travel = t * 1.5 - cy * 4.0;
        const gust = 0.65 + 0.35 * Math.sin(t * 0.55) + 0.15 * Math.sin(t * 1.7 + 1.3);
        const amp = 2.5 * cy;
        let fz = (Math.sin(travel + cx * 3.0) + 0.45 * Math.sin(travel * 1.7 + cx * 5.5)) * amp * gust;
        const fx = Math.sin(t * 0.8 + cy * 2.2) * 0.5 * cy;
        const fy = -0.3 * cy;
        if (push.power > 0.002) {
          const dx = cx - push.x;
          const dy = cy - push.y;
          fz += push.power * 22 * Math.exp(-(dx * dx + dy * dy) / 0.045);
        }
        wf[0] = fx;
        wf[1] = fy;
        wf[2] = fz;
      };

      const solve = (a, b, rl) => {
        const a3 = a * 3;
        const b3 = b * 3;
        let dx = cur[b3] - cur[a3];
        let dy = cur[b3 + 1] - cur[a3 + 1];
        let dz = cur[b3 + 2] - cur[a3 + 2];
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6;
        const k = ((d - rl) / d) * 0.5;
        dx *= k;
        dy *= k;
        dz *= k;
        const pa = a <= GX;
        const pb = b <= GX;
        if (!pa && !pb) {
          cur[a3] += dx; cur[a3 + 1] += dy; cur[a3 + 2] += dz;
          cur[b3] -= dx; cur[b3 + 1] -= dy; cur[b3 + 2] -= dz;
        } else if (pa && !pb) {
          cur[b3] -= dx * 2; cur[b3 + 1] -= dy * 2; cur[b3 + 2] -= dz * 2;
        } else if (!pa && pb) {
          cur[a3] += dx * 2; cur[a3 + 1] += dy * 2; cur[a3 + 2] += dz * 2;
        }
      };

      const step = t => {
        for (let iy = 1; iy <= GY; iy += 1) {
          const cy = iy / GY;
          for (let ix = 0; ix <= GX; ix += 1) {
            wind(ix / GX, cy, t);
            const i3 = idx(ix, iy) * 3;
            for (let k = 0; k < 3; k += 1) {
              const j = i3 + k;
              const a = k === 0 ? wf[0] : k === 1 ? wf[1] + GRAV : wf[2];
              const v = (cur[j] - prev[j]) * DAMP;
              prev[j] = cur[j];
              cur[j] += v + a * DT * DT;
            }
          }
        }
        for (let it = 0; it < 6; it += 1) {
          for (let iy = 0; iy <= GY; iy += 1) {
            for (let ix = 0; ix < GX; ix += 1) solve(idx(ix, iy), idx(ix + 1, iy), restH);
          }
          for (let iy = 0; iy < GY; iy += 1) {
            for (let ix = 0; ix <= GX; ix += 1) solve(idx(ix, iy), idx(ix, iy + 1), restV);
          }
        }
        push.power *= 0.94;
      };

      const commit = () => {
        pos.array.set(cur);
        pos.needsUpdate = true;
        geo.computeVertexNormals();
      };

      const render = () => renderer.render(scene, camera);

      // ----- camera: always fits the whole cloth and rod -----
      const view = { sx: 1, sy: 1 };
      const fit = () => {
        const w = Math.max(1, host.clientWidth);
        const h = Math.max(1, host.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, portrait ? 1.75 : 2));
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        const tan = Math.tan((FOV * Math.PI) / 360);
        const needH = BH * 1.1 + 0.45;
        const needW = BW + 0.7;
        const dist = Math.max(needH / 2 / tan, needW / 2 / tan / camera.aspect) * 1.03;
        const cy = -BH * 0.03;
        camera.position.set(0, cy, dist);
        camera.lookAt(0, cy, 0);
        const visH = 2 * dist * tan;
        view.sy = visH / BH;
        view.sx = (visH * camera.aspect) / BW;
      };
      fit();

      // ----- cursor / finger makes a little gust -----
      let lastX = null;
      let lastY = null;
            const onMove = e => {
        const r = host.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        if (lastX !== null) {
          const speed = Math.hypot(e.clientX - lastX, e.clientY - lastY);
          push.power = Math.min(1.3, push.power + speed / 70);
        }
        push.x = 0.5 + (px - 0.5) / view.sx;
        push.y = 0.5 + (py - 0.5) / view.sy + 0.03;
        lastX = e.clientX;
        lastY = e.clientY;
      };
      const onLeave = () => {
        lastX = null;
        lastY = null;
      };

      // ----- loop -----
      let running = true;
      let visible = true;
      let raf = 0;
      let last = 0;
      let acc = 0;
      let t = 0;

      const frame = now => {
        raf = 0;
        if (!running) return;
        const dt = last ? Math.min(0.05, (now - last) / 1000) : DT;
        last = now;
        acc += dt;
        let n = 0;
        while (acc >= DT && n < 3) {
          t += DT;
          step(t);
          acc -= DT;
          n += 1;
        }
        if (n === 3) acc = 0;
        if (n > 0) {
          commit();
          render();
        }
        raf = requestAnimationFrame(frame);
      };

      const sync = () => {
        const should = running && visible && !document.hidden && !reduce;
        if (should && !raf) {
          last = 0;
          raf = requestAnimationFrame(frame);
        } else if (!should && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      };

      // let the cloth settle before the first frame
      const warm = reduce ? 240 : 70;
      for (let s = 0; s < warm; s += 1) {
        t += DT;
        step(t);
      }
      push.power = 0;
      commit();
      render();
      setReady(true);

      const ro = new ResizeObserver(() => {
        fit();
        if (!raf) render();
      });
      ro.observe(host);

      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        sync();
      });
      io.observe(host);

      const onVisibility = () => sync();
      document.addEventListener('visibilitychange', onVisibility);

      if (!reduce) {
        host.addEventListener('pointermove', onMove);
        host.addEventListener('pointerleave', onLeave);
      }
      sync();

      cleanup = () => {
        running = false;
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        document.removeEventListener('visibilitychange', onVisibility);
        host.removeEventListener('pointermove', onMove);
        host.removeEventListener('pointerleave', onLeave);
        geo.dispose();
        mat.dispose();
        texture.dispose();
        rodGeo.dispose();
        knobGeo.dispose();
        rodMat.dispose();
        renderer.dispose();
        canvas.remove();
      };
    })();

    return () => {
      alive = false;
      cleanup();
    };
  }, [portrait, eyebrow, title, message, signature]);

  return (
    <div
      className={`cloth${ready ? ' is-ready' : ''}${failed ? ' is-failed' : ''}${className ? ` ${className}` : ''}`}
      role="img"
      aria-label={`${title} ${message}`}
    >
      <div className="cloth-mount" ref={mountRef} aria-hidden="true" />
      {failed && (
        <div className="cloth-fallback" aria-hidden="true">
          <span className="cloth-fb-eyebrow">{eyebrow}</span>
          <strong>{title}</strong>
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}