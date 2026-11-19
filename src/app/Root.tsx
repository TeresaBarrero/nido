import { Navigate, Outlet, useLocation } from 'react-router';
import { Logo } from '../components/Logo';
import { Toast } from '../components/Toast';
import { useAuth } from './Auth';

/** Marco de la app: ancho de móvil, avisos y control de acceso (sesión y bienvenida). */
export function Root() {
  const { session, profile, ready, demoStarting } = useAuth();
  const { pathname } = useLocation();
  const onWelcome = pathname === '/bienvenida';
  // La privacidad se puede leer sin entrar en la app.
  const isPublic = pathname === '/privacidad';

  let content = <Outlet />;
  // Mientras se prepara la demo, solo el logo: así no asoma la pantalla de ubicación de la bienvenida.
  if (!ready || demoStarting) {
    content = (
      <div className="done-screen" style={{ justifyContent: 'center', background: 'var(--primary-soft)' }} aria-busy="true">
        <Logo size={72} />
        <span className="sr-only" role="status">Cargando Nido…</span>
      </div>
    );
  } else if (isPublic) {
    content = <Outlet />;
  } else if ((!session || !profile?.onboarded) && !onWelcome) {
    content = <Navigate to="/bienvenida" replace />;
  } else if (session && profile?.onboarded && onWelcome) {
    content = <Navigate to="/" replace />;
  }

  return (
    <div className="shell">
      {content}
      <Toast />
    </div>
  );
}
