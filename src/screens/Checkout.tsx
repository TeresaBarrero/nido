import { useNavigate, useParams } from 'react-router';
import { useApp } from '../app/AppState';
import { BackButton } from '../components/BackButton';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { eurosCents, firstName, km, protectionFee } from '../data/format';
import { productImage } from '../data/products';
import { useListing } from '../data/listings';
import { LoadError, LoadingScreen } from '../components/LoadState';
import { NotFound } from './NotFound';
import styles from './Checkout.module.css';

export function Checkout() {
  const { id } = useParams();
  const { data: p, loading, error } = useListing(Number(id));
  const { acceptMeeting, toast } = useApp();
  const navigate = useNavigate();
  if (loading) return <LoadingScreen />;
  if (!p) return error ? <LoadError withBack /> : <NotFound />;

  const fee = protectionFee(p.price);
  const total = p.price + fee;

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
          <div className={styles.meet}><Icon name="pin" size={16} /> {p.meetingPoint} · sábado 21 nov, 10:30</div>
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
        <Button onClick={() => { acceptMeeting(p.id); navigate(`/reservado/${p.id}`, { replace: true }); }}>
          <Icon name="lock" size={18} /> Pagar {eurosCents(total)}
        </Button>
      </div>
    </>
  );
}
