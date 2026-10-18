// PERSONALIZE THIS FILE: replace bracketed placeholders and add photos to /public/photos.

export const content = {
  partnerNickname: '[their nickname]',
  senderName: '[your name]',

  // Our start moment, pinned to Philippine time (UTC+8) so it's exact on any device.
  startDate: '2025-10-19T00:00:00+08:00',
  // The exact moment we hit 1 year.
  anniversaryDate: '2026-10-19T00:00:00+08:00',

  openingLine: 'Happy 1 year, my love...',
  headline: 'One whole year of you and me.',
  celebrateMessage: 'Thank you for every single day of this year.',

  thanks: [
    { icon: '♡', title: 'For your heart', text: 'Thank you for being so kind to me, even on my hardest days.' },
    { icon: '☼', title: 'For your smile', text: 'It still changes my entire mood, a year later.' },
    { icon: '✦', title: 'For your patience', text: 'Thank you for understanding me, even when I’m difficult. 🤭' },
    { icon: '♡', title: 'For the little things', text: 'I notice them all, even when you don’t think I do.' },
  ],

  memories: [
    { title: 'When we first met', date: '[add date]', text: '[Add a little story about how you met.]', photo: '/photos/memory-1.jpg' },
    { title: 'Our first date', date: '[add date]', text: '[What do you remember most about that day?]', photo: '/photos/memory-2.jpg' },
    { title: 'A favorite moment', date: '[add date]', text: '[A tiny moment you still think about.]', photo: '/photos/memory-3.jpg' },
    { title: 'This past year', date: '[add date]', text: '[A memory from this year that means a lot.]', photo: '/photos/memory-4.jpg' },
  ],

  letter: [
    'Thank you for this past year. Thank you for the laughs, the patience, the comfort, and for choosing me on the easy days and the hard ones.',
    'You made a normal year feel like the best one I’ve had. [Add something specific you’re grateful for, a moment, a habit, a way they showed up for you.]',
    'I’m so proud of us, and so grateful for you. I can’t wait for year two, and every year after.',
  ],

  closing: 'Thank you for being my person. Here’s to year two: more memories, more adventures, more laughter.',
  secret: 'If I could choose all over again, I’d choose you. Every single time. ♡',
};

export const sweetNotes = [
  'You make the little things feel big.',
  'I’m always on your team.',
  'You are one of my favorite parts of every day.',
  'A tiny reminder: you are loved.',
  'Thank you for choosing me, again and again.',
];

// Used when a local photo in /public/photos is missing.
export const photoFallbacks = [
  'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85',
];

export const gallery = [
  { src: '/photos/gallery-1.jpg', fallback: photoFallbacks[4], caption: 'Better together ♡' },
  { src: '/photos/gallery-2.jpg', fallback: photoFallbacks[0], caption: 'A little moment, forever kept' },
  { src: '/photos/gallery-3.jpg', fallback: photoFallbacks[5], caption: 'Our kind of happy' },
  { src: '/photos/gallery-4.jpg', fallback: photoFallbacks[1], caption: 'One for the memory book' },
  { src: '/photos/gallery-5.jpg', fallback: photoFallbacks[2], caption: 'Wherever we go' },
  { src: '/photos/gallery-6.jpg', fallback: photoFallbacks[3], caption: 'And a thousand more' },
];

// How long the envelope animation needs before we scroll to the next section.
export const ENVELOPE_ANIMATION_MS = 2800;