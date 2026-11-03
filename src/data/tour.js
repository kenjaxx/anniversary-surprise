// Settings for the automatic guided scroll.
export const tour = {
  enabled: true,       // false = no auto-scroll at all (back to normal scrolling)
  pace: 0.85,          // 1 = normal. Lower = faster (0.8), higher = slower (1.2).
  flipGapMs: 2800,     // how long she gets to read each flip card
  wordMs: 180,         // reading time per word for the letter (higher = slower)
  photoBaseMs: 2800,   // minimum time each photo stays open (includes the transition)
  photoWordMs: 240,    // extra time per word of that photo's caption
};