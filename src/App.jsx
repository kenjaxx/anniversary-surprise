import { useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowRight, CalendarDays, Camera, ChevronLeft, ChevronRight, Gift, Heart, MapPin, Music2, Star, Utensils, X } from 'lucide-react';
import HoldButton from './HoldButton.jsx';
// PERSONALIZE THIS FILE: replace bracketed placeholders and add your own photos to /public/photos.
const content = {
  partnerNickname: '[their nickname]',
  senderName: '[your name]',
  anniversaryDate: '[your anniversary date]',
  openingLine: 'To my favorite person in the whole world...',
  question: 'Will you go on an anniversary date with me?',
  yesMessage: "Yay! I was really hoping you'd say yes!",
  loveReasons: [
    { icon: '♡', title: 'Your heart', text: 'You make even ordinary days feel special.' },
    { icon: '☼', title: 'Your smile', text: 'Your smile can change my entire mood.' },
    { icon: '✦', title: 'My favorite human', text: "You're my favorite person to annoy. 🤭" },
    { icon: '♡', title: 'The little things', text: 'I love the little things you do, even when you don’t notice them.' },
  ],
  memories: [
    { title: 'When we first met', date: '[add date]', text: '[Add a little story about how you met.]', photo: '/photos/memory-1.jpg' },
    { title: 'Our first date', date: '[add date]', text: '[What do you remember most about that day?]', photo: '/photos/memory-2.jpg' },
    { title: 'A favorite moment', date: '[add date]', text: '[A tiny moment you still think about.]', photo: '/photos/memory-3.jpg' },
    { title: 'Another chapter', date: '[add date]', text: '[A memory that means a lot to you both.]', photo: '/photos/memory-4.jpg' },
  ],
  plan: [
    { icon: 'calendar', title: 'Date & time', detail: '[Add the date and time]' },
    { icon: 'location', title: 'Meeting place', detail: '[Add the location]' },
    { icon: 'star', title: 'Our little adventure', detail: '[Add planned activities]' },
    { icon: 'food', title: 'Dinner / food', detail: '[Add dinner or food plans]' },
    { icon: 'gift', title: 'A special surprise', detail: '[Keep the surprise secret, if you like!]' },
  ],
  letter: `My dearest ${'[their nickname]'},\n\nI just want you to know how much you mean to me. Thank you for the little things, the laughs, the patience, and the moments that become favorite memories without us even noticing.\n\nI’m grateful I get to keep learning about you and choosing you. I can’t wait for the stories we haven’t made yet, the places we haven’t gone, and all the ordinary days that will feel special because they’re with you.\n\nHere’s to us, and to everything still to come.\n\nForever cheering for us,\n${'[your name]'} ♡`,
  closing: "Here's to another chapter of us. More memories, more adventures, more laughter, and more reasons to keep choosing each other.",
};

const noLines = ['Are you sure? 🥺', 'Think again! 💗', 'That button seems broken…', 'You know you want to say yes! 🙈', 'One more tiny think?'];
const sweetNotes = ['You make the little things feel big.', 'I’m always on your team.', 'You are one of my favorite parts of every day.', 'A tiny reminder: you are loved.'];
const photoFallbacks = [
  'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85',
];

// How long the envelope animation needs (flap 0.7s + letter 1.1s + pause) before we scroll away.
const ENVELOPE_ANIMATION_MS = 2800;
// How close (px) the mouse can get to the No button before it runs away.
const DODGE_RADIUS = 110;

