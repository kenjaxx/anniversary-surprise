// PERSONALIZE: the "Where to next?" date picker shown at the end of the site.
// Photos go in /public/dates/. If a photo is missing, a soft gradient card is shown instead.
//
// Each option has:
//   title    : short name (used on the gallery card and in the text message)
//   emoji    : shown on the confirmation card and added to the text message
//   line     : the sweet caption under the card while she is choosing
//   doneLine : the love note she sees right after she picks it
//   theme    : matches a [data-theme='...'] block and a .t-... layer in datePicker.css
//   text     : color of the card labels drawn inside the gallery (dark themes = light text, and the reverse)
//   font     : font of those card labels
//   deco     : little glyphs that float in the background of that theme

const SENDER = 'Kenji';   // who receives the text
const FROM = 'Ehrica';    // who signs it

export const datePicker = {
  sender: SENDER,

  // International format, so it works on every phone. (09766379356 -> +639766379356)
  phone: '+639766379356',
  display: '+63 976 637 9356',

  heading: 'Where to next, love?',

  // AUTO PREVIEW: when the picker opens, the cards hover one by one by themselves,
  // then the "now you choose" popup appears.
  autoPlay: {
    startMs: 1800,   // wait after it opens, before the first card moves
    dwellMs: 1000,   // how long each card stays on screen so she can read it (1 second)
    glideMs: 700,    // time the gallery needs to slide to the next card
    nowMs: 5200,     // how long the "now you choose" popup stays
  },

  // The soft popup shown after every card has been hovered.
  nowChoose: {
    eyebrow: 'your turn',
    title: 'Now you choose, love ♡',
    line: 'Every one of them is already yours. Just pick the one your heart wants.',
  },

  // When she can say she wants it.
  whenOptions: [
    { label: 'This weekend', phrase: 'Let’s do it this weekend.' },
    { label: 'Next week', phrase: 'Sometime next week?' },
    { label: 'You plan it', phrase: 'You pick the day, I’m free.' },
  ],

  // The six cards on the circular gallery.
  options: [
    {
      title: 'Movie night',
      emoji: '🍿',
      line: 'The back row, a shared bucket of popcorn, and your hand in mine. 🍿💞',
      doneLine: 'I’ll save you the best seat, and the last handful of popcorn. 🎬',
      photo: '/dates/movie.jpg',
      from: '#2b1830',
      to: '#8a3550',
      theme: 'movie',
      text: '#ffffff',
      font: "600 28px 'DM Sans', sans-serif",
      deco: ['✦', '✧', '♡'],
    },
    {
      title: 'Night drive',
      emoji: '🌃',
      line: 'No destination. Just the city lights and a playlist for two. 🌃🎶',
      doneLine: 'Windows down, our songs on, and nowhere to be but next to you. 🚗💨',
      photo: '/dates/drive.jpg',
      from: '#1b1d36',
      to: '#6b4a7a',
      theme: 'drive',
      text: '#e8fbff',
      font: "700 28px 'DM Sans', sans-serif",
      deco: ['✦', '✧', '+'],
    },
    {
      title: 'Coffee date',
      emoji: '☕',
      line: 'A slow table for two, warm cups, and nowhere else to be. ☕🤎',
      doneLine: 'Warm cups, slow talks, and you across the table. I can already taste it. 🥐',
      photo: '/dates/coffee.jpg',
      from: '#4a2e2a',
      to: '#d39a6e',
      theme: 'coffee',
      text: '#3b2a22',
      font: "italic 500 30px 'Playfair Display', serif",
      deco: ['❦', '❧', '✿'],
    },
    {
      title: 'Food trip',
      emoji: '🍜',
      line: 'Wherever the cravings lead us. You choose the first stop. 🍜😋',
      doneLine: 'Come hungry. I’ll follow wherever your cravings take us. 🍢',
      photo: '/dates/food.jpg',
      from: '#7a2e45',
      to: '#e08a6a',
      theme: 'food',
      text: '#ffffff',
      font: "400 34px 'Bebas Neue', Impact, sans-serif",
      deco: ['✸', '★', '✺'],
    },
    {
      title: 'Chill night',
      emoji: '🛋️',
      line: 'Comfy clothes, takeout, and nothing on the schedule. 🛋️💕',
      doneLine: 'Blankets, takeout, and zero plans. Honestly my favorite kind of night. 🧸',
      photo: '/dates/chill.jpg',
      from: '#2a1f3d',
      to: '#a8607a',
      theme: 'chill',
      text: '#fff3ea',
      font: "italic 500 30px 'Playfair Display', serif",
      deco: ['♡', '♥', '✦'],
    },
    {
      title: 'Walk and talk',
      emoji: '🌅',
      line: 'Golden hour, an easy pace, and all the little stories. 🌅🤍',
      doneLine: 'Golden hour looks better with you in it. Let’s take the long way. 🍃',
      photo: '/dates/walk.jpg',
      from: '#b9704f',
      to: '#f0c9a0',
      theme: 'walk',
      text: '#fff8ee',
      font: "italic 500 30px 'Playfair Display', serif",
      deco: ['✧', '♡', '·'],
    },
  ],

  // The text that opens in her messages app (or gets copied on a computer).
  message: (option, when) =>
    `Hi ${SENDER} ♡ For our next date, I pick: ${option.title} ${option.emoji} ${when.phrase} Can’t wait! 🥰 – ${FROM}`,
};