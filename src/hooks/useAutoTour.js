import { useCallback, useEffect, useRef, useState } from 'react';
import { scrollToY, stopScroll, linear } from '../utils/scroll.js';
import { content } from '../data/content.js';
import { tour as cfg } from '../data/tour.js';

const CANCELLED = Symbol('tour-cancelled');

const emit = (name, detail) =>
  window.dispatchEvent(new CustomEvent(name, { detail }));

const wordCount = s =>
  (s || '').split(/\s+/).filter(Boolean).length;

const letterWords = () =>
  wordCount(`${content.letter.join(' ')} My dearest Forever yours`);

// The tour, one step per section.
const STEPS = [
  // 1. Time together counter
  async t => {
    await t.goTo('#together');
    await t.wait(5500);

    if (!t.api.isCelebrated()) {
      t.api.celebrate();
      await t.wait(700);
    }
  },

  // 2. Anniversary celebration
  async t => {
    const el = document.getElementById('celebration');

    if (!el) return;

    await t.goTo(el);
    await t.wait(4500);
  },

  // 3. Photo memories
    // 3. Photo memories
  async t => {
    await t.goTo('#story .section-heading');
    await t.wait(1800);

    await t.goTo('.wall-stage');
    await t.wait(6000);

    await t.goTo('.wall-actions');
    await t.wait(1500);

    const moments = content.moments;
    const total = moments.length;

    // Open the "all photos" page
    emit('tour:open-all');
    await t.wait(150);

    // Start the rope a few photos BEFORE the end (e.g. photo 12 of 16)...
    const startFrom = (((total - cfg.browseCount) % total) + total) % total;
    emit('tour:browse', { to: startFrom });
    await t.wait(cfg.browseLeadMs);

    // ...then glide through the last photos, one by one. After the last glide
    // the rope lands on photo 1, so the popups below start at 1/16.
    for (let i = 0; i < cfg.browseCount; i += 1) {
      emit('tour:browse', { delta: 1 });
      await t.wait(cfg.browseGapMs);
    }
    await t.wait(500);

    // Show every photo in order: 1/16, 2/16 ... 16/16
    for (let i = 0; i < total; i += 1) {
      emit('tour:memory', { index: i });

      const words =
        wordCount(moments[i].caption) +
        wordCount(moments[i].title);

      await t.wait(
        cfg.photoBaseMs + words * cfg.photoWordMs
      );
    }

    // Close the gallery
    emit('tour:close-memory');
    await t.wait(700);

    emit('tour:close-all');
    await t.wait(900);
  },

  // 4. Feeling cards
  async t => {
    await t.goTo('.feelings-head');
    await t.wait(2500);

    const cards = Array.from(
      document.querySelectorAll('.feelings-grid .flip-card')
    );

    for (let i = 0; i < cards.length; i += 1) {
      const r = cards[i].getBoundingClientRect();

      if (
        r.top < 90 ||
        r.bottom > window.innerHeight - 20
      ) {
        await t.goTo(cards[i]);
      }

      emit('tour:flip', {
        index: i,
        value: true,
      });

      await t.wait(cfg.flipGapMs);
    }
  },

  // 5. Love letter (scroll-driven tri-fold), in three phases:
  //    quick unfold -> slow, steady reading -> fold shut
  async t => {
    await t.goTo('#letter');
    await t.wait(1200);

    const track = document.querySelector('.tf-track');
    if (!track) {
      // reduced motion: the letter is a plain open page
      await t.wait(letterWords() * cfg.wordMs * cfg.letterReadFactor);
      return;
    }

    // Pin the letter (progress 0), then move to any progress 0..1 of its scroll track.
    await t.goTo(track);

    const toProgress = async (p, ms, easing) => {
      const sticky = track.querySelector('.tf-sticky');
      const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const rect = track.getBoundingClientRect();
      const total = rect.height - sticky.offsetHeight;
      const y0 = window.scrollY + rect.top - pad;
      await t.scrollY(y0 + total * p, ms, easing);
    };

    await t.wait(500);

    // 1) unfold, quickly
    await toProgress(cfg.letterOpenAt + 0.01, cfg.letterOpenMs);
    await t.wait(700);

    // 2) read, slowly and at a steady speed
    const readMs = letterWords() * cfg.wordMs * cfg.letterReadFactor + 6000;
    await toProgress(cfg.letterReadEnd + 0.005, readMs, linear);
    await t.wait(900);

    // 3) fold shut
    await toProgress(1, cfg.letterCloseMs);
    await t.wait(1200);
  },

  // 6. Closing night sky
  async t => {
    await t.goTo('.night-sky');
    await t.wait(4000);

    emit('tour:secret');
    await t.wait(5500);
  },

  // 7. Date picker (it hovers every date by itself, then shows "now you choose")
  async t => {
    emit('tour:date-picker');
    await t.wait(2500);
  },
];

