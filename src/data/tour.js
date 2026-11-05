// Settings for the automatic guided scroll.
export const tour = {
  enabled: true,       // false = no auto-scroll at all (back to normal scrolling)
  pace: 0.85,          // 1 = normal. Lower = faster (0.8), higher = slower (1.2).

  envelopeOpenDelayMs: 5600,

  flipGapMs: 4200,     // how long she gets to read each flip card
  wordMs: 180,         // reading time per word (higher = slower)
  photoBaseMs: 2800,   // minimum time each photo stays open (includes the transition)
  photoWordMs: 240,    // extra time per word of that photo's caption

  // LETTER (the tour scrolls it in 3 phases: soft unfold, slow read, soft fold shut)
  // Reading time = words x wordMs x letterReadFactor + 6000. (Reading speed is unchanged.)
  letterReadFactor: 1.8,
  letterOpenMs: 6000,  // how long the unfold takes (higher = slower and softer)
  letterCloseMs: 5500, // how long the fold-shut at the end takes (higher = slower)
  // These two must match READ in Letter.jsx (0.13 and 0.88). Don't change them unless you change that file.
  letterOpenAt: 0.13,
  letterReadEnd: 0.88,

  // "VIEW ALL PHOTOS" preview: the rope of photos glides through a few of them first.
  // The last photo it lands on is the FIRST one shown after that (1/16).
  browseLeadMs: 1600,  // pause after the page opens, before the first glide
  browseCount: 5,      // how many photos it glides through
  browseGapMs: 650,    // time between each photo (lower = faster)
};