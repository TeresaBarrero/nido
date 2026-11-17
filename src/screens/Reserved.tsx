import { useState } from 'react';
import { useParams } from 'react-router';
import { useApp } from '../app/AppState';
import { Button, ButtonLink } from '../components/Button';
import { Icon } from '../components/Icon';
import { euros, firstName } from '../data/format';
import { useListing } from '../data/listings';
import { LoadError, LoadingScreen } from '../components/LoadState';
import { DEMO_USER } from '../data/user';
import { NotFound } from './NotFound';
import styles from './Reserved.module.css';

export function Reserved() {
  const { id } = useParams();
  const { data: p, loading, error } = useListing(Number(id));
  const { toast } = useApp();
  const [delivered, setDelivered] = useState(false);
  const [stars, setStars] = useState(0);
  // Código de entrega de 4 cifras (en la fase 3 lo generará el servidor).
  const [code] = useState(() => String(1000 + Math.floor(Math.random() * 9000)));
  if (loading) return <LoadingScreen />;
  if (!p) return error ? <LoadError withBack /> : <NotFound />;
  const seller = firstName(p.seller.name);

  if (delivered) {
    return (
      <main className="done-screen fade">
        <div className="ok" style={{ background: 'var(--butter)', color: '#9A7413' }}><Icon name="star" size={40} /></div>
        <h1 className={styles.h}>Entrega confirmada</h1>
        <p>Has ahorrado {p.newPrice ? euros(p.newPrice - p.price) : 'dinero'} y el artículo tiene una segunda vida. ¿Qué tal con {seller}?</p>
        <div className={styles.stars} role="group" aria-label={`Valora a ${seller}`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={stars >= n}
              aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
              onClick={() => { setStars(n); toast('Gracias. Tu valoración ayuda a otras familias'); }}
            >
              <Icon name="star" size={34} />
            </button>
          ))}
        </div>
        <div className="nudge" style={{ textAlign: 'left', width: '100%', marginTop: 14 }}>
          <strong>¿Y cuando {DEMO_USER.baby.name} ya no lo use?</strong>
          <p>Te recordaremos venderlo cuando cumpla 1 año. Así otra familia del barrio también ahorra.</p>
        </div>
        <ButtonLink to="/" variant="ghost" block style={{ marginTop: 6 }}>Volver al inicio</ButtonLink>
      </main>
    );
  }

  return (
    <main className="done-screen fade">
      <div className="ok draw"><Icon name="check" size={44} /></div>
      <h1 className={`${styles.h} rise`}>¡Reservado!</h1>
      <p className="rise d1">Quedas con {seller} el sábado a las 10:30 en {p.meetingPoint}. Enséñale este código al recogerlo:</p>
      <div className={`${styles.code} rise d2`} aria-label={`Código de entrega ${code.split('').join(' ')}`}>{code}</div>
      <details className="faq rise d3">
        <summary>¿Y si {seller} no se presenta?</summary>
        <p>Si no os encontráis, cancela la reserva desde el chat y te devolvemos el dinero en 24 horas. Las ausencias quedan registradas en el perfil.</p>
      </details>
      <div className="stack" style={{ marginTop: 6 }}>
        <Button block onClick={() => setDelivered(true)}>Simular la entrega</Button>
        <ButtonLink to="/" variant="ghost" block>Volver al inicio</ButtonLink>
      </div>
    </main>
  );
}
