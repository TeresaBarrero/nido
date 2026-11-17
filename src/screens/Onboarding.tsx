import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../app/AppState';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { Logo } from '../components/Logo';
import { DEMO_USER } from '../data/user';
import styles from './Onboarding.module.css';

type Step = 'splash' | 0 | 1 | 2;

export function Onboarding() {
  const [step, setStep] = useState<Step>('splash');
  const { completeOnboarding } = useApp();
  const navigate = useNavigate();

  // El splash dura 1,5 s y da paso al primer paso.
  useEffect(() => {
    if (step !== 'splash') return;
    const t = window.setTimeout(() => setStep(0), 1500);
    return () => window.clearTimeout(t);
  }, [step]);

  const finish = () => {
    completeOnboarding();
    navigate('/', { replace: true });
  };

  if (step === 'splash') {
    return (
      <div className={`${styles.splash} fade`}>
        <Logo size={96} className={styles.logo} />
        <h1 className={styles.wordmark}>nido</h1>
        <p>De familia a familia, en tu barrio</p>
      </div>
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
        <button type="button" className={styles.skip} onClick={finish}>Saltar</button>
        <div className={styles.hero} style={{ background: 'var(--mint)', color: '#2F7A5E' }}>
          <Icon name="pin" size={90} strokeWidth={1.6} />
        </div>
        <h1 className={styles.title}>Cosas de bebé de familias de tu barrio</h1>
        <p className="muted">Te enseñamos primero lo que está cerca, para que puedas recogerlo a pie y sin gastos de envío.</p>
        <div className="stack">
          <Button block onClick={() => setStep(1)}><Icon name="pin" size={18} /> Usar mi ubicación</Button>
          <Button block variant="ghost" onClick={() => setStep(1)}>Escribir mi código postal</Button>
        </div>
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
        <form
          className={styles.form}
          onSubmit={(e) => { e.preventDefault(); setStep(2); }}
        >
          <div className="field" style={{ marginTop: 0 }}>
            <label htmlFor="bd">Fecha de nacimiento o prevista</label>
            <input id="bd" type="date" defaultValue={DEMO_USER.baby.birthDate} />
          </div>
          <div className="field" style={{ marginTop: 0 }}>
            <label htmlFor="bn">Nombre (opcional)</label>
            <input id="bn" defaultValue={DEMO_USER.baby.name} autoComplete="off" />
          </div>
          <p className="muted" style={{ fontSize: 13 }}>Sin fotos y sin datos médicos. Puedes borrarlo cuando quieras.</p>
          <Button type="submit" block>Continuar</Button>
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
      <Button block style={{ marginTop: 6 }} onClick={finish}>Empezar</Button>
      {dots}
      <p className="sr-only" aria-live="polite">Paso 3 de 3</p>
    </main>
  );
}
