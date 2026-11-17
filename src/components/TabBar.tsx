import { NavLink } from 'react-router';
import { Icon, type IconName } from './Icon';
import styles from './TabBar.module.css';

const TABS: { to: string; label: string; icon: IconName; sell?: boolean }[] = [
  { to: '/', label: 'Inicio', icon: 'home' },
  { to: '/buscar', label: 'Buscar', icon: 'search' },
  { to: '/vender', label: 'Vender', icon: 'plus', sell: true },
  { to: '/mensajes', label: 'Mensajes', icon: 'chat' },
  { to: '/perfil', label: 'Perfil', icon: 'user' },
];

export function TabBar() {
  return (
    <nav className={styles.bar} aria-label="Navegación principal">
      {TABS.map((t) => (
        <NavLink key={t.to} to={t.to} end className={[styles.tab, t.sell && styles.sell].filter(Boolean).join(' ')}>
          {t.sell ? <span className={styles.plus}><Icon name={t.icon} size={24} /></span> : <Icon name={t.icon} size={22} />}
          {t.label}
        </NavLink>
      ))}
    </nav>
  );
}
