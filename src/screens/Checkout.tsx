import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { errorMessage, useAuth } from '../app/Auth';
import { useApp } from '../app/AppState';
import { BackButton } from '../components/BackButton';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { LoadError, LoadingScreen } from '../components/LoadState';
import { fetchLatestProposal, meetingLabel, reserveListing, useMyReservation } from '../data/api';
import { eurosCents, firstName, km, protectionFee } from '../data/format';
import { useListing } from '../data/listings';
import { productImage } from '../data/products';
import { NotFound } from './NotFound';
import styles from './Checkout.module.css';

export function Checkout() {
  const { id } = useParams();
  const listingId = Number(id);
  const { data: p, loading, error } = useListing(listingId);
  const { userId } = useAuth();
  const { toast } = useApp();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<{ place: string; at: string } | null>(null);
  const [paying, setPaying] = useState(false);
  const myRes = useMyReservation(listingId, userId);

  useEffect(() => {
    if (userId) fetchLatestProposal(listingId, userId).then(setProposal);
  }, [listingId, userId]);

  if (loading) return <LoadingScreen />;
  if (!p) return error ? <LoadError withBack /> : <NotFound />;
  if ((p.status && p.status !== 'live') || (myRes && myRes.status !== 'cancelled')) {
    return <Navigate to={`/reservado/${p.id}`} replace />;
  }

  const fee = protectionFee(p.price);
  const total = p.price + fee;

  const pay = async () => {
    setPaying(true);
    try {
      await reserveListing(p.id);
      navigate(`/reservado/${p.id}`, { replace: true });
    } catch (e) {
      toast(errorMessage(e, 'No se ha podido completar la reserva.'));
      setPaying(false);
    }
  };

  return (
    <>
      <header className="bar">
        <BackButton />
        <h1 className={styles.title}>Pagar y reservar</h1>
      </header>
      <main className="scroll fade">
        <div className="panel row" style={{ gap: 12, marginTop: 4 }}>
          <div className="mini" style={{ width: 58, height: 58 }}><img src={productImage(p)} alt="" /></div>
          <div style={{ flex: 1 }}>
            <div className="ctitle">{p.title}</div>
            <div className="cmeta">{p.seller.name} · {km(p.distanceKm)}</div>
          </div>
        </div>

        <section className="panel">
          <h2 className={styles.h}>Entrega en mano</h2>
          <div className={styles.meet}>
            <Icon name="pin" size={16} /> {proposal?.place ?? p.meetingPoint}
            {proposal?.at ? ` · ${meetingLabel(proposal.at)}` : ' · el próximo sábado, 10:30'}
          </div>
        </section>

        <section className="panel" aria-label="Resumen del pago">
          <div className={styles.line}><span>Precio</span><span>{eurosCents(p.price)}</span></div>
          <div className={styles.line}><span>Protección Nido (5 %)</span><span>{eurosCents(fee)}</span></div>
          <div className={`${styles.line} ${styles.total}`}><b>Total</b><b className="price">{eurosCents(total)}</b></div>
        </section>

        <div className="trust">
          <Icon name="shield" size={26} />
          <div>
            <b>Tu dinero queda retenido</b>
            <p>{firstName(p.seller.name)} lo recibe cuando le enseñes tu código de entrega. Si no os encontráis o el artículo no es como se describe, te lo devolvemos.</p>
          </div>
        </div>

        <div className="panel row" style={{ gap: 12 }}>
          <span className={styles.visa} aria-hidden="true">VISA</span>
          <span style={{ flex: 1 }}>Visa ···· 4417 <span className="sr-only">(tarjeta de prueba)</span></span>
          <button type="button" className="link" onClick={() => toast('También Bizum y Apple Pay')}>Cambiar</button>
        </div>
        <p className={styles.demo}>Demo: no se realiza ningún cargo real.</p>
      </main>
      <div className="actionbar">
        <Button onClick={pay} disabled={paying}>
          <Icon name="lock" size={18} /> {paying ? 'Procesando el pago…' : `Pagar ${eurosCents(total)}`}
        </Button>
      </div>
    </>
  );
}
