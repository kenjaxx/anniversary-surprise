# A Little Anniversary Surprise 💌

A responsive React + Vite anniversary invitation website with an opening envelope, playful Yes/No invitation, celebration confetti, relationship scrapbook, interactive reasons-to-love cards, editable date plan, letter reveal, photo gallery/lightbox, secret closing note, and reduced-motion support.

## Run locally

1. Install Node.js 20+ (or a current supported LTS release).
2. In this folder run:
   ```bash
   npm install
   npm run dev
   ```
3. Open the local URL printed by Vite.
4. To verify a production build, run `npm run build`; preview it with `npm run preview`.

## Personalize it

Edit the `content` object near the top of `src/App.jsx`. Replace bracketed placeholders with your own details, memories, date plan, and letter. The code is deliberately placeholder-based: it does not invent personal facts.

### Photos

Place your photos in `public/photos/` with these names (JPG, PNG, or WebP are all fine if you update the matching path in `src/App.jsx`):

- `memory-1.jpg` through `memory-4.jpg`
- `gallery-1.jpg` through `gallery-6.jpg`
- `date-banner.jpg`
- `date-memory.jpg`

If a local photo is missing, the website falls back to an illustrative Unsplash photo so the layout remains usable. Replace these fallback URLs in `photoFallbacks` if you prefer different sample imagery. Use photos you have permission to share.

### Music

Music starts off disabled. To enable it, place your own audio file at `public/music.mp3`. The music toggle attempts playback only after the visitor clicks it; if the file is missing or cannot play, it shows `Add music.mp3` instead. No music is included by default.

## Deploy free

- **Netlify:** push this folder to GitHub, import the repository into Netlify, set build command `npm run build` and publish directory `dist`.
- **Vercel:** import the GitHub repository; Vite is detected automatically. Build command `npm run build`, output directory `dist`.

No backend, database, login, paid API, or environment variables are required. The public URL can be shared with your partner.

## Notes

- The No button moves playfully on hover/touch; the Yes button remains keyboard accessible.
- Photo viewer, gallery navigation, reasons cards, letter reveal, secret note, and replay are functional.
- Confetti fires only after Yes is selected.
- Background music is optional and works when you supply `public/music.mp3`; missing audio is handled with a visible prompt.
