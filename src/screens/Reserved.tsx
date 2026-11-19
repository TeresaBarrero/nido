import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { errorMessage, useAuth } from '../app/Auth';
import { useApp } from '../app/AppState';
import { Button, ButtonLink } from '../components/Button';
import { Icon } from '../components/Icon';
import { TabBar, useGoHome } from '../components/TabBar';
import { LoadError, LoadingScreen } from '../components/LoadState';
import { confirmDelivery, fetchMyReservation, leaveReview, meetingLabel, type Reservation } from '../data/api';
import { euros, firstName } from '../data/format';
import { useListing } from '../data/listings';
import { NotFound } from './NotFound';
import styles from './Reserved.module.css';

/** Reserva con la barra inferior visible, para poder salir a Inicio en cualquier momento. */
export function Reserved() {
  return (
    <>
      <ReservedContent />
      <TabBar active={null} />
    </>
  );
}

function ReservedContent() {
  const { id } = useParams();
  const listingId = Number(id);
  const { data: p, loading, error } = useListing(listingId);
  const { userId, baby } = useAuth();
  const { toast } = useApp();
  const [res, setRes] = useState<Reservation | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [stars, setStars] = useState(0);
  const goHome = useGoHome();

  useEffect(() => {
    if (!userId) return;
    fetchMyReservation(listingId, userId).then(setRes).catch(() => setRes(null));
  }, [listingId, userId]);

  if (loading || res === undefined) return <LoadingScreen />;
  if (!p) return error ? <LoadError withBack /> : <NotFound />;
  const seller = firstName(p.seller.name);

  if (!res) {
    return (
      <main className="done-screen fade">
        <div className="ok" style={{ background: 'var(--neutral)', color: 'var(--ink-2)' }}><Icon name="lock" size={40} /></div>
        <h1 className={styles.h}>{p.status === 'sold' ? 'Ya está vendido' : 'Ya está reservado'}</h1>
        <p>Otra familia se ha adelantado. Crea una alerta en Buscar y te avisamos cuando aparezca algo parecido.</p>
        <ButtonLink to="/buscar" block>Buscar algo parecido</ButtonLink>
        <ButtonLink to="/" variant="ghost" block>Volver al inicio</ButtonLink>
      </main>
    );
  }

  const deliver = async () => {
    setBusy(true);
    try {
      await confirmDelivery(res.id);
      setRes({ ...res, status: 'delivered' });
    } catch (e) {
      toast(errorMessage(e));
    } finally { setBusy(false); }
  };

  const rate = async (n: number) => {
    if (stars || !userId || !p.sellerId) return;
    setStars(n);
    try {
      await leaveReview({ reservationId: res.id, authorId: userId, targetId: p.sellerId, stars: n });
      toast('Gracias. Tu valoración ayuda a otras familias');
    } catch (e) {
      setStars(0);
      toast(errorMessage(e, 'No se ha podido guardar la valoración.'));
    }
  };

  if (res.status === 'delivered') {
    return (
      <main className="done-screen fade">
        <div className="ok" style={{ background: 'var(--butter)', color: '#9A7413' }}><Icon name="star" size={40} /></div>
        <h1 className={styles.h}>Entrega confirmada</h1>
        <p>Has ahorrado {p.newPrice ? euros(p.newPrice - p.price) : 'dinero'} y el artículo tiene una segunda vida. ¿Qué tal con {seller}?</p>
        <div className={styles.stars} role="group" aria-label={`Valora a ${seller}`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n} type="button" disabled={stars > 0 && stars !== n}
              aria-pressed={stars >= n}
              aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
              onClick={() => rate(n)}
            >
              <Icon name="star" size={34} />
            </button>
          ))}
        </div>
        <div className="nudge" style={{ textAlign: 'left', width: '100%', marginTop: 14 }}>
          <strong>¿Y cuando {baby?.name || 'tu bebé'} ya no lo use?</strong>
          <p>Te recordaremos venderlo cuando deje de valerle. Así otra familia del barrio también ahorra.</p>
        </div>
        <ButtonLink to="/" variant="ghost" block style={{ marginTop: 6 }}>Volver al inicio</ButtonLink>
      </main>
    );
  }

  const code = res.delivery_code;
  return (
    <main className="done-screen fade">
      <div className="ok draw"><Icon name="check" size={44} /></div>
      <h1 className={`${styles.h} rise`}>¡Pagado!</h1>
      <p className="rise d1">
        Quedas con {seller} el {meetingLabel(res.meeting_at).replace(' · ', ' a las ').toLowerCase()} en {res.meeting_place}. Enséñale este código al recogerlo:
      </p>
      <div className={`${styles.code} rise d2`} aria-label={`Código de entrega ${code.split('').join(' ')}`}>{code}</div>
      <details className="faq rise d3">
        <summary>¿Y si {seller} no se presenta?</summary>
        <p>Si no os encontráis, cancela la reserva desde el chat y te devolvemos el dinero en 24 horas. Las ausencias quedan registradas en el perfil.</p>
      </details>
      <div className="stack" style={{ marginTop: 6 }}>
        <Button block onClick={deliver} disabled={busy}>{busy ? 'Confirmando…' : 'Simular la entrega'}</Button>
        <ButtonLink to={`/chat/${p.id}`} variant="ghost" block>Abrir el chat</ButtonLink>
        <Button variant="ghost" block onClick={() => goHome()}>Volver al inicio</Button>
      </div>
    </main>
  );
}
