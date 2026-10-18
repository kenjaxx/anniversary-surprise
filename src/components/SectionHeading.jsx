export default function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="section-heading reveal">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
      <span className="heading-heart">♡</span>
    </div>
  );
}