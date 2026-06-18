import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Production note (do not build here): the real WERC is React Native + Expo with
// a backend; the phone-lock ritual and screen-time signals are native there. The
// /src/engine module is intentionally framework-agnostic so it ports directly.

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