export default function useAutoTour({ celebrate, isCelebrated }) {
  const [status, setStatus] = useState('idle');
  const [index, setIndex] = useState(0);

  const statusRef = useRef('idle');
  const indexRef = useRef(0);
  const runRef = useRef(0);
  const timers = useRef([]);
  const api = useRef({});

  api.current = { celebrate, isCelebrated };

  const setSt = useCallback(s => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  const cancelAll = useCallback(() => {
    runRef.current += 1;

    stopScroll();

    const list = timers.current;
    timers.current = [];

    list.forEach(fn => fn());
  }, []);

  const runFrom = useCallback(async from => {
    cancelAll();

    emit('tour:close-all');

    const token = runRef.current;

    setSt('playing');

    const alive = () => runRef.current === token;

    const check = () => {
      if (!alive()) throw CANCELLED;
    };

    const wait = ms =>
      new Promise((resolve, reject) => {
        if (!alive()) {
          reject(CANCELLED);
          return;
        }

        let cancel;

        const id = setTimeout(() => {
          timers.current = timers.current.filter(
            f => f !== cancel
          );

          resolve();
        }, ms * cfg.pace);

        cancel = () => {
          clearTimeout(id);
          reject(CANCELLED);
        };

        timers.current.push(cancel);
      });

    // Scroll to an element smoothly
    const goTo = async target => {
      const el =
        typeof target === 'string'
          ? document.querySelector(target)
          : target;

      if (!el) return;

      const pad =
        parseFloat(
          getComputedStyle(
            document.documentElement
          ).scrollPaddingTop
        ) || 0;

      const vh = window.innerHeight;
      const r = el.getBoundingClientRect();

      const fits = r.height <= vh - pad - 24;

      const top = fits
        ? pad + (vh - pad - r.height) / 2
        : pad;

      const y = window.scrollY + r.top - top;

      const ms =
        Math.min(
          2200,
          900 + Math.abs(y - window.scrollY) * 0.32
        ) * cfg.pace;

      await scrollToY(y, {
        duration: ms,
        interruptible: false,
      });

      check();
    };

    // Scroll to an exact position over a given time (optionally at a steady speed).
    const scrollY = async (y, ms, easing) => {
      await scrollToY(y, {
        duration: ms * cfg.pace,
        interruptible: false,
        easing,
      });

      check();
    };

    const tools = {
      wait,
      goTo,
      scrollY,
      api: api.current,
    };

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

  const start = useCallback(
    () => runFrom(0),
    [runFrom]
  );

  const resume = useCallback(
    () => runFrom(indexRef.current),
    [runFrom]
  );

  const pause = useCallback(() => {
    if (statusRef.current !== 'playing') return;

    cancelAll();
    setSt('paused');
  }, [cancelAll, setSt]);

  const skip = useCallback(() => {
    const next = indexRef.current + 1;

    if (next >= STEPS.length) {
      cancelAll();
      emit('tour:close-all');
      setSt('done');
      return;
    }

    runFrom(next);
  }, [cancelAll, runFrom, setSt]);

  const stop = useCallback(() => {
    cancelAll();
    emit('tour:close-all');

    setSt(
      statusRef.current === 'done'
        ? 'idle'
        : 'stopped'
    );
  }, [cancelAll, setSt]);

  const restart = useCallback(() => {
    emit('tour:reset');
    runFrom(0);
  }, [runFrom]);

  const reset = useCallback(() => {
    cancelAll();

    indexRef.current = 0;

    setIndex(0);
    setSt('idle');
  }, [cancelAll, setSt]);

  // Pause the tour if she interacts with the page
  useEffect(() => {
    if (status !== 'playing') return undefined;

    const keys = [
      'ArrowUp',
      'ArrowDown',
      'PageUp',
      'PageDown',
      'Home',
      'End',
      ' ',
    ];

    const onKey = e => {
      if (keys.includes(e.key)) pause();
    };

    window.addEventListener('wheel', pause, {
      passive: true,
    });

    window.addEventListener('touchmove', pause, {
      passive: true,
    });

    window.addEventListener('pointerdown', pause, {
      passive: true,
    });

    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('wheel', pause);
      window.removeEventListener('touchmove', pause);
      window.removeEventListener('pointerdown', pause);
      window.removeEventListener('keydown', onKey);
    };
  }, [status, pause]);

  // Keep the phone screen awake during the tour
  useEffect(() => {
    if (
      status !== 'playing' ||
      !('wakeLock' in navigator)
    ) {
      return undefined;
    }

    let lock = null;
    let off = false;

    navigator.wakeLock
      .request('screen')
      .then(l => {
        if (off) {
          l.release().catch(() => {});
        } else {
          lock = l;
        }
      })
      .catch(() => {});

    return () => {
      off = true;

      if (lock) {
        lock.release().catch(() => {});
      }
    };
  }, [status]);

  useEffect(
    () => () => cancelAll(),
    [cancelAll]
  );

  return {
    status,
    index,
    total: STEPS.length,
    start,
    pause,
    resume,
    skip,
    stop,
    restart,
    reset,
  };
}