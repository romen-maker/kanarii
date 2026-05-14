import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext';
import { ComunidadProvider } from './contexts/ComunidadContext';
import App from './App.tsx';
import './index.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ComunidadProvider>
        <App />
      </ComunidadProvider>
    </AuthProvider>
  </StrictMode>,
);
