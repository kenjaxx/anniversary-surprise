// Settings for the automatic guided scroll.
export const tour = {
  enabled: true,       // false = no auto-scroll at all (back to normal scrolling)
  pace: 0.85,          // 1 = normal. Lower = faster (0.8), higher = slower (1.2).

  // How long after her tap on the seal ("Tap to open") the envelope on the first screen starts opening.
  // The greeting card needs about 4.3 seconds to open and fade away. The envelope should only start
  // opening AFTER that, so she actually sees it open. 5600 = the card is gone, then a short pause
  // of about 1.3s on the closed envelope, then it opens. Raise it for a longer pause, lower it for a shorter one.
  // (Not affected by "pace". Scrolling to the next section still starts right after the envelope has opened.)
  envelopeOpenDelayMs: 5600,

  flipGapMs: 2800,     // how long she gets to read each flip card
  wordMs: 180,         // reading time per word for the letter (higher = slower)
  photoBaseMs: 2800,   // minimum time each photo stays open (includes the transition)
  photoWordMs: 240,    // extra time per word of that photo's caption
};