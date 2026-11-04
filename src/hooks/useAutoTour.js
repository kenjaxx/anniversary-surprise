import { useCallback, useEffect, useRef, useState } from 'react';
import { scrollToY, stopScroll } from '../utils/scroll.js';
import { content } from '../data/content.js';
import { tour as cfg } from '../data/tour.js';

const CANCELLED = Symbol('tour-cancelled');
const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));
const wordCount = s => (s || '').split(/\s+/).filter(Boolean).length;
const letterWords = () => wordCount(`${content.letter.join(' ')} My dearest Forever yours`);

// The tour, one step per section. Numbers are milliseconds.
const STEPS = [
  // 1. The "time together" counter, then press "Celebrate us" for her
  async t => {
    await t.goTo('#together');
    await t.wait(5500);
    if (!t.api.isCelebrated()) {
      t.api.celebrate();
      await t.wait(700);
    }
  },
  // 2. The "Happy 1 Year" card
  async t => {
    const el = document.getElementById('celebration');
    if (!el) return;
    await t.goTo(el);
    await t.wait(4500);
  },
  // 3. The photo wall, then open "View all photos" and go through every photo with its caption
  async t => {
    await t.goTo('#story .section-heading');
    await t.wait(1800);
    await t.goTo('.wall-stage');
    await t.wait(6000);
    await t.goTo('.wall-actions');
    await t.wait(1500);

    emit('tour:open-all');
    await t.wait(2200);

    const moments = content.moments;
    for (let i = 0; i < moments.length; i += 1) {
      emit('tour:memory', { index: i });
      const words = wordCount(moments[i].caption) + wordCount(moments[i].title);
      await t.wait(cfg.photoBaseMs + words * cfg.photoWordMs);
    }

    emit('tour:close-memory');
    await t.wait(700);
    emit('tour:close-all');
    await t.wait(900);
  },
  // 4. The feeling cards: flip them one by one
  async t => {
    await t.goTo('.feelings-head');
    await t.wait(2500);
    const cards = Array.from(document.querySelectorAll('.feelings-grid .flip-card'));
    for (let i = 0; i < cards.length; i += 1) {
      const r = cards[i].getBoundingClientRect();
      if (r.top < 90 || r.bottom > window.innerHeight - 20) await t.goTo(cards[i]);
      emit('tour:flip', { index: i, value: true });
      await t.wait(cfg.flipGapMs);
    }
  },
  // 5. The letter: open it and read through it
  async t => {
    await t.goTo('#letter');
    await t.wait(2000);
    emit('tour:open-letter');
    await t.wait(1000);
    await t.readThrough(document.querySelector('.letter-paper'), letterWords() * cfg.wordMs + 1500);
  },
  // 6. The closing night sky, then reveal the secret note
  async t => {
    await t.goTo('.night-sky');
    await t.wait(4000);
    emit('tour:secret');
    await t.wait(5500);
  },
  // 7. The date picker opens for her ("Where to next, love?")
  async t => {
    emit('tour:date-picker');
    await t.wait(2500);
  },
];

