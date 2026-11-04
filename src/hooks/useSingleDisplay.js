import { useEffect, useState } from 'react';

// "Single display" = a phone, a touch screen or a narrow window, where the text and the tree
// are seen one after the other (stacked), not side by side.
// Same rule that Polish.css uses for phones and tablets.
const QUERY = '(max-width: 820px), (pointer: coarse)';

const read = () =>
  typeof window !== 'undefined' && window.matchMedia(QUERY).matches;

export default function useSingleDisplay() {
  const [single, setSingle] = useState(read);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = () => setSingle(mq.matches);
    onChange();
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  return single;
}