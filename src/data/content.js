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

  // The flip cards. Front = a photo that symbolizes the feeling. Back = why.
  // Photos go in /public/photos/feelings/. If a photo is missing, the gradient + glyph show instead.
  feelings: [
    {
      word: 'Calm',
      glyph: '🌊',
      from: '#dcebf0',
      to: '#b3d0da',
      photo: '/photos/feelings/calm.jpg',
      title: 'You make me feel calm',
      text: 'No matter how loud or heavy my day gets, being with you slows everything down. You are my quiet place.',
    },
    {
      word: 'Safe',
      glyph: '🏡',
      from: '#fbe6cf',
      to: '#f2c9a4',
      photo: '/photos/feelings/safe.jpg',
      title: 'You make me feel safe',
      text: 'With you, I can just be myself. You feel like home, and I never have to pretend.',
    },
    {
      word: 'Joy',
      glyph: '☀️',
      from: '#fff0b8',
      to: '#ffc978',
      photo: '/photos/feelings/joy.jpg',
      title: 'You make me feel happy',
      text: 'You turn ordinary moments into my favorite ones. Somehow I’m always smiling around you.',
    },
    {
      word: 'Loved',
      glyph: '💗',
      from: '#fbd5dc',
      to: '#f2a3b4',
      photo: '/photos/feelings/loved.jpg',
      title: 'You make me feel loved',
      text: 'The way you care, even in the little things, makes me feel chosen every single day.',
    },
  ],

  // The drift wall. Each moment: a photo, a title, a date and a short caption.
  // Photos go in /public/photos. Leave date as '' to hide it in the popup.
  moments: [
    {
      title: 'Our first date',
      date: '',
      caption: 'I was nervous and smiling the whole time. I didn’t know it yet, but this was the start of my favorite chapter.',
      photo: '/photos/memory-1.jpg',
    },
    {
      title: 'Just us being us',
      date: '',
      caption: 'No plans, no pressure, just you and me. Somehow the simple days are the ones I treasure most.',
      photo: '/photos/memory-2.jpg',
    },
    {
      title: 'After our jog',
      date: '',
      caption: 'Sweaty, tired, and still the happiest I could be. Everything is better when I’m next to you.',
      photo: '/photos/memory-3.jpg',
    },
    {
      title: 'The day we became official',
      date: '',
      caption: 'The day you became mine, and I became yours. Best “yes” I’ve ever heard.',
      photo: '/photos/memory-4.jpg',
    },
    {
      title: 'Somewhere we went together',
      date: '',
      caption: 'Wherever we go, you make it feel like the best place in the world.',
      photo: '/photos/memory-5.jpg',
    },
    {
      title: 'The silly one',
      date: '',
      caption: 'You’re the only person who can make me laugh like this. Never change, please.',
      photo: '/photos/memory-6.jpg',
    },
    {
      title: 'Graduation day',
      date: '',
      caption: 'We did it! So proud of you, and so happy I got to celebrate this day with you.',
      photo: '/photos/memory-7.jpg',
    },
    {
      title: 'Graduation day, part two',
      date: '',
      caption: 'One more for the memory book. All those late nights led to this, and I’m so glad we were in it together.',
      photo: '/photos/memory-8.jpg',
    },
    {
      title: 'Photobooth us',
      date: '',
      caption: 'Every pose, every silly face, every frame is a little piece of us I get to keep forever.',
      photo: '/photos/memory-9.jpg',
    },
    {
      title: 'Pungko-pungko bonding',
      date: '',
      caption: 'Little stools, street food, and your cravings leading the way. Nothing fancy, and somehow one of my favorite dates.',
      photo: '/photos/memory-10.jpg',
    },
    {
      title: 'Casual date at my favorite coffee',
      date: '',
      caption: 'My favorite coffee spot got even better with you across the table. Warm cups, easy talks, and no need to rush.',
      photo: '/photos/memory-11.jpg',
    },
    {
      title: 'Midnight cinema with Abiah',
      date: '',
      caption: 'A late movie, good company, and you beside me. Sleepy eyes, but I’d stay up for this any night.',
      photo: '/photos/memory-12.jpg',
    },
    {
      title: 'Unexpected shopping',
      date: '',
      caption: 'We only meant to look around, and the day turned into a favorite anyway. Time just flies when I’m with you.',
      photo: '/photos/memory-13.jpg',
    },
    {
      title: 'Your family dinner at IT Park',
      date: '',
      caption: 'Sitting at the table with your family and feeling like I belonged. Thank you for letting me be part of your people.',
      photo: '/photos/memory-14.jpg',
    },
    {
      title: 'Random night drive cravings',
      date: '',
      caption: 'A sudden craving, a quiet road, and the city lights. These unplanned rides are some of my favorite adventures with you.',
      photo: '/photos/memory-15.jpg',
    },
    {
      title: 'Just because flowers',
      date: '',
      caption: 'No special occasion needed. I just wanted to see you smile, and it worked every time.',
      photo: '/photos/memory-16.jpg',
    },
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