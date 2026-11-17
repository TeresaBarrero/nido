import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { AuthProvider } from './app/Auth';
import { AppStateProvider } from './app/AppState';
import { router } from './app/router';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AppStateProvider>
        <RouterProvider router={router} />
      </AppStateProvider>
    </AuthProvider>
  </StrictMode>,
);
