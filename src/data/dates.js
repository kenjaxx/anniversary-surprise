// PERSONALIZE: the "Where to next?" date picker shown at the end of the site.
// Photos go in /public/dates/. If a photo is missing, a soft gradient card is shown instead.

const SENDER = 'Kenji';   // who receives the text
const FROM = 'Ehrica';    // who signs it

export const datePicker = {
  // International format, so it works on every phone. (09766379356 -> +639766379356)
  phone: '+639766379356',
  display: '+63 976 637 9356',

  heading: 'Where to next, love?',
  subheading: 'Choose our next date. I’ll take care of the rest.',

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
      line: 'The back row, a shared bucket of popcorn, and your hand in mine.',
      photo: '/dates/movie.jpg',
      from: '#2b1830',
      to: '#8a3550',
    },
    {
      title: 'Night drive',
      line: 'No destination. Just the city lights and a playlist for two.',
      photo: '/dates/drive.jpg',
      from: '#1b1d36',
      to: '#6b4a7a',
    },
    {
      title: 'Coffee date',
      line: 'A slow table for two, warm cups, and nowhere else to be.',
      photo: '/dates/coffee.jpg',
      from: '#4a2e2a',
      to: '#d39a6e',
    },
    {
      title: 'Food trip',
      line: 'Wherever the cravings lead us. You choose the first stop.',
      photo: '/dates/food.jpg',
      from: '#7a2e45',
      to: '#e08a6a',
    },
    {
      title: 'Chill night',
      line: 'Comfy clothes, takeout, and nothing on the schedule.',
      photo: '/dates/chill.jpg',
      from: '#2a1f3d',
      to: '#a8607a',
    },
    {
      title: 'Walk and talk',
      line: 'Golden hour, an easy pace, and all the little stories.',
      photo: '/dates/walk.jpg',
      from: '#b9704f',
      to: '#f0c9a0',
    },
  ],

  // The text that opens in her messages app.
  message: (option, when) =>
    `Hi ${SENDER} ♡ For our next date, I pick: ${option.title}. ${when.phrase} Can’t wait! – ${FROM}`,
};