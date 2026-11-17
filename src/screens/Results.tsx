import { useEffect, useState } from 'react';
import { useAuth } from '../app/Auth';
import { BackButton } from '../components/BackButton';
import { Icon } from '../components/Icon';
import { TASKS, type TaskKey } from '../app/testMode';
import { timeAgo } from '../data/api';
import { supabase } from '../data/supabase';
import styles from './Results.module.css';

interface Row { id: string; ease: number; trust: number; comment: string | null; tasks_done: TaskKey[]; is_demo: boolean; created_at: string }

const avg = (xs: number[]) => (xs.length ? (xs.reduce((a, b) => a + b, 0) / xs.length).toLocaleString('es-ES', { maximumFractionDigits: 1 }) : '–');

/** Página privada: respuestas del cuestionario de testers (solo administradoras). */
export function Results() {
  const { userId, isDemo } = useAuth();
  const [admin, setAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const a = await supabase.from('admins').select('profile_id').eq('profile_id', userId).maybeSingle();
      if (!a.data) { setAdmin(false); return; }
      setAdmin(true);
      const { data } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
      setRows((data as Row[]) ?? []);
    })();
  }, [userId]);

  return (
    <>
      <header className="bar">
        <BackButton />
        <h1 className={styles.title}>Resultados del test</h1>
      </header>
      <main className="scroll fade">
        {admin === null ? (
          <div className="panel" aria-busy="true" style={{ height: 120 }} />
        ) : !admin ? (
          <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Icon name="lock" size={26} style={{ color: 'var(--primary)' }} />
            <b>Página privada</b>
            <p className="muted" style={{ fontSize: 14 }}>
              {isDemo
                ? 'Estás en la demo. Sal de la demo desde Perfil y entra con el correo de la autora para ver los resultados.'
                : 'Tu cuenta no tiene acceso a los resultados del test.'}
            </p>
          </div>
        ) : (
          <>
            <dl className={styles.kpis}>
              <div><dd>{rows.length}</dd><dt>Respuestas</dt></div>
              <div><dd>{avg(rows.map((r) => r.ease))}</dd><dt>Facilidad (1-5)</dt></div>
              <div><dd>{avg(rows.map((r) => r.trust))}</dd><dt>Confianza (1-5)</dt></div>
            </dl>
            <section className="panel">
              <h2 className={styles.h}>Tareas completadas</h2>
              <ul className={styles.bars}>
                {TASKS.map((t) => {
                  const n = rows.filter((r) => r.tasks_done.includes(t.key)).length;
                  const pct = rows.length ? Math.round((n / rows.length) * 100) : 0;
                  return (
                    <li key={t.key}>
                      <div className="row between"><span>{t.label}</span><b>{pct} %</b></div>
                      <div className={styles.bar} role="img" aria-label={`${n} de ${rows.length}`}><i style={{ width: `${pct}%` }} /></div>
                    </li>
                  );
                })}
              </ul>
            </section>
            <section className="section">
              <div className="section-head"><h2 className={styles.h}>Comentarios</h2></div>
              {rows.length === 0 ? (
                <p className="muted">Todavía no hay respuestas. Comparte el enlace con tus testers.</p>
              ) : (
                <ul className="panel list" style={{ marginTop: 0, listStyle: 'none' }}>
                  {rows.map((r) => (
                    <li key={r.id} className={styles.item}>
                      <div className="row between">
                        <span className="cmeta">Facilidad <b>{r.ease}</b> · Confianza <b>{r.trust}</b> · {r.tasks_done.length}/3 tareas</span>
                        <span className="cmeta">{timeAgo(r.created_at)}</span>
                      </div>
                      <p className={styles.comment}>{r.comment || <span className="muted">Sin comentario</span>}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}
