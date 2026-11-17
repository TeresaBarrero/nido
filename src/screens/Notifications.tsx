import { useNavigate } from 'react-router';
import { useAuth } from '../app/Auth';
import { freshFilters, useApp, type Notification } from '../app/AppState';
import { BackButton } from '../components/BackButton';
import { Icon, type IconName } from '../components/Icon';
import { TONES, type Tone } from '../data/catalog';
import { timeAgo } from '../data/api';
import { ageInMonths, nextStage, stageForMonths } from '../data/user';
import styles from './Notifications.module.css';

// Icono y color de cada tipo de notificación.
const LOOK: Record<string, { icon: IconName; tone: Tone }> = {
  message: { icon: 'chat', tone: 'sky' },
  reserved: { icon: 'lock', tone: 'butter' },
  price_drop: { icon: 'bell', tone: 'butter' },
  demand: { icon: 'heart', tone: 'mint' },
  stage: { icon: 'baby', tone: 'lavender' },
  welcome: { icon: 'sparkle', tone: 'peach' },
};

export function Notifications() {
  const { notifications, unreadCount, markNotificationsRead, setFilters, toast } = useApp();
  const { baby } = useAuth();
  const navigate = useNavigate();

  const open = (n: Notification) => {
    if (!n.read) markNotificationsRead(n.id);
    if (n.kind === 'stage' && baby) {
      setFilters(freshFilters({ stage: nextStage(stageForMonths(ageInMonths(baby.birth_date))) }));
    }
    if (n.link) navigate(n.link);
  };

  return (
    <>
      <header className="bar">
        <BackButton />
        <h1 className={styles.title}>Notificaciones</h1>
        {unreadCount > 0 && (
          <button type="button" className="link" onClick={() => { markNotificationsRead(); toast('Todas las notificaciones leídas'); }}>
            Marcar leídas
          </button>
        )}
      </header>
      <main className="scroll fade">
        {notifications.length === 0 ? (
          <p className="muted" style={{ textAlign: 'center', padding: '40px 10px' }}>Aún no tienes notificaciones. Te avisaremos de mensajes, reservas y bajadas de precio.</p>
        ) : (
          <ul className="panel list" style={{ marginTop: 4, listStyle: 'none' }}>
            {notifications.map((n) => {
              const look = LOOK[n.kind] ?? { icon: 'bell' as IconName, tone: 'sky' as Tone };
              const tone = TONES[look.tone];
              return (
                <li key={n.id} className={styles.item}>
                  <button type="button" className={styles.notif} onClick={() => open(n)}>
                    <span className={styles.ni} style={{ background: tone.bg, color: tone.ink }}><Icon name={look.icon} size={20} /></span>
                    <span style={{ flex: 1 }}>
                      <b className={!n.read ? styles.unread : undefined}>
                        {n.title}
                        {!n.read && <span className="sr-only"> (sin leer)</span>}
                      </b>
                      {n.body && <span className={styles.body}>{n.body}</span>}
                      <span className="cmeta" style={{ marginTop: 3 }}>{timeAgo(n.created_at).replace(/^./, (c) => c.toUpperCase())}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
