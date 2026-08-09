import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// Prevent third-party browser extension errors (e.g., MetaMask provider injection) from bubbling
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const reasonStr = (
    reason?.message || 
    reason?.stack || 
    (typeof reason === 'string' ? reason : '') || 
    JSON.stringify(reason || {})
  ).toLowerCase();

  if (
    reasonStr.includes('metamask') ||
    reasonStr.includes('ethereum') ||
    reasonStr.includes('failed to connect') ||
    reasonStr.includes('eip6963') ||
    reasonStr.includes('provider') ||
    reasonStr.includes('wallet') ||
    reasonStr.includes('connect')
  ) {
    event.preventDefault();
    event.stopImmediatePropagation();
    console.warn('Suppressed external browser extension rejection:', reason);
  }
});

window.addEventListener('error', (event) => {
  const msg = (
    event.message || 
    event.filename || 
    (typeof event.error === 'string' ? event.error : event.error?.message || '')
  ).toLowerCase();

  if (
    msg.includes('metamask') ||
    msg.includes('ethereum') ||
    msg.includes('failed to connect') ||
    msg.includes('eip6963') ||
    msg.includes('provider') ||
    msg.includes('wallet') ||
    msg.includes('connect')
  ) {
    event.preventDefault();
    event.stopImmediatePropagation();
    console.warn('Suppressed external browser extension error:', event.message);
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

