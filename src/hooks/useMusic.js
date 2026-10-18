import { useRef, useState } from 'react';

export default function useMusic(src = '/music.mp3') {
  const [musicOn, setMusicOn] = useState(false);
  const [musicStatus, setMusicStatus] = useState('');
  const audioRef = useRef(null);

  const toggleMusic = async () => {
    if (musicOn && audioRef.current) {
      audioRef.current.pause();
      setMusicOn(false);
      setMusicStatus('');
      return;
    }
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.loop = true;
      audioRef.current.addEventListener('error', () => { setMusicOn(false); setMusicStatus('Add music.mp3'); });
    }
    try { await audioRef.current.play(); setMusicOn(true); setMusicStatus(''); }
    catch { setMusicOn(false); setMusicStatus('Add music.mp3'); }
  };

  return { musicOn, musicStatus, toggleMusic };
}