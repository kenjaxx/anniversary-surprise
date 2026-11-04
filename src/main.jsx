
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
import './styles/Polish.css';
import './styles/gate.css';
import './styles/navbar.css';

// New generative tree styling
import './styles/generative-tree.css';

// This site doesn't use a service worker.
// In dev, remove any worker and caches left over from another project.
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs =>
    regs.forEach(r => r.unregister())
  );

  if ('caches' in window) {
    caches.keys().then(keys =>
      keys.forEach(k => caches.delete(k))
    );
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