export default function useAutoTour({ celebrate, isCelebrated }) {
  // idle = not started, playing, paused, stopped (she chose to scroll herself), done
  const [status, setStatus] = useState('idle');
  const [index, setIndex] = useState(0);
  const statusRef = useRef('idle');
  const indexRef = useRef(0);
  const runRef = useRef(0);
  const timers = useRef([]);
  const api = useRef({});
  api.current = { celebrate, isCelebrated };

  const setSt = useCallback(s => { statusRef.current = s; setStatus(s); }, []);

  const cancelAll = useCallback(() => {
    runRef.current += 1;
    stopScroll();
    const list = timers.current;
    timers.current = [];
    list.forEach(fn => fn());
  }, []);

  const runFrom = useCallback(async from => {
    cancelAll();
    // close the photo gallery (and the date picker) if they were left open by a pause or a skip
    emit('tour:close-all');
    const token = runRef.current;
    setSt('playing');

    const alive = () => runRef.current === token;
    const check = () => { if (!alive()) throw CANCELLED; };

    const wait = ms => new Promise((resolve, reject) => {
      if (!alive()) { reject(CANCELLED); return; }
      let cancel;
      const id = setTimeout(() => {
        timers.current = timers.current.filter(f => f !== cancel);
        resolve();
      }, ms * cfg.pace);
      cancel = () => { clearTimeout(id); reject(CANCELLED); };
      timers.current.push(cancel);
    });

    // Glide so the element is centered (or top-aligned if it is taller than the screen).
    const goTo = async target => {
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) return;
      const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const vh = window.innerHeight;
      const r = el.getBoundingClientRect();
      const fits = r.height <= vh - pad - 24;
      const top = fits ? pad + (vh - pad - r.height) / 2 : pad;
      const y = window.scrollY + r.top - top;
      const ms = Math.min(2200, 900 + Math.abs(y - window.scrollY) * 0.32) * cfg.pace;
      await scrollToY(y, { duration: ms, interruptible: false });
      check();
    };

    // Show an element; if it is taller than the screen, scroll down through it.
    const readThrough = async (el, readMs) => {
      if (!el) return;
      await goTo(el);
      const r = el.getBoundingClientRect();
      if (r.bottom <= window.innerHeight - 12) { await wait(readMs); return; }
      const endY = window.scrollY + r.bottom - window.innerHeight + 28;
      await wait(900);
      await scrollToY(endY, { duration: readMs * cfg.pace, interruptible: false });
      check();
      await wait(1200);
    };

    const tools = { wait, goTo, readThrough, api: api.current };

    try {
      for (let i = from; i < STEPS.length; i += 1) {
        check();
        indexRef.current = i;
        setIndex(i);
        await STEPS[i](tools);
        check();
      }
      setSt('done');
    } catch (err) {
      if (err !== CANCELLED) {
        console.warn('[tour] stopped:', err);
        setSt('stopped');
      }
    }
  }, [cancelAll, setSt]);

  const start = useCallback(() => runFrom(0), [runFrom]);
  const resume = useCallback(() => runFrom(indexRef.current), [runFrom]);

  const pause = useCallback(() => {
    if (statusRef.current !== 'playing') return;
    cancelAll();
    setSt('paused');
  }, [cancelAll, setSt]);

  const skip = useCallback(() => {
    const next = indexRef.current + 1;
    if (next >= STEPS.length) { cancelAll(); emit('tour:close-all'); setSt('done'); return; }
    runFrom(next);
  }, [cancelAll, runFrom, setSt]);

  // "I'll scroll myself"
  const stop = useCallback(() => {
    cancelAll();
    emit('tour:close-all');
    setSt(statusRef.current === 'done' ? 'idle' : 'stopped');
  }, [cancelAll, setSt]);

  const restart = useCallback(() => {
    emit('tour:reset');
    runFrom(0);
  }, [runFrom]);

  // Back to the very beginning (used by "Start our little story again")
  const reset = useCallback(() => {
    cancelAll();
    indexRef.current = 0;
    setIndex(0);
    setSt('idle');
  }, [cancelAll, setSt]);

  // While playing: if she scrolls, touches to scroll, or uses the keyboard, pause right away.
  useEffect(() => {
    if (status !== 'playing') return undefined;
    const keys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
    const onKey = e => { if (keys.includes(e.key)) pause(); };
    window.addEventListener('wheel', pause, { passive: true });
    window.addEventListener('touchmove', pause, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', pause);
      window.removeEventListener('touchmove', pause);
      window.removeEventListener('keydown', onKey);
    };
  }, [status, pause]);

  // Keep the phone screen awake while the tour plays.
  useEffect(() => {
    if (status !== 'playing' || !('wakeLock' in navigator)) return undefined;
    let lock = null;
    let off = false;
    navigator.wakeLock.request('screen')
      .then(l => { if (off) l.release().catch(() => {}); else lock = l; })
      .catch(() => {});
    return () => { off = true; if (lock) lock.release().catch(() => {}); };
  }, [status]);

  useEffect(() => () => cancelAll(), [cancelAll]);

  return { status, index, total: STEPS.length, start, pause, resume, skip, stop, restart, reset };
}