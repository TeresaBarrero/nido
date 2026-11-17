import { Navigate, Outlet, useLocation } from 'react-router';
import { Toast } from '../components/Toast';
import { useApp } from './AppState';

/** Marco de la app: ancho de móvil, avisos y redirección a la bienvenida la primera vez. */
export function Root() {
  const { onboarded } = useApp();
  const { pathname } = useLocation();

  if (!onboarded && pathname !== '/bienvenida') return <Navigate to="/bienvenida" replace />;

  return (
    <div className="shell">
      <Outlet />
      <Toast />
    </div>
  );
}
