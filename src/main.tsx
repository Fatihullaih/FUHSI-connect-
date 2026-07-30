import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// Prevent third-party browser extension errors (e.g., MetaMask provider injection) from bubbling
window.addEventListener('unhandledrejection', (event) => {
  const reasonStr = String(event.reason?.message || event.reason || '');
  if (reasonStr.toLowerCase().includes('metamask') || reasonStr.toLowerCase().includes('ethereum')) {
    event.preventDefault();
    console.warn('Caught external MetaMask extension rejection:', reasonStr);
  }
});

window.addEventListener('error', (event) => {
  const msg = String(event.message || '');
  if (msg.toLowerCase().includes('metamask') || msg.toLowerCase().includes('ethereum')) {
    event.preventDefault();
    console.warn('Caught external MetaMask extension error:', msg);
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

