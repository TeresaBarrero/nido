import { useEffect, useState, type FormEvent } from 'react';
import { errorMessage, useAuth } from '../app/Auth';
import { useApp } from '../app/AppState';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { Logo } from '../components/Logo';
import { supabase } from '../data/supabase';
import styles from './Onboarding.module.css';

type Step = 'splash' | 'start' | 'email' | 'sent' | 0 | 1 | 2;

// Centro de Madrid: se usa si la persona no comparte su ubicación.
const MADRID = { lat: 40.4168, lng: -3.7038 };

export function Onboarding() {
  const { session, userId, profile, refresh, startDemo, sendMagicLink } = useAuth();
  const { toast } = useApp();
  const [step, setStep] = useState<Step>(session ? 0 : 'splash');
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [hood, setHood] = useState('');
  const [askHood, setAskHood] = useState(false);
  const [birth, setBirth] = useState('');
  const [babyName, setBabyName] = useState('');

  // El splash dura 1,5 s.
  useEffect(() => {
    if (step !== 'splash') return;
    const t = window.setTimeout(() => setStep('start'), 1500);
    return () => window.clearTimeout(t);
  }, [step]);

  // Al volver del enlace mágico ya hay sesión: pasa a los pasos de bienvenida.
  useEffect(() => {
    if (session && typeof step !== 'number') setStep(0);
  }, [session, step]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try { await fn(); } catch (e) { toast(errorMessage(e)); } finally { setBusy(false); }
  };

  const demo = () => run(async () => {
    await startDemo();
    toast('Estás en la demo: datos de ejemplo y pagos simulados');
  });

  const saveLocation = (point: { lat: number; lng: number }, neighborhood: string | null) => run(async () => {
    const { error } = await supabase.from('profiles').update({ ...point, neighborhood }).eq('id', userId!);
    if (error) throw error;
    setStep(1);
  });

  const useMyLocation = () => {
    if (!navigator.geolocation) { setAskHood(true); return; }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setBusy(false); saveLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }, null); },
      () => { setBusy(false); setAskHood(true); toast('No hemos podido obtener tu ubicación. Escribe tu barrio.'); },
      { timeout: 10000, maximumAge: 600000 },
    );
  };

  const saveBaby = (e: FormEvent) => {
    e.preventDefault();
    if (!birth) { setStep(2); return; }
    run(async () => {
      const { error } = await supabase.from('babies').insert({ profile_id: userId!, birth_date: birth, name: babyName.trim() || null });
      if (error) throw error;
      setStep(2);
    });
  };

  const finish = () => run(async () => {
    const { error } = await supabase.from('profiles').update({ onboarded: true }).eq('id', userId!);
    if (error) throw error;
    await refresh();
  });

  if (step === 'splash') {
    return (
      <div className={`${styles.splash} fade`}>
        <Logo size={96} className={styles.logo} />
        <h1 className={styles.wordmark}>nido</h1>
        <p>De familia a familia, en tu barrio</p>
      </div>
    );
  }

  if (step === 'start') {
    return (
      <main className={`${styles.onb} fade`}>
        <div className={styles.hero} style={{ background: 'var(--primary-soft)' }}><Logo size={110} /></div>
        <h1 className={styles.title}>Cosas de bebé de familias de tu barrio</h1>
        <p className="muted">Compra y vende en mano, cerca de casa, con el pago protegido por Nido.</p>
        <div className="stack">
          <Button block disabled={busy} onClick={demo}><Icon name="sparkle" size={18} /> {busy ? 'Preparando la demo…' : 'Probar la demo'}</Button>
          <Button block variant="ghost" disabled={busy} onClick={() => setStep('email')}>Entrar con mi correo</Button>
        </div>
        <p className={styles.note}>La demo usa datos de ejemplo y pagos simulados. No necesitas registrarte.</p>
      </main>
    );
  }

  if (step === 'email') {
    return (
      <main className={`${styles.onb} fade`}>
        <button type="button" className={styles.skip} onClick={() => setStep('start')}>Volver</button>
        <h1 className={styles.title}>Entra con tu correo</h1>
        <p className="muted">Te enviamos un enlace para entrar, sin contraseña.</p>
        <form className={styles.form} onSubmit={(e) => { e.preventDefault(); run(async () => { await sendMagicLink(email.trim()); setStep('sent'); }); }}>
          <div className="field" style={{ marginTop: 0 }}>
            <label htmlFor="email">Correo electrónico</label>
            <input id="email" type="email" required autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button type="submit" block disabled={busy || !email.includes('@')}>{busy ? 'Enviando…' : 'Enviarme el enlace'}</Button>
        </form>
      </main>
    );
  }

  if (step === 'sent') {
    return (
      <main className="done-screen fade">
        <div className="ok" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}><Icon name="send" size={40} /></div>
        <h1 className={styles.title}>Revisa tu correo</h1>
        <p>Te hemos enviado un enlace a <b>{email}</b>. Ábrelo desde este mismo dispositivo para entrar.</p>
        <p className={styles.note}>¿No llega? Mira en la carpeta de spam o espera un minuto.</p>
        <Button variant="ghost" block onClick={() => setStep('email')}>Usar otro correo</Button>
      </main>
    );
  }

  const dots = (
    <div className={styles.dots} aria-hidden="true">
      {[0, 1, 2].map((i) => <i key={i} className={i === step ? styles.on : undefined} />)}
    </div>
  );

  if (step === 0) {
    return (
      <main className={`${styles.onb} fade`} key={0}>
        <button type="button" className={styles.skip} onClick={() => saveLocation(MADRID, profile?.neighborhood ?? null)}>Saltar</button>
        <div className={styles.hero} style={{ background: 'var(--mint)', color: '#2F7A5E' }}>
          <Icon name="pin" size={90} strokeWidth={1.6} />
        </div>
        <h1 className={styles.title}>Cosas de bebé de familias de tu barrio</h1>
        <p className="muted">Te enseñamos primero lo que está cerca, para que puedas recogerlo a pie y sin gastos de envío.</p>
        {askHood ? (
          <form className={styles.form} onSubmit={(e) => { e.preventDefault(); saveLocation(MADRID, hood.trim() || null); }}>
            <div className="field" style={{ marginTop: 0 }}>
              <label htmlFor="hood">Tu barrio o código postal</label>
              <input id="hood" value={hood} onChange={(e) => setHood(e.target.value)} autoComplete="postal-code" />
            </div>
            <Button type="submit" block disabled={busy}>Continuar</Button>
          </form>
        ) : (
          <div className="stack">
            <Button block disabled={busy} onClick={useMyLocation}><Icon name="pin" size={18} /> Usar mi ubicación</Button>
            <Button block variant="ghost" disabled={busy} onClick={() => setAskHood(true)}>Escribir mi barrio</Button>
          </div>
        )}
        {dots}
        <p className="sr-only" aria-live="polite">Paso 1 de 3</p>
      </main>
    );
  }

  if (step === 1) {
    return (
      <main className={`${styles.onb} fade`} key={1}>
        <button type="button" className={styles.skip} onClick={() => setStep(2)}>Ahora no</button>
        <div className={styles.hero} style={{ background: 'var(--lavender)', color: '#6A55A3', height: 170 }}>
          <Icon name="baby" size={80} strokeWidth={1.5} />
        </div>
        <h1 className={styles.title}>¿Cuándo nació tu bebé?</h1>
        <p className="muted">Con la fecha te sugerimos lo que necesitará en cada etapa y te avisamos cuando algo deje de valerle.</p>
        <form className={styles.form} onSubmit={saveBaby}>
          <div className="field" style={{ marginTop: 0 }}>
            <label htmlFor="bd">Fecha de nacimiento o prevista</label>
            <input id="bd" type="date" value={birth} onChange={(e) => setBirth(e.target.value)} />
          </div>
          <div className="field" style={{ marginTop: 0 }}>
            <label htmlFor="bn">Nombre (opcional)</label>
            <input id="bn" value={babyName} onChange={(e) => setBabyName(e.target.value)} autoComplete="off" maxLength={40} />
          </div>
          <p className="muted" style={{ fontSize: 13 }}>Sin fotos y sin datos médicos. Puedes borrarlo cuando quieras.</p>
          <Button type="submit" block disabled={busy}>Continuar</Button>
        </form>
        {dots}
        <p className="sr-only" aria-live="polite">Paso 2 de 3</p>
      </main>
    );
  }

  return (
    <main className={`${styles.onb} fade`} key={2}>
      <div style={{ height: 20 }} />
      <h1 className={styles.title}>Compra en mano sin miedo a plantones</h1>
      <p className="muted">El pago protegido funciona también cuando quedáis en persona.</p>
      <ol className={styles.howto}>
        <li className="rise"><span className={styles.n} style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>1</span><span><b>Pagas al reservar.</b> El dinero queda retenido en Nido.</span></li>
        <li className="rise d1"><span className={styles.n} style={{ background: 'var(--mint)', color: 'var(--mint-ink)' }}>2</span><span><b>Quedáis en un punto seguro</b> cerca de casa.</span></li>
        <li className="rise d2"><span className={styles.n} style={{ background: 'var(--peach)', color: '#9A4D2E' }}>3</span><span><b>Enseñas tu código</b> y el pago se libera. Si no os veis, te lo devolvemos.</span></li>
      </ol>
      <Button block style={{ marginTop: 6 }} disabled={busy} onClick={finish}>Empezar</Button>
      {dots}
      <p className="sr-only" aria-live="polite">Paso 3 de 3</p>
    </main>
  );
}