function scrollTo(id) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
function Photo({ src, fallback, alt, className = '' }) {
  const [failed, setFailed] = useState(false);
  return <img className={className} src={failed ? fallback : src} alt={alt} onError={() => { if (!failed) setFailed(true); }} loading="lazy" />;
}
function SectionHeading({ eyebrow, title, subtitle }) {
  return <div className="section-heading reveal"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}<span className="heading-heart">♡</span></div>;
}
function App() {
  const [opened, setOpened] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [noCount, setNoCount] = useState(0);
  const [reasonOpen, setReasonOpen] = useState([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const [note, setNote] = useState('');
  const [secret, setSecret] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [musicStatus, setMusicStatus] = useState('');
  const audioRef = useRef(null);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [showLetter, setShowLetter] = useState(false);
  const [progress, setProgress] = useState(0);
const pointerRef = useRef(null);
  const stageRef = useRef(null);
  const openTimer = useRef(null);
  const cardRef = useRef(null);
  const noRef = useRef(null);
  const yesRef = useRef(null);
  const lastDodge = useRef(0);
  const noSlotRef = useRef(null);
  const petals = useMemo(() => Array.from({ length: 16 }, (_, i) => ({
    id: i,
    left: Math.round(Math.random() * 100),
    size: 12 + Math.round(Math.random() * 16),
    delay: -Math.random() * 18,
    duration: 14 + Math.random() * 12,
    glyph: ['♡', '✿', '♥', '✦'][i % 4],
  })), []);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [opened, accepted, showLetter]);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => () => clearTimeout(openTimer.current), []);

  useEffect(() => {
  const reset = () => setNoPosition({ x: 0, y: 0 });
  window.addEventListener('resize', reset);
  return () => window.removeEventListener('resize', reset);
}, []);

  const gallery = useMemo(() => [
    { src: '/photos/gallery-1.jpg', fallback: photoFallbacks[4], caption: 'Better together ♡' },
    { src: '/photos/gallery-2.jpg', fallback: photoFallbacks[0], caption: 'A little moment, forever kept' },
    { src: '/photos/gallery-3.jpg', fallback: photoFallbacks[5], caption: 'Our kind of happy' },
    { src: '/photos/gallery-4.jpg', fallback: photoFallbacks[1], caption: 'One for the memory book' },
    { src: '/photos/gallery-5.jpg', fallback: photoFallbacks[2], caption: 'Wherever we go' },
    { src: '/photos/gallery-6.jpg', fallback: photoFallbacks[3], caption: 'And a thousand more' },
  ], []);

  // FIX 1: keep the envelope in view, let the full animation play, THEN scroll to the question.
  const openEnvelope = () => {
    if (opened) return;
    setOpened(true);
    stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    clearTimeout(openTimer.current);
    openTimer.current = setTimeout(() => scrollTo('invitation'), ENVELOPE_ANIMATION_MS);
  };

  const celebrate = () => {
    setAccepted(true);
    const end = Date.now() + 1700;
    const colors = ['#f06b83', '#ffd6a5', '#f7a9b8', '#fff0e6'];
    (function frame() {
      confetti({ particleCount: 5, angle: 60, spread: 65, origin: { x: 0 }, colors, scalar: 0.9 });
      confetti({ particleCount: 5, angle: 120, spread: 65, origin: { x: 1 }, colors, scalar: 0.9 });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
    setTimeout(() => scrollTo('celebration'), 250);
  };

  // FIX 2: the No button jumps to a far-away spot inside the card, away from the pointer and the Yes button.
  const dodgeNo = (pointer, force = false) => {
  const now = Date.now();
  if (!force && now - lastDodge.current < 120) return;
  lastDodge.current = now;

  const slot = noSlotRef.current, btn = noRef.current, card = cardRef.current, yes = yesRef.current;
  if (!slot || !btn || !card || !yes) return;

  const s = slot.getBoundingClientRect();
  const c = card.getBoundingClientRect();
  const y = yes.getBoundingClientRect();
  const w = btn.offsetWidth, h = btn.offsetHeight;

  const homeX = s.left + s.width / 2, homeY = s.top + s.height / 2;
  const curX = homeX + noPosition.x, curY = homeY + noPosition.y;
  const px = pointer ? pointer.x : curX, py = pointer ? pointer.y : curY;

  // Arena = inside the card, from just above the button row down to the card's bottom edge
  // (so it never covers the heading/question).
  const pad = 24;
  const minX = c.left + pad + w / 2;
  const maxX = c.right - pad - w / 2;
  const minY = Math.max(c.top + pad + h / 2, s.top - 40 + h / 2);
  const maxY = c.bottom - pad - h / 2;
  if (maxX <= minX || maxY <= minY) return;

  let best = null, bestScore = -1;
  for (let i = 0; i < 60; i++) {
    const x = minX + Math.random() * (maxX - minX);
    const yy = minY + Math.random() * (maxY - minY);
    // don't land on top of the Yes button (+ a small margin)
    const overlapsYes =
      x + w / 2 > y.left - 14 && x - w / 2 < y.right + 14 &&
      yy + h / 2 > y.top - 14 && yy - h / 2 < y.bottom + 14;
    if (overlapsYes) continue;
    const dCur = Math.hypot(x - curX, yy - curY);
    if (dCur < 80) continue; // make sure it actually moves
    const score = Math.min(Math.hypot(x - px, yy - py), dCur);
    if (score > bestScore) { bestScore = score; best = { x, y: yy }; }
  }
  if (!best) return;

  setNoPosition({ x: best.x - homeX, y: best.y - homeY });
  setNoCount(v => v + 1);
};

const onCardPointerMove = e => {
  pointerRef.current = { x: e.clientX, y: e.clientY };
  if (noCount === 0 || e.pointerType === 'touch' || !noSlotRef.current) return; // hold stage: no running
  const s = noSlotRef.current.getBoundingClientRect();
  const bx = s.left + s.width / 2 + noPosition.x;
  const by = s.top + s.height / 2 + noPosition.y;
  if (Math.hypot(e.clientX - bx, e.clientY - by) < DODGE_RADIUS) dodgeNo({ x: e.clientX, y: e.clientY });
};

  const revealReason = index => setReasonOpen(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  const nextGallery = delta => setGalleryIndex(prev => (prev + delta + gallery.length) % gallery.length);
  const toggleMusic = async () => {
    if (musicOn && audioRef.current) { audioRef.current.pause(); setMusicOn(false); setMusicStatus(''); return; }
    if (!audioRef.current) {
      audioRef.current = new Audio('/music.mp3');
      audioRef.current.loop = true;
      audioRef.current.addEventListener('error', () => { setMusicOn(false); setMusicStatus('Add music.mp3'); });
    }
    try { await audioRef.current.play(); setMusicOn(true); setMusicStatus(''); }
    catch { setMusicOn(false); setMusicStatus('Add music.mp3'); }
  };
  const getPlanIcon = icon => ({ calendar: <CalendarDays />, location: <MapPin />, star: <Star />, food: <Utensils />, gift: <Gift /> }[icon]);
  const yesScale = 1 + Math.min(noCount, 10) * 0.045;

  return <main>
    <div className="scroll-progress" style={{ width: `${progress}%` }} />
    <div className="petals" aria-hidden="true">{petals.map(p => <span key={p.id} style={{ left: `${p.left}%`, fontSize: p.size, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s` }}>{p.glyph}</span>)}</div>
    <div className="ambient ambient-one"/><div className="ambient ambient-two"/>
    <nav className="topbar"><a className="brand" href="#top" onClick={e => { e.preventDefault(); scrollTo('top'); }}><span>♡</span> little things, big love</a><div className="nav-links"><button onClick={() => scrollTo('story')}>Our story</button><button onClick={() => scrollTo('date-plan')}>The date</button><button onClick={() => scrollTo('letter')}>A letter</button></div><button className="music-toggle" onClick={toggleMusic} aria-label={musicOn ? 'Pause music' : 'Play background music'} title="Add your own track at public/music.mp3"><Music2 size={16}/><span>{musicOn ? 'Music on' : (musicStatus || 'Music')}</span></button></nav>

    <section className="hero section-wrap" id="top">
      <div className="hero-copy reveal"><span className="eyebrow"><span className="tiny-heart">♥</span> A little something, just for you</span><h1>{content.openingLine}</h1><p>I made you a tiny corner of the internet, filled with a few things I want you to know.</p><button className="primary-button" onClick={openEnvelope} disabled={opened}>{opened ? 'Opening your surprise…' : 'Open your little surprise'} <ArrowRight size={16}/></button><div className="handwritten hero-note">made with love, just for you <span>♡</span></div></div>
      <div ref={stageRef} className={`envelope-stage reveal ${opened ? 'is-open' : ''}`} onClick={openEnvelope} role="button" tabIndex={0} aria-label="Open the love letter" onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEnvelope(); } }}>
        <div className="sparkle s1">✦</div><div className="sparkle s2">♡</div><div className="envelope"><div className="envelope-back"/><div className="letter-peek"><span>For my favorite person</span><Heart fill="currentColor" size={18}/></div><div className="envelope-flap"/><div className="envelope-front"/><div className="wax-seal"><Heart fill="currentColor" size={22}/></div></div><span className="envelope-hint">{opened ? 'Your little surprise awaits ↓' : 'tap the envelope to open'}</span>
      </div>
      <div className="hero-flower flower-a">✿</div><div className="hero-flower flower-b">✾</div>
    </section>

    <section className="invitation section-wrap" id="invitation">

  <div ref={cardRef} className="invitation-card reveal" onPointerMove={onCardPointerMove}>
    <div className="card-sparkle">✧</div>
    <span className="eyebrow">one tiny question</span>
    <div className="heart-bloom">♥</div>
    <h2>Hey, my love<span>...</span></h2>
    <p className="muted">I have something important to ask you.</p>
    <div className="tiny-envelope">✉</div>
    <h3>{content.question}</h3>


    <div className="answer-row">
  <button ref={yesRef} className="yes-button" style={{ transform: `scale(${yesScale})` }} onClick={celebrate}>
    Yes, of course! <Heart size={16} fill="currentColor"/>
  </button>
  <span ref={noSlotRef} className="no-slot">
    <span
      ref={noRef}
      className="no-mover"
      style={{ transform: `translate(${noPosition.x}px, ${noPosition.y}px)` }}
    >
      {noCount === 0 ? (
        <>
          <span className="hold-hint" aria-hidden="true">press &amp; hold to say no 🥺</span>
          <HoldButton
            className="no-hold nudge"
            size="sm"
            radius={99}
            backgroundColor="#fde6df"
            textColor="#80555a"
            fillColor="#c94f68"
            fillTextColor="#ffffff"
            holdTime={1800}
            dodgeAt={0.85}
            releaseTime={250}
            pressScale={0.96}
            wave
            waveAmplitude={5}
            glow={false}
            resetAfter={0}
            onDodge={() => dodgeNo(pointerRef.current, true)}
          >
            No
          </HoldButton>
        </>
      ) : (
        <button
          className="no-button"
          onPointerEnter={e => { if (e.pointerType !== 'touch') dodgeNo({ x: e.clientX, y: e.clientY }, true); }}
          onPointerDown={e => { if (e.pointerType === 'touch') { e.preventDefault(); dodgeNo({ x: e.clientX, y: e.clientY }, true); } }}
          onFocus={() => dodgeNo(null, true)}
          onClick={() => dodgeNo(null, true)}
        >
          No
        </button>
      )}
    </span>
  </span>
</div>






    <p className="whisper">psst... the pink button looks good on you <span>♡</span></p>
  </div>

  {/* confirmation text under the card */}
  <p className="no-message" aria-live="polite">
    {noCount > 0 && <span key={noCount}>{noLines[(noCount - 1) % noLines.length]}</span>}
  </p>
</section>

    {accepted && <section className="celebration section-wrap" id="celebration"><div className="celebration-card reveal visible"><div className="floating-hearts">♥　♡　♥</div><div className="big-heart">♥</div><span className="eyebrow">the best answer</span><h2>Yay! 🥹❤️</h2><h3>{content.yesMessage}</h3><p>I can't wait to make another beautiful memory with you.</p><button className="primary-button" onClick={() => scrollTo('date-plan')}>See our anniversary plan <ArrowRight size={16}/></button></div></section>}

    <section className="story section-wrap" id="story"><SectionHeading eyebrow="the chapters that made us" title="Our Little Love Story" subtitle="A few moments I want to keep close."/><div className="memory-grid">{content.memories.map((memory, i) => <article className="memory-card reveal" key={memory.title} style={{ '--delay': `${i * 90}ms` }}><div className={`polaroid tilt-${i % 4}`}><Photo src={memory.photo} fallback={photoFallbacks[i]} alt={memory.title}/><span className="photo-heart">♡</span></div><div className="memory-meta"><span>{memory.date}</span><h3>{memory.title}</h3><p>{memory.text}</p></div></article>)}</div><p className="section-footnote">Every little moment belongs in our story. <span>♡</span></p></section>

    <section className="reasons section-wrap" id="reasons"><SectionHeading eyebrow="little things i notice" title="Reasons I Love You" subtitle="Tap a card to open a tiny reminder."/><div className="reasons-grid">{content.loveReasons.map((reason, i) => <button className={`reason-card reason-${i} ${reasonOpen.includes(i) ? 'flipped' : ''}`} key={reason.title} onClick={() => revealReason(i)} aria-expanded={reasonOpen.includes(i)}><span className="reason-icon">{reason.icon}</span>{reasonOpen.includes(i) ? <><strong>{reason.title}</strong><p>{reason.text}</p><span className="card-tap">tap to tuck away ♡</span></> : <><strong>A little reminder</strong><span className="card-tap">tap to reveal ♡</span></>}</button>)}</div><div className="random-note"><div><span className="eyebrow">just because</span><p>{note || 'Need a little reminder? There’s one waiting for you.'}</p></div><button className="outline-button" onClick={() => setNote(sweetNotes[Math.floor(Math.random() * sweetNotes.length)])}>Tap for a little reminder <Heart size={15}/></button></div></section>

    <section className="date-plan section-wrap" id="date-plan"><div className="date-banner"><Photo src="/photos/date-banner.jpg" fallback={photoFallbacks[4]} alt="Golden sunset landscape"/><div className="banner-overlay"/><div className="banner-text"><span className="eyebrow">a little time, just us</span><h2>Our Anniversary Date</h2><p>A special day, saved just for you and me.</p><span>♡</span></div></div><div className="plan-layout"><div className="plan-list">{content.plan.map((item, i) => <div className="plan-item reveal" key={item.title} style={{ '--delay': `${i * 70}ms` }}><span className="plan-icon">{getPlanIcon(item.icon)}</span><div><h3>{item.title}</h3><p>{item.detail}</p></div><span className="plan-number">0{i + 1}</span></div>)}</div><div className="date-side-note"><div className="date-photo"><Photo src="/photos/date-memory.jpg" fallback={photoFallbacks[5]} alt="A peaceful sunset"/><span>one for the memory book ♡</span></div><p className="handwritten">Can't wait to spend this day with you.</p><Heart className="side-heart" size={20} fill="currentColor"/></div></div></section>

    <section className="letter-section section-wrap" id="letter"><SectionHeading eyebrow="from my heart to yours" title="A Little Love Letter" subtitle="Some things deserve a little more than a text."/><div className="letter-paper reveal"><div className="paper-flower">✿</div>{!showLetter ? <div className="letter-closed"><div className="letter-seal"><Heart fill="currentColor"/></div><h3>A note for {content.partnerNickname}</h3><p>Written with all my love, and meant only for you.</p><button className="primary-button" onClick={() => setShowLetter(true)}>Open your letter <ArrowRight size={16}/></button></div> : <div className="letter-content"><p className="handwritten salutation">My dearest {content.partnerNickname},</p>{content.letter.split('\n\n').slice(1, -1).map((paragraph, i) => <p key={i}>{paragraph}</p>)}<p className="handwritten signature">Forever cheering for us,<br/>{content.senderName} <Heart size={18} fill="currentColor"/></p></div>}<div className="paper-stamp">♡</div></div></section>

    <section className="gallery-section section-wrap" id="gallery"><SectionHeading eyebrow="little moments, kept forever" title="Our Memories" subtitle="A tiny gallery for the days we want to remember."/><div className="gallery-frame reveal"><div className="gallery-feature" onClick={() => setLightbox(galleryIndex)} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') setLightbox(galleryIndex); }}><Photo src={gallery[galleryIndex].src} fallback={gallery[galleryIndex].fallback} alt={gallery[galleryIndex].caption}/><span className="gallery-caption">{gallery[galleryIndex].caption}</span><span className="gallery-zoom"><Camera size={17}/> view memory</span></div><div className="gallery-thumbs">{gallery.map((item, i) => <button className={`gallery-thumb ${galleryIndex === i ? 'active' : ''}`} key={item.caption} onClick={() => setGalleryIndex(i)} aria-label={`Show photo ${i + 1}`}><Photo src={item.src} fallback={item.fallback} alt=""/></button>)}</div><div className="gallery-controls"><button onClick={() => nextGallery(-1)} aria-label="Previous photo"><ChevronLeft size={18}/></button><span>{galleryIndex + 1} <i>/</i> {gallery.length}</span><button onClick={() => nextGallery(1)} aria-label="Next photo"><ChevronRight size={18}/></button></div></div></section>

    <section className="final-section" id="final"><div className="night-sky"><span className="star star-1">✦</span><span className="star star-2">✧</span><span className="star star-3">✦</span><span className="star star-4">✧</span><span className="star star-5">✦</span><div className="final-content"><span className="eyebrow">and this is only the beginning</span><p className="handwritten">Here's to another chapter of us.</p><h2>{content.closing}</h2><p className="final-love">I love you. <Heart fill="currentColor" size={22}/></p><button className="light-button" onClick={() => setSecret(!secret)}>{secret ? 'Your secret is safe with me ♡' : 'One last little secret'} <Heart size={15} fill="currentColor"/></button>{secret && <div className="secret-note">If I could choose all over again, I'd still hope our paths would find each other. ♡</div>}<button className="replay-button" onClick={() => { clearTimeout(openTimer.current); setAccepted(false); setOpened(false); setSecret(false); setNoCount(0); setNoPosition({ x: 0, y: 0 }); scrollTo('top'); }}>↺ &nbsp; Start our little story again</button></div><div className="silhouette"><span>♥</span></div><div className="night-hills"/></div><footer>made with a little extra love <Heart size={12} fill="currentColor"/> for {content.partnerNickname}</footer></section>

    {lightbox !== null && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={() => setLightbox(null)}><button className="lightbox-close" onClick={() => setLightbox(null)} aria-label="Close photo"><X/></button><button className="lightbox-arrow left" onClick={e => { e.stopPropagation(); setLightbox((lightbox - 1 + gallery.length) % gallery.length); }} aria-label="Previous photo"><ChevronLeft/></button><Photo src={gallery[lightbox].src} fallback={gallery[lightbox].fallback} alt={gallery[lightbox].caption}/><button className="lightbox-arrow right" onClick={e => { e.stopPropagation(); setLightbox((lightbox + 1) % gallery.length); }} aria-label="Next photo"><ChevronRight/></button><p>{gallery[lightbox].caption}</p></div>}
    <div className="tiny-footer"><span>♡</span> a little website, with a lot of heart <span>♡</span></div>
  </main>;
}
export default App;