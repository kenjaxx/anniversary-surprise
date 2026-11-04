import { useCallback, useEffect, useRef } from 'react';
import { music } from '../data/music.js';

// The song always plays. There is no on/off button any more.
// 1) It tries to start straight away (works on some desktop browsers).
// 2) If the browser blocks that (most do until a tap), it starts on her first tap, click or key press,
//    or when the "Tap to begin" screen calls startMusic() inside her tap.
// 3) It pauses when she switches tabs or locks the phone, and resumes when she comes back.
export default function useMusic() {
  const audioRef = useRef(null);
  const playingRef = useRef(false);
  const fadeRef = useRef(null);

  const fadeIn = useCallback(audio => {
    clearInterval(fadeRef.current);
    audio.volume = 0;
    const target = music.volume;
    const steps = 30;
    let i = 0;
    fadeRef.current = setInterval(() => {
      i += 1;
      audio.volume = Math.min(target, (target * i) / steps);
      if (i >= steps) clearInterval(fadeRef.current);
    }, 50);
  }, []);

  // returns true if playback started
  const start = useCallback(async audio => {
    if (!audio) return false;
    try {
      audio.volume = 0;
      await audio.play();
      // this audio was replaced while loading (dev double-mount): ignore it
      if (audioRef.current !== audio) { audio.pause(); return false; }
      fadeIn(audio);
      playingRef.current = true;
      return true;
    } catch (err) {
      if (audioRef.current === audio) {
        playingRef.current = false;
        // NotAllowedError just means "wait for a tap". Anything else is a file problem.
        if (!err || err.name !== 'NotAllowedError') console.warn('[music] could not play', music.src, err);
      }
      return false;
    }
  }, [fadeIn]);

  useEffect(() => {
    const audio = new Audio(music.src);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;
    audioRef.current = audio;

    if (music.startAt > 0) {
      audio.addEventListener('loadedmetadata', () => { audio.currentTime = music.startAt; }, { once: true });
    }

    const onError = () => {
      if (audioRef.current !== audio) return;
      playingRef.current = false;
      console.warn('[music] file not found or unreadable:', music.src);
    };
    audio.addEventListener('error', onError);

    // First tap / click / key press unlocks audio if autoplay was blocked.
    const events = ['pointerup', 'click', 'touchend', 'keydown'];
    const removeUnlock = () => events.forEach(e => window.removeEventListener(e, unlock));
    async function unlock() {
      const ok = await start(audio);
      if (ok) removeUnlock();
    }

    // try straight away
    start(audio).then(ok => {
      if (!ok && audioRef.current === audio) events.forEach(e => window.addEventListener(e, unlock));
    });

    // pause when she switches tabs or locks the phone, resume when she comes back
    const onVisibility = () => {
      if (document.hidden) {
        if (playingRef.current) audio.pause();
      } else if (playingRef.current) {
        audio.play().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(fadeRef.current);
      removeUnlock();
      document.removeEventListener('visibilitychange', onVisibility);
      audio.removeEventListener('error', onError);
      audio.pause();
      audioRef.current = null;
    };
  }, [start]);

  // Call this straight from a tap handler (the "Tap to begin" screen). play() runs inside her tap,
  // so every browser allows it.
  const startMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || playingRef.current) return;
    start(audio);
  }, [start]);

  return { startMusic };
}