import { useState } from 'react';

export default function Photo({ src, fallback, alt, className = '' }) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      className={className}
      src={failed ? fallback : src}
      alt={alt}
      onError={() => { if (!failed) setFailed(true); }}
      loading="lazy"
    />
  );
}