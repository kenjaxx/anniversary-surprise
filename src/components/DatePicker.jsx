import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Check, Copy, Heart, MessageCircle, Send, X } from 'lucide-react';
import CircularGallery from './CircularGallery.jsx';
import { datePicker as cfg } from '../data/dates.js';
import { fireConfetti } from '../utils/confetti.js';
import '../styles/datePicker.css';

// ---------- small helpers ----------

// A tiny seeded generator, so the decorations never jump around between renders.
const seeded = start => {
  let seed = start;
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
};

// Floating glyphs for each theme's background.
const DECO = cfg.options.map((o, oi) => {
  const rnd = seeded(oi * 97 + 13);
  return Array.from({ length: 10 }, (_, i) => ({
    glyph: o.deco[i % o.deco.length],
    left: 3 + rnd() * 94,
    size: 12 + Math.round(rnd() * 18),
    dur: 10 + rnd() * 9,
    delay: -rnd() * 16,
  }));
});

// The little burst of hearts that rises from the date card when she confirms.
const BURST = (() => {
  const rnd = seeded(7);
  const glyphs = ['♡', '♥', '✦', '♡', '♥'];
  return Array.from({ length: 16 }, (_, i) => ({
    glyph: glyphs[i % glyphs.length],
    size: 14 + Math.round(rnd() * 16),
    dx: Math.round((rnd() - 0.5) * 380),
    dy: -Math.round(80 + rnd() * 210),
    delay: Math.round(rnd() * 700),
  }));
})();

// A quiet gradient card, used when a photo file is missing.
function gradientImage(from, to) {
  const c = document.createElement('canvas');
  c.width = 640;
  c.height = 820;
  const g = c.getContext('2d');
  const base = g.createLinearGradient(0, 0, 640, 820);
  base.addColorStop(0, from);
  base.addColorStop(1, to);
  g.fillStyle = base;
  g.fillRect(0, 0, 640, 820);
  const glow = g.createRadialGradient(480, 170, 10, 480, 170, 520);
  glow.addColorStop(0, 'rgba(255,236,208,.28)');
  glow.addColorStop(1, 'rgba(255,236,208,0)');
  g.fillStyle = glow;
  g.fillRect(0, 0, 640, 820);
  g.strokeStyle = 'rgba(255,236,208,.35)';
  g.lineWidth = 2;
  g.strokeRect(24, 24, 592, 772);
  return c.toDataURL('image/jpeg', 0.92);
}

const ua = () => (typeof navigator === 'undefined' ? '' : navigator.userAgent);
const isIOS = () =>
  /iPhone|iPad|iPod/i.test(ua()) || (/Macintosh/i.test(ua()) && navigator.maxTouchPoints > 1);
const isMobile = () => /Android|iPhone|iPad|iPod/i.test(ua()) || isIOS();

// iPhones want "&body=", Android wants "?body=".
const smsHref = body => `sms:${cfg.phone}${isIOS() ? '&' : '?'}body=${encodeURIComponent(body)}`;

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
}

const hasWebGL2 = () => {
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
};

// Starts with your photos; any file that fails to load is swapped for a gradient card.
function useGalleryItems() {
  const [items, setItems] = useState(() =>
    cfg.options.map(o => ({ image: o.photo, text: o.title, description: o.line, alt: o.title }))
  );
  useEffect(() => {
    let alive = true;
    cfg.options.forEach((o, i) => {
      const probe = new Image();
      probe.onerror = () => {
        if (!alive) return;
        const image = gradientImage(o.from, o.to);
        setItems(prev => prev.map((item, j) => (j === i ? { ...item, image } : item)));
      };
      probe.src = o.photo;
    });
    return () => {
      alive = false;
    };
  }, []);
  return items;
}

// ---------- the overlay ----------

