import { content } from '../data/content.js';
import WovenCloth from './WovenCloth.jsx';

export default function Celebration() {
  return (
    <section className="celebration section-wrap" id="celebration">
      <div className="celebration-stage reveal">
        <div className="cs-glow" aria-hidden="true" />

        <WovenCloth
          eyebrow="happy anniversary"
          title="Happy 1 Year!"
          message={content.celebrateMessage}
          signature="with all my love"
        />

        <div className="cs-copy">
          <p>Scroll down. I have a few more things I want you to know.</p>
        </div>
      </div>
    </section>
  );
}