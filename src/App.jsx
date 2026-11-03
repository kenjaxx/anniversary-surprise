import { useEffect, useRef, useState } from 'react';
import { content, ENVELOPE_ANIMATION_MS } from './data/content.js';
import { scrollTo, scrollToElement } from './utils/scroll.js';
import { fireConfetti } from './utils/confetti.js';
import useReveal from './hooks/useReveal.js';
import useScrollProgress from './hooks/useScrollProgress.js';
import useMusic from './hooks/useMusic.js';

import Petals from './components/Petals.jsx';
import Topbar from './components/Topbar.jsx';
import Hero from './components/Hero.jsx';
import OneYear from './components/OneYear.jsx';
import Celebration from './components/Celebration.jsx';
import Story from './components/Story.jsx';
import Thanks from './components/Thanks.jsx';
import Letter from './components/Letter.jsx';
import Closing from './components/Closing.jsx';

function App() {
  const [opened, setOpened] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
  const stageRef = useRef(null);
  const openTimer = useRef(null);

  const progressRef = useScrollProgress();
  const { musicOn, musicStatus, toggleMusic } = useMusic();
  useReveal([opened, celebrated]);

  useEffect(() => () => clearTimeout(openTimer.current), []);

  const openEnvelope = () => {
    if (opened) return;
    setOpened(true);
    scrollToElement(stageRef.current, { block: 'center', duration: 1200 });
    clearTimeout(openTimer.current);
    openTimer.current = setTimeout(() => scrollTo('together'), ENVELOPE_ANIMATION_MS);
  };

  const celebrate = () => {
    setCelebrated(true);
    fireConfetti();
    setTimeout(() => scrollTo('celebration'), 250);
  };

  // If the page is open when the clock hits the anniversary, celebrate automatically.
  useEffect(() => {
    const ms = new Date(content.anniversaryDate).getTime() - Date.now();
    if (ms <= 0 || ms > 2147483647) return undefined;
    const id = setTimeout(celebrate, ms);
    return () => clearTimeout(id);
  }, []);

  const replay = () => {
    clearTimeout(openTimer.current);
    setCelebrated(false);
    setOpened(false);
    scrollTo('top');
  };

  return (
    <main>
      <div className="scroll-progress" ref={progressRef} />
      <Petals />
      <div className="ambient ambient-one" data-parallax="0.1" />
      <div className="ambient ambient-two" data-parallax="0.16" />

      <Topbar musicOn={musicOn} musicStatus={musicStatus} onToggleMusic={toggleMusic} />
      <Hero opened={opened} onOpen={openEnvelope} stageRef={stageRef} />
      <OneYear onCelebrate={celebrate} />
      {celebrated && <Celebration />}
      <Story />
      <Thanks />
      <Letter />
      <Closing onReplay={replay} />

      <div className="tiny-footer"><span>♡</span> a little website, with a lot of heart <span>♡</span></div>
    </main>
  );
}

export default App;