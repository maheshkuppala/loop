import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './config/firebase';
import './styles/index.css';

// Remove pre-React loading screen once React takes over
const removePreloader = () => {
  const preloader = document.getElementById('looop-preloader');
  if (preloader) {
    preloader.style.transition = 'opacity 400ms ease-out';
    preloader.style.opacity = '0';
    setTimeout(() => preloader.remove(), 450);
  }
};

const container = document.getElementById('root');
if (!container) {
  throw new Error('Failed to find the root element to mount React application.');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App onReady={removePreloader} />
  </React.StrictMode>
);
