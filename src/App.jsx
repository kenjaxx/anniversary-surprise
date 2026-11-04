import { useCallback, useEffect, useRef, useState } from 'react';
import { content, ENVELOPE_ANIMATION_MS } from './data/content.js';
import { music } from './data/music.js';
import { tour as tourCfg } from './data/tour.js';
import { scrollTo, scrollToElement } from './utils/scroll.js';
import { fireConfetti } from './utils/confetti.js';
import useReveal from './hooks/useReveal.js';
import useScrollProgress from './hooks/useScrollProgress.js';
import useMusic from './hooks/useMusic.js';
import useAutoTour from './hooks/useAutoTour.js';
import useSingleDisplay from './hooks/useSingleDisplay.js';

import IntroGate, { GATE_CLOSE_MS, GATE_REDUCED_MS } from './components/IntroGate.jsx';
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

// The pause between the intro card being completely gone and the hero text + tree beginning.
// The gate itself takes GATE_CLOSE_MS (set in IntroGate.jsx, and matched in gate.css).
const START_DELAY_MS = 1000;

// PHONE / SINGLE DISPLAY ONLY: pause after the last line is written, before the tree starts growing.
const TREE_AFTER_TYPING_MS = 1400;

// PHONE / SINGLE DISPLAY ONLY: safety net if the text never reports "done", grow the tree anyway.
const TYPING_FALLBACK_MS = 30000;

// Extra time she gets to look at the finished text and tree, AFTER both are done,
// before the page scrolls down to the next section. 1000 to 2000 is comfortable.
const TOUR_PAD_MS = 1500;

function App() {
  const [opened, setOpened] = useState(false);
  const [starting, setStarting] = useState(false); // gate tapped / tree tapped, tour about to begin
  const [celebrated, setCelebrated] = useState(false);
  const [introDone, setIntroDone] = useState(!music.gate); // hero text waits for the gate to leave
  const celebratedRef = useRef(false);
  const stageRef = useRef(null);
  const openTimer = useRef(null);
  const gateTimer = useRef(null);
  const introTimer = useRef(null);
  const padTimer = useRef(null);   // the extra pause before the tour scrolls on
  const autoRef = useRef(false);   // true = the tree should grow by itself (she came in through the gate)
  const openRef = useRef(null);    // always the latest openEnvelope
  const startRef = useRef(null);   // always the latest maybeStartTour
  const typedRef = useRef(false);  // the hero text has been fully written
  const treeDoneRef = useRef(false); // the tree has finished growing

  const single = useSingleDisplay(); // true on phones / single-column layouts
  const singleRef = useRef(single);
  singleRef.current = single;

  const progressRef = useScrollProgress();
  const { startMusic } = useMusic(); // the song always plays: there is no on/off button any more
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
    clearTimeout(introTimer.current);
    clearTimeout(padTimer.current);
  }, []);

  // The tour moves on only when BOTH the tree has finished growing AND the text has been written.
  // Then it waits TOUR_PAD_MS more, so the finished hero can be enjoyed before the page scrolls down.
  const maybeStartTour = () => {
    if (!treeDoneRef.current || !typedRef.current) return;
    treeDoneRef.current = false; // run only once per growth
    clearTimeout(padTimer.current);
    padTimer.current = setTimeout(() => {
      setStarting(false);
      if (tourCfg.enabled) tour.start();
      else scrollTo('together');
    }, TOUR_PAD_MS);
  };
  startRef.current = maybeStartTour;

  // "Opening" means: the tree starts growing, then the tour moves on.
  const openEnvelope = () => {
    if (opened) return;
    autoRef.current = false;
    treeDoneRef.current = false;
    clearTimeout(gateTimer.current);
    clearTimeout(padTimer.current);
    setOpened(true);
    setStarting(true);

    // Phone: bring the tree to the middle of the screen (it sits below the text).
    // Web: the text and the tree are side by side, so the page stays where it is.
    if (singleRef.current) {
      scrollToElement(stageRef.current, { block: 'center', duration: 1000 });
    }

    clearTimeout(openTimer.current);
    // when the tree has finished growing (and the text is written), the tour moves on
    openTimer.current = setTimeout(() => {
      treeDoneRef.current = true;
      startRef.current?.();
    }, ENVELOPE_ANIMATION_MS);
  };
  openRef.current = openEnvelope;

  // The "Play auto tour" button: grows the tree first if she has not yet.
  const startTour = () => {
    if (!opened) openEnvelope();
    else tour.restart();
  };

  // Called by Hero once ALL the text has been written.
  const handleTyped = useCallback(() => {
    typedRef.current = true;

    // Web: the tree is already growing next to the text, so just check if the tour can move on.
    if (!singleRef.current) {
      startRef.current?.();
      return;
    }

    // Phone: if she came in through the gate, the tree now grows by itself (after a short pause).
    if (!autoRef.current) return;
    clearTimeout(gateTimer.current);
    gateTimer.current = setTimeout(() => openRef.current?.(), TREE_AFTER_TYPING_MS);
  }, []);

  // Her tap on "Tap to begin": the music starts right inside the tap (browsers require that).
  const beginFromGate = () => {
    startMusic();

    const isSingle = singleRef.current;

    // The gate takes GATE_CLOSE_MS to close (a quick fade if she prefers reduced motion).
    // The text and the tree then wait START_DELAY_MS more, on the empty cream page, before they begin.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const startIn = (reduce ? GATE_REDUCED_MS : GATE_CLOSE_MS) + START_DELAY_MS;

    clearTimeout(introTimer.current);
    introTimer.current = setTimeout(() => setIntroDone(true), startIn);

    if (!tourCfg.enabled) return;
    // Keep the tour controls out of sight from this very first tap (no flash while the gate closes).
    setStarting(true);
    autoRef.current = true;

    clearTimeout(gateTimer.current);
    if (isSingle) {
      // safety net only: normally handleTyped starts the tree long before this
      gateTimer.current = setTimeout(() => {
        if (autoRef.current) openRef.current?.();
      }, TYPING_FALLBACK_MS);
    } else {
      // Web: the tree starts growing at the same moment the text starts being written.
      gateTimer.current = setTimeout(() => {
        if (autoRef.current) openRef.current?.();
      }, startIn);
    }
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
    clearTimeout(padTimer.current);
    autoRef.current = false;
    treeDoneRef.current = false;
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

      <Topbar />
      <Hero
        opened={opened}
        onOpen={openEnvelope}
        stageRef={stageRef}
        ready={introDone}
        onTyped={handleTyped}
        sequential={single}
      />
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