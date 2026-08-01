import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// Prevent third-party browser extension errors (e.g., MetaMask provider injection) from bubbling
window.addEventListener('unhandledrejection', (event) => {
  const reasonStr = String(event.reason?.message || event.reason || '').toLowerCase();
  if (
    reasonStr.includes('metamask') ||
    reasonStr.includes('ethereum') ||
    reasonStr.includes('failed to connect')
  ) {
    event.preventDefault();
    event.stopImmediatePropagation();
    console.warn('Caught external browser extension rejection:', event.reason);
  }
});

window.addEventListener('error', (event) => {
  const msg = String(event.message || event.filename || '').toLowerCase();
  if (
    msg.includes('metamask') ||
    msg.includes('ethereum') ||
    msg.includes('failed to connect')
  ) {
    event.preventDefault();
    event.stopImmediatePropagation();
    console.warn('Caught external browser extension error:', event.message);
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

