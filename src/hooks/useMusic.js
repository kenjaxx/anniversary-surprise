import { useCallback, useEffect, useRef, useState } from 'react';
import { music } from '../data/music.js';

// Tries to autoplay on load. If the browser blocks it (most do until a tap),
// the music starts on her first tap, click or key press, or when the "Tap to begin" screen calls startMusic().
// She can pause it with the music button, and it stays paused after that.
export default function useMusic() {
  const [musicOn, setMusicOn] = useState(false);
  const [musicStatus, setMusicStatus] = useState('');
  const audioRef = useRef(null);
  const userPaused = useRef(false);
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
      setMusicOn(true);
      setMusicStatus('');
      return true;
    } catch (err) {
      if (audioRef.current !== audio) return false;
      playingRef.current = false;
      setMusicOn(false);
      // NotAllowedError = browser wants a tap first. Anything else = file problem.
      setMusicStatus(err && err.name === 'NotAllowedError' ? 'Tap for music' : 'Add song file');
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
      setMusicOn(false);
      setMusicStatus('Add song file');
    };
    audio.addEventListener('error', onError);

    // First tap / click / key press unlocks audio if autoplay was blocked.
    const events = ['pointerup', 'click', 'touchend', 'keydown'];
    const removeUnlock = () => events.forEach(e => window.removeEventListener(e, unlock));
    async function unlock() {
      if (userPaused.current) return;
      const ok = await start(audio);
      if (ok) removeUnlock();
    }

    // 1) try straight away (works on some desktop browsers / when she has visited before)
    start(audio).then(ok => {
      if (!ok && audioRef.current === audio) events.forEach(e => window.addEventListener(e, unlock));
    });

    // pause when she switches tabs or locks the phone, resume when she comes back
    const onVisibility = () => {
      if (document.hidden) {
        if (playingRef.current) audio.pause();
      } else if (playingRef.current && !userPaused.current) {
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

  // Call this straight from a tap handler (the "Tap to begin" screen). play() runs inside her tap, so every browser allows it.
  const startMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || playingRef.current) return;
    userPaused.current = false;
    start(audio);
  }, [start]);

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (musicOn) {
      userPaused.current = true;
      playingRef.current = false;
      clearInterval(fadeRef.current);
      audio.pause();
      setMusicOn(false);
      setMusicStatus('');
    } else {
      userPaused.current = false;
      await start(audio);
    }
  };

  return { musicOn, musicStatus, toggleMusic, startMusic };
}