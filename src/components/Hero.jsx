import { useEffect, useState } from 'react';
import { content } from '../data/content.js';
import Typed from './Typed.jsx';
import GenerativeTree from './GenerativeTree.jsx';

// stage 0: title is being written
// stage 1: paragraph is being written
// stage 2: handwritten note is being written
// stage 3: everything written -> onTyped() tells App the text is done
//
// `sequential` = phone / single display: the text goes first, the tree waits for it.
// On web (sequential = false) there are no waits: the text and the tree start together.
export default function Hero({ opened, onOpen, stageRef, ready = true, onTyped, sequential = false }) {
  const [stage, setStage] = useState(0);
  const advance = n => () => setStage(s => Math.max(s, n));
  const typedDone = stage >= 3;

  // Tell the app once, when the last line has been written.
  useEffect(() => {
    if (typedDone) onTyped?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typedDone]);

  // Phone: tapping the tree before the text is written does nothing (the text always goes first).
  // Web: the tree can be started at any time.
  const openTree = () => {
    if (sequential && !typedDone && !opened) return;
    onOpen();
  };

  const handleKeyDown = event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openTree();
    }
  };

  // small breathing pauses only on phones
  const d = ms => (sequential ? ms : 0);

  return (
    <section className="hero section-wrap" id="top">
      <div className="hero-copy reveal">
        <span className="eyebrow">
          <span className="tiny-heart">♥</span>
          1 year, and counting
        </span>

        <h1 className="hero-title">
          <Typed
            text={content.openingLine}
            run={ready}
            delay={d(500)}
            speed={75}
            onDone={advance(1)}
          />
        </h1>

        <svg
          className={`hero-flourish${stage >= 1 ? ' on' : ''}`}
          viewBox="0 0 220 14"
          aria-hidden="true"
        >
          <path d="M2 9 C 40 2, 70 14, 110 7 S 180 3, 218 9" pathLength="1" />
        </svg>

        <p className="hero-lead">
          <Typed
            text="I made you a tiny corner of the internet to say thank you for this whole year."
            run={ready && stage >= 1}
            delay={d(300)}
            speed={28}
            onDone={advance(2)}
          />
        </p>

        <div className="handwritten hero-note">
          <Typed
            text="made with love, just for you"
            run={ready && stage >= 2}
            delay={d(400)}
            speed={50}
            onDone={advance(3)}
          />{' '}
          <span className={`note-heart${stage >= 3 ? ' on' : ''}`}>♡</span>
        </div>
      </div>

      <div
        ref={stageRef}
        className={`tree-stage reveal${opened ? ' is-open' : ''}${typedDone || !sequential ? ' is-ready' : ''}`}
        onClick={openTree}
        role="button"
        tabIndex={0}
        aria-label="Tap to make our tree grow"
        onKeyDown={handleKeyDown}
      >
        <div className="tree-halo" aria-hidden="true" />
        <div className="sparkle s1" aria-hidden="true">✦</div>
        <div className="sparkle s2" aria-hidden="true">♡</div>

        <div className="tree-canvas-wrap">
          <GenerativeTree grow={opened} />
        </div>

        <span className="tree-hint">
          {opened ? 'growing, just like us ♡' : 'tap to watch it grow'}
        </span>
      </div>

      <div className="hero-flower flower-a" aria-hidden="true">✿</div>
      <div className="hero-flower flower-b" aria-hidden="true">✾</div>
    </section>
  );
}