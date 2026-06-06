import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext';
import { ComunidadProvider } from './contexts/ComunidadContext';
import App from './App.tsx';
import './index.css';
// Resolver redirecciones de bot-detector para rutas limpias en la SPA
const urlParams = new URLSearchParams(window.location.search);
const redirectRoute = urlParams.get('route');
if (redirectRoute) {
  window.history.replaceState({}, '', redirectRoute);
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
