import { useEffect, useRef, useState } from 'react';
import { content, ENVELOPE_ANIMATION_MS } from './data/content.js';
import { music } from './data/music.js';
import { tour as tourCfg } from './data/tour.js';
import { scrollTo, scrollToElement } from './utils/scroll.js';
import { fireConfetti } from './utils/confetti.js';
import useReveal from './hooks/useReveal.js';
import useScrollProgress from './hooks/useScrollProgress.js';
import useMusic from './hooks/useMusic.js';
import useAutoTour from './hooks/useAutoTour.js';

import IntroGate from './components/IntroGate.jsx';
import Petals from './components/Petals.jsx';
import Topbar from './components/Topbar.jsx';
import Hero from './components/Hero.jsx';
import OneYear from './components/OneYear.jsx';
import Celebration from './components/Celebration.jsx';
import Story from './components/Story.jsx';
import Thanks from './components/Thanks.jsx';
import Letter from './components/Letter.jsx';
import Closing from './components/Closing.jsx';
import TourBar from './components/TourBar.jsx';

const GATE_FADE_WAIT_MS = 700; // let the "Tap to begin" screen mostly fade out before the show starts

function App() {
  const [opened, setOpened] = useState(false);
  const [starting, setStarting] = useState(false); // envelope tapped, tour about to begin
  const [celebrated, setCelebrated] = useState(false);
  const celebratedRef = useRef(false);
  const stageRef = useRef(null);
  const openTimer = useRef(null);
  const gateTimer = useRef(null);

  const progressRef = useScrollProgress();
  const { musicOn, musicStatus, toggleMusic, startMusic } = useMusic();
  useReveal([opened, celebrated]);

  // After a reload, always begin at the top (browsers otherwise restore the old scroll position).
  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, []);

  // Pressing "Celebrate us" yourself (scrolls to the card)
  const celebrate = () => {
    celebratedRef.current = true;
    setCelebrated(true);
    fireConfetti();
    setTimeout(() => scrollTo('celebration'), 250);
  };

  // Used by the guided tour: same thing, but the tour does its own scrolling
  const celebrateQuietly = () => {
    celebratedRef.current = true;
    setCelebrated(true);
    fireConfetti();
  };

  const tour = useAutoTour({
    celebrate: celebrateQuietly,
    isCelebrated: () => celebratedRef.current,
  });

  useEffect(() => () => {
    clearTimeout(openTimer.current);
    clearTimeout(gateTimer.current);
  }, []);

  const openEnvelope = () => {
    if (opened) return;
    setOpened(true);
    setStarting(true);
    scrollToElement(stageRef.current, { block: 'center', duration: 1000 });
    clearTimeout(openTimer.current);
    openTimer.current = setTimeout(() => {
      setStarting(false);
      if (tourCfg.enabled) tour.start();
      else scrollTo('together');
    }, ENVELOPE_ANIMATION_MS);
  };

  // The "Play auto tour" button: opens the envelope first if she has not yet.
  const startTour = () => {
    if (!opened) openEnvelope();
    else tour.restart();
  };

  // Her tap on "Tap to begin": the music starts right inside the tap (browsers require that),
  // then, once the gate has faded, the envelope opens and the tour plays by itself.
  const beginFromGate = () => {
    startMusic();
    if (!tourCfg.enabled) return;
    clearTimeout(gateTimer.current);
    gateTimer.current = setTimeout(openEnvelope, GATE_FADE_WAIT_MS);
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
    clearTimeout(gateTimer.current);
    tour.reset();
    window.dispatchEvent(new CustomEvent('tour:reset'));
    celebratedRef.current = false;
    setCelebrated(false);
    setStarting(false);
    setOpened(false);
    scrollTo('top');
  };

  return (
    <main>
      {music.gate && <IntroGate onEnter={beginFromGate} />}

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

      {tourCfg.enabled && (
        <TourBar
          status={tour.status}
          index={tour.index}
          total={tour.total}
          hidden={starting}
          onStart={startTour}
          onPause={tour.pause}
          onResume={tour.resume}
          onSkip={tour.skip}
          onStop={tour.stop}
          onRestart={tour.restart}
        />
      )}
    </main>
  );
}

export default App;