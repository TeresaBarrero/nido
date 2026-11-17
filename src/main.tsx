import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { AuthProvider } from './app/Auth';
import { AppStateProvider } from './app/AppState';
import { router } from './app/router';
import './styles/global.css';
import { registerSW } from 'virtual:pwa-register';

// App instalable: cuando se publica una versión nueva, se activa y la página se recarga sola.
// Además se comprueba si hay novedades cada vez que vuelves a la app y cada hora.
const updateSW = registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    if (!registration) return;
    const check = () => { if (navigator.onLine) registration.update().catch(() => {}); };
    setInterval(check, 60 * 60 * 1000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
  },
  onNeedRefresh() { updateSW(true); },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AppStateProvider>
        <RouterProvider router={router} />
      </AppStateProvider>
    </AuthProvider>
  </StrictMode>,
);
