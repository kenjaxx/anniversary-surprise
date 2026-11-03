// PICK YOUR SONG HERE.
// 1) Put your audio file in  public/music/  (create the folder if needed)
// 2) Make sure the file name below matches it exactly (Netlify is case-sensitive: Our-Song.mp3 is not our-song.mp3)
// 3) Keep the file small: an mp3 around 128 kbps is plenty (about 3 to 4 MB for a normal song)
export const music = {
  src: '/music/our-song.mp3',   // ← your file: public/music/our-song.mp3
  title: '[Song title]',        // ← shown when she hovers the music button
  artist: '[Artist]',
  volume: 0.6,                  // 0 (silent) to 1 (full). 0.5 to 0.7 is comfortable. (iPhones ignore this and use the phone volume)
  startAt: 0,                   // second to start from, e.g. 42 to begin at the chorus

  // true  = a "Tap to begin" screen opens the site. Her tap starts the music, so it plays on EVERY phone and browser.
  // false = no screen. The music then starts on her first tap anywhere, which browsers sometimes won't allow if she only scrolls.
  gate: true,
};