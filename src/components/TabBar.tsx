import type { MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Icon, type IconName } from './Icon';
import styles from './TabBar.module.css';

const TABS: { to: string; label: string; icon: IconName; sell?: boolean }[] = [
  { to: '/', label: 'Inicio', icon: 'home' },
  { to: '/buscar', label: 'Buscar', icon: 'search' },
  { to: '/vender', label: 'Vender', icon: 'plus', sell: true },
  { to: '/mensajes', label: 'Mensajes', icon: 'chat' },
  { to: '/perfil', label: 'Perfil', icon: 'user' },
];

/**
 * Ir a Inicio vaciando el historial de la app: vuelve a la primera entrada y la cambia por Inicio,
 * así el botón atrás del móvil no regresa al chat ni al pago.
 */
export function useGoHome() {
  const navigate = useNavigate();
  return (e?: MouseEvent) => {
    e?.preventDefault();
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx <= 0) { navigate('/', { replace: true }); return; }
    const onPop = () => {
      window.removeEventListener('popstate', onPop);
      navigate('/', { replace: true });
    };
    window.addEventListener('popstate', onPop);
    window.history.go(-idx);
  };
}

/**
 * Barra inferior. `active` fuerza la pestaña marcada en pantallas que no son
 * la raíz de una pestaña (p. ej. el chat marca Mensajes). Con `null` no se marca ninguna.
 */
export function TabBar({ active }: { active?: string | null }) {
  const { pathname } = useLocation();
  const current = active !== undefined ? active : pathname;
  const goHome = useGoHome();

  return (
    <nav className={styles.bar} aria-label="Navegación principal">
      {TABS.map((t) => (
        <Link
          key={t.to}
          to={t.to}
          onClick={t.to === '/' ? goHome : undefined}
          className={[styles.tab, t.sell && styles.sell].filter(Boolean).join(' ')}
          aria-current={current === t.to ? 'page' : undefined}
        >
          {t.sell ? <span className={styles.plus}><Icon name={t.icon} size={24} /></span> : <Icon name={t.icon} size={22} />}
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