function Picker({ onClose }) {
  const [index, setIndex] = useState(0);
  const [when, setWhen] = useState(cfg.whenOptions[0]);
  const [step, setStep] = useState('pick'); // 'pick' | 'done'
  const [copied, setCopied] = useState(false);
  const items = useGalleryItems();
  const webgl = useMemo(hasWebGL2, []);
  const mobile = useMemo(isMobile, []);

  const option = cfg.options[index];
  const message = cfg.message(option, when);

  // No scrolling behind the overlay.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // A little celebration the moment she confirms.
  useEffect(() => {
    if (step === 'done') fireConfetti(1400);
  }, [step]);

  // Confirming: on a phone the messages app opens right away; on a computer the message is copied.
  const send = async () => {
    if (mobile) {
      window.location.href = smsHref(message);
      setStep('done');
      return;
    }
    setCopied(await copyText(message));
    setStep('done');
  };

  const copyAgain = async () => setCopied(await copyText(message));

  return (
    <div
      className="dp-overlay"
      data-theme={option.theme}
      data-step={step}
      role="dialog"
      aria-modal="true"
      aria-label={cfg.heading}
    >
      {/* One background per theme, stacked. Only the chosen one is visible, so they cross-fade. */}
      <div className="dp-bg" aria-hidden="true">
        {cfg.options.map((o, i) => (
          <div key={o.theme} className={`dp-bg-layer t-${o.theme}${i === index ? ' on' : ''}`}>
            {DECO[i].map((d, k) => (
              <span
                key={k}
                className="dp-deco"
                style={{ '--l': `${d.left}%`, '--s': `${d.size}px`, '--dur': `${d.dur}s`, '--dl': `${d.delay}s` }}
              >
                {d.glyph}
              </span>
            ))}
          </div>
        ))}
      </div>

      <button className="dp-close" onClick={onClose} aria-label="Close">
        <X size={20} />
      </button>

      <div className="dp-inner">
        {/* The heading is only for the choosing screen. Once she has picked, it is gone. */}
        {step === 'pick' && (
          <header className="dp-head">
            <span className="dp-rule" aria-hidden="true" />
            <h2>{cfg.heading}</h2>
            <p>{cfg.subheading}</p>
          </header>
        )}

        {step === 'pick' ? (
          <>
            {webgl ? (
              <div className="dp-stage">
                <CircularGallery
                  items={items}
                  bend={3}
                  itemSize={1}
                  itemAspect={0.78}
                  gap={0.22}
                  borderRadius={0.045}
                  wave={0.35}
                  fadeEdges={0.16}
                  shadow={0.45}
                  scrollEase={0.07}
                  snap
                  openOnClick={false}
                  textColor={option.text}
                  font={option.font}
                  onActiveChange={setIndex}
                />
              </div>
            ) : (
              <div className="dp-fallback" role="listbox" aria-label="Date ideas">
                {cfg.options.map((o, i) => (
                  <button
                    key={o.title}
                    role="option"
                    aria-selected={i === index}
                    className={`dp-fallback-card${i === index ? ' on' : ''}`}
                    style={{ '--from': o.from, '--to': o.to }}
                    onClick={() => setIndex(i)}
                    onMouseEnter={() => setIndex(i)}
                    onFocus={() => setIndex(i)}
                  >
                    {o.title}
                  </button>
                ))}
              </div>
            )}
            <p className="dp-hint">Drag, swipe, or use the arrow keys. Tap a card to choose it.</p>

            <section className="dp-panel" aria-live="polite">
              <span className="dp-label">Your pick</span>
              <h3 className="dp-pick" key={option.title}>{option.title} {option.emoji}</h3>
              <p className="dp-pick-line" key={option.line}>{option.line}</p>

              <div className="dp-chips" role="group" aria-label="When">
                {cfg.whenOptions.map(w => (
                  <button
                    key={w.label}
                    className="dp-chip"
                    aria-pressed={w.label === when.label}
                    onClick={() => setWhen(w)}
                  >
                    {w.label}
                  </button>
                ))}
              </div>

              <button className="dp-send" onClick={send}>
                {mobile ? <Send size={17} /> : <Copy size={17} />}
                {mobile ? `Send to ${cfg.sender}` : `Copy message for ${cfg.sender}`}
              </button>
            </section>
          </>
        ) : (
          <section className="dp-done" aria-live="polite">
            {/* hearts that rise from the date card */}
            <div className="dp-burst" aria-hidden="true">
              {BURST.map((b, i) => (
                <span
                  key={i}
                  style={{ '--s': `${b.size}px`, '--dx': `${b.dx}px`, '--dy': `${b.dy}px`, '--bd': `${b.delay}ms` }}
                >
                  {b.glyph}
                </span>
              ))}
            </div>

            <div className="dp-ticket">
              <span className="dp-ticket-seal" aria-hidden="true">
                <Heart size={22} fill="currentColor" />
              </span>
              <span className="dp-ticket-eyebrow">our next date</span>
              <span className="dp-ticket-emoji" aria-hidden="true">{option.emoji}</span>
              <h3>{option.title}</h3>
              <span className="dp-ticket-when">
                <Check size={18} strokeWidth={2} aria-hidden="true" /> {when.label}
              </span>
            </div>

            <p className="dp-done-title">It’s a date, love ♡</p>
            <p className="dp-done-lead">{option.doneLine}</p>

            {/* On a computer she sees exactly what she is sending. On a phone it is already in her messages app. */}
            {!mobile && (
              <div className="dp-bubble-wrap">
                <span className="dp-bubble-label">Your message to {cfg.sender}</span>
                <div className="dp-bubble">{message}</div>
              </div>
            )}

            <div className="dp-actions">
              {/* Opens the messages app with the number and the text already filled in. */}
              <a className="dp-send" href={smsHref(message)}>
                <MessageCircle size={17} /> Open messages
              </a>
              <button className="dp-ghost" onClick={copyAgain}>
                {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied ♡' : 'Copy message'}
              </button>
              <button className="dp-ghost" onClick={() => { setCopied(false); setStep('pick'); }}>
                <ArrowLeft size={16} /> Choose something else
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default function DatePicker({ open, onClose }) {
  if (!open) return null;
  // A portal keeps the overlay out of any transformed parent, so position:fixed always works.
  return createPortal(<Picker onClose={onClose} />, document.body);
}