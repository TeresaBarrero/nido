import { useState, type FormEvent } from 'react';
import { errorMessage, useAuth } from '../app/Auth';
import { useApp } from '../app/AppState';
import { useTestMode } from '../app/testMode';
import { BackButton } from '../components/BackButton';
import { Button, ButtonLink } from '../components/Button';
import { Icon } from '../components/Icon';
import { supabase } from '../data/supabase';
import styles from './Feedback.module.css';

function Scale({ id, label, low, high, value, onChange }: {
  id: string; label: string; low: string; high: string; value: number; onChange: (n: number) => void;
}) {
  return (
    <fieldset className={`panel ${styles.scale}`}>
      <legend className={styles.q}>{label}</legend>
      <div className={styles.options}>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className={styles.opt}>
            <input type="radio" name={id} value={n} checked={value === n} onChange={() => onChange(n)} />
            <span>{n}</span>
          </label>
        ))}
      </div>
      <div className={styles.ends} aria-hidden="true"><span>{low}</span><span>{high}</span></div>
    </fieldset>
  );
}

export function Feedback() {
  const { userId, isDemo } = useAuth();
  const { toast } = useApp();
  const test = useTestMode(userId);
  const [ease, setEase] = useState(0);
  const [trust, setTrust] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ease || !trust) { toast('Elige una puntuación en las dos preguntas'); return; }
    setBusy(true);
    const { error } = await supabase.from('feedback').insert({
      profile_id: userId, ease, trust, comment: comment.trim() || null, tasks_done: test.done, is_demo: isDemo,
    });
    setBusy(false);
    if (error) { toast(errorMessage(error, 'No se ha podido enviar. Inténtalo de nuevo.')); return; }
    test.markAnswered();
    setSent(true);
  };

  if (sent) {
    return (
      <main className="done-screen fade">
        <div className="ok draw"><Icon name="check" size={44} /></div>
        <h1 className={styles.title}>¡Muchas gracias!</h1>
        <p>Tu opinión nos ayuda a mejorar Nido. Puedes seguir explorando la app todo lo que quieras.</p>
        <ButtonLink to="/" block>Volver al inicio</ButtonLink>
      </main>
    );
  }

  return (
    <>
      <header className="bar">
        <BackButton />
        <h1 className={styles.title}>Tu opinión</h1>
      </header>
      <main className="scroll fade">
        <p className="muted" style={{ marginTop: 4 }}>
          Has completado {test.done.length} de 3 tareas. Tres preguntas rápidas y listo.
        </p>
        <form className={styles.form} onSubmit={submit}>
          <Scale id="ease" label="¿Te ha resultado fácil usar Nido?" low="1 · Muy difícil" high="5 · Muy fácil" value={ease} onChange={setEase} />
          <Scale id="trust" label="¿Comprarías aquí con confianza?" low="1 · Nada" high="5 · Totalmente" value={trust} onChange={setTrust} />
          <div className="panel">
            <div className="field" style={{ marginTop: 0 }}>
              <label htmlFor="comment">¿Algo que mejorarías o que te haya gustado? (opcional)</label>
              <textarea id="comment" rows={4} maxLength={2000} value={comment} onChange={(e) => setComment(e.target.value)} />
            </div>
          </div>
          <Button type="submit" block disabled={busy}>{busy ? 'Enviando…' : 'Enviar mi opinión'}</Button>
          <p className="cmeta" style={{ justifyContent: 'center', textAlign: 'center' }}>Tus respuestas solo las ve la autora del proyecto.</p>
        </form>
      </main>
    </>
  );
}
