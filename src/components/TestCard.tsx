import { Link } from 'react-router';
import { useAuth } from '../app/Auth';
import { TASKS, useTestMode } from '../app/testMode';
import { ButtonLink } from './Button';
import { Icon } from './Icon';
import styles from './TestCard.module.css';

/** Tarjeta del modo prueba en Inicio: 3 tareas y acceso al cuestionario. */
export function TestCard() {
  const { userId } = useAuth();
  const t = useTestMode(userId);

  if (t.answered) return null;
  if (t.hidden) {
    return (
      <button type="button" className={styles.reopen} onClick={t.show}>
        <Icon name="sparkle" size={15} /> Ver las tareas de la prueba ({t.done.length}/3)
      </button>
    );
  }

  return (
    <section className={styles.card} aria-labelledby="test-title">
      <div className="row between">
        <h2 id="test-title" className={styles.title}>Modo prueba · {t.done.length}/3</h2>
        <button type="button" className="link" onClick={t.hide}>Ocultar</button>
      </div>
      <p className={styles.intro}>Gracias por probar Nido. Intenta estas tareas sin ayuda y cuéntanos qué tal.</p>
      <ol className={styles.tasks}>
        {TASKS.map((task) => {
          const done = t.done.includes(task.key);
          return (
            <li key={task.key} className={done ? styles.done : undefined}>
              <span className={styles.check} aria-hidden="true">{done ? <Icon name="check" size={14} /> : null}</span>
              <span style={{ flex: 1 }}>
                <Link to={task.to} className={styles.task}>{task.label}</Link>
                <span className={styles.hint}>{task.hint}</span>
              </span>
              <span className="sr-only">{done ? '(hecha)' : '(pendiente)'}</span>
            </li>
          );
        })}
      </ol>
      <ButtonLink to="/opinion" size="sm" variant={t.allDone ? 'primary' : 'ghost'} block>
        {t.allDone ? 'Contarnos qué tal (1 minuto)' : 'Terminar y dar mi opinión'}
      </ButtonLink>
    </section>
  );
}
