import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/styles.css';
import './styles/enhance.css';
import './styles/counter.css';
import './styles/wall.css';
import './styles/memories.css';
import './styles/feelings.css';
import './styles/softmotion.css';
import './styles/tour.css';
import './styles/closing.css';
import './styles/datePicker.css';
import './styles/Polish.css'; // must be last: intro gate + mobile fixes
import './styles/Polish.css'; // mobile fixes
import './styles/gate.css';   // the "Tap the seal to begin" intro (last)
// This site doesn't use a service worker. In dev, remove any worker (and its caches)
// left over from another project that ran on the same localhost port.
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
  if ('caches' in window) {
    caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
);