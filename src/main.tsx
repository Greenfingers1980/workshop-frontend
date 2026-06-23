import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Hide print buttons on Android
if (/Android/i.test(navigator.userAgent)) {
  document.querySelectorAll('.print-button').forEach((el) => {
    (el as HTMLElement).style.display = 'none';
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);