import { Pause, Play, RotateCcw, SkipForward, X } from 'lucide-react';

export default function TourBar({
  status, index, total, hidden,
  onStart, onPause, onResume, onSkip, onStop, onRestart,
}) {
  // Right after she taps the envelope, the tour is about to start by itself.
  if (hidden) return null;

  // Not started yet (also what she sees after a reload): a button to begin the tour.
  if (status === 'idle') {
    return (
      <button className="tour-fab tour-fab-start" onClick={onStart} aria-label="Play the automatic tour">
        <Play size={15} /> <span>Play auto tour</span>
      </button>
    );
  }

  // She chose to scroll herself: leave a small button to bring the tour back.
  if (status === 'stopped') {
    return (
      <button className="tour-fab" onClick={onResume} aria-label="Resume the guided tour">
        <Play size={15} /> <span>Auto-play</span>
      </button>
    );
  }

  const playing = status === 'playing';
  const done = status === 'done';
  const note = playing ? 'Sit back, I’ll show you around ♡' : done ? 'That’s everything, my love ♡' : 'Paused. Scroll freely';

  return (
    <div className="tour-bar" role="group" aria-label="Guided tour controls">
      <button className="tour-main" onClick={playing ? onPause : done ? onRestart : onResume}>
        {playing ? <Pause size={16} /> : done ? <RotateCcw size={16} /> : <Play size={16} />}
        <span>{playing ? 'Pause' : done ? 'Watch again' : 'Resume'}</span>
      </button>

      <span className="tour-note">{note}</span>

      <span className="tour-dots" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <i key={i} className={done || i <= index ? 'on' : ''} />
        ))}
      </span>

      {!done && (
        <button className="tour-icon" onClick={onSkip} aria-label="Skip to the next part">
          <SkipForward size={16} />
        </button>
      )}
      <button className="tour-icon" onClick={onStop} aria-label="I’ll scroll by myself">
        <X size={16} />
      </button>
    </div>
  );
}