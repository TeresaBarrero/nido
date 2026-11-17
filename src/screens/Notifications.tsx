import { useNavigate } from 'react-router';
import { freshFilters, useApp } from '../app/AppState';
import { BackButton } from '../components/BackButton';
import { Icon, type IconName } from '../components/Icon';
import { TONES, type Tone } from '../data/catalog';
import { ageInMonths, DEMO_USER, nextStage, stageForMonths } from '../data/user';
import styles from './Notifications.module.css';

interface Item {
  unread: boolean;
  tone: Tone;
  icon: IconName;
  title: string;
  body: string;
  time: string;
  /** Pantalla a la que lleva, o 'stage' para buscar por la etapa del bebé. */
  to: string;
}

const ITEMS: Item[] = [
  { unread: true, tone: 'mint', icon: 'heart', title: '14 familias han visto tu bañera', body: 'Una de ellas está a 400 m. Responde rápido para venderla hoy.', time: 'Hace 5 min', to: '/perfil' },
  { unread: true, tone: 'butter', icon: 'bell', title: 'La trona que guardaste ha bajado a 130 €', body: 'Trona evolutiva de madera · 3 km', time: 'Hace 1 h', to: '/producto/4' },
  { unread: false, tone: 'sky', icon: 'check', title: 'Marta ha aceptado tu propuesta de entrega', body: 'Sábado 21 nov · Plaza de Olavide', time: 'Ayer', to: '/chat/1' },
  { unread: false, tone: 'lavender', icon: 'baby', title: 'Lucía cumple 6 meses en 3 semanas', body: 'Mira lo que necesitará: tronas, ropa de 6-12 m y juegos.', time: 'Lun', to: 'stage' },
];

export function Notifications() {
  const { notificationsRead, markNotificationsRead, setFilters, toast } = useApp();
  const navigate = useNavigate();

  const open = (to: string) => {
    if (to === 'stage') {
      const upcoming = nextStage(stageForMonths(ageInMonths(DEMO_USER.baby.birthDate)));
      setFilters(freshFilters({ stage: upcoming }));
      navigate('/buscar');
    } else {
      navigate(to);
    }
  };

  return (
    <>
      <header className="bar">
        <BackButton />
        <h1 className={styles.title}>Notificaciones</h1>
        <button
          type="button"
          className="link"
          onClick={() => { markNotificationsRead(); toast('Todas las notificaciones leídas'); }}
        >
          Marcar leídas
        </button>
      </header>
      <main className="scroll fade">
        <ul className="panel list" style={{ marginTop: 4, listStyle: 'none' }}>
          {ITEMS.map((n) => {
            const unread = n.unread && !notificationsRead;
            const tone = TONES[n.tone];
            return (
              <li key={n.title} className={styles.item}>
                <button type="button" className={styles.notif} onClick={() => open(n.to)}>
                  <span className={styles.ni} style={{ background: tone.bg, color: tone.ink }}><Icon name={n.icon} size={20} /></span>
                  <span style={{ flex: 1 }}>
                    <b className={unread ? styles.unread : undefined}>
                      {n.title}
                      {unread && <span className="sr-only"> (sin leer)</span>}
                    </b>
                    <span className={styles.body}>{n.body}</span>
                    <span className="cmeta" style={{ marginTop: 3 }}>{n.time}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}
