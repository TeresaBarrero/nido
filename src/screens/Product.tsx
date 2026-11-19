import { useEffect } from 'react';
import { useParams } from 'react-router';
import { completeTask } from '../app/testMode';
import { useApp } from '../app/AppState';
import { useAuth } from '../app/Auth';
import { BackButton } from '../components/BackButton';
import { ButtonLink } from '../components/Button';
import { FavButton } from '../components/FavButton';
import { Icon } from '../components/Icon';
import { TONES, stageLabel } from '../data/catalog';
import { euros, initials, km, rating } from '../data/format';
import { productImage } from '../data/products';
import { useListing } from '../data/listings';
import { useMyReservation } from '../data/api';
import { LoadError, LoadingScreen } from '../components/LoadState';
import { NotFound } from './NotFound';
import styles from './Product.module.css';

// Si el navegador no tiene View Transitions, la foto entra con una animación propia.
const hasViewTransitions = typeof document !== 'undefined' && 'startViewTransition' in document;

export function Product() {
  const { id } = useParams();
  const { data: p, loading, error } = useListing(Number(id));
  const { favorites, toast } = useApp();
  const { userId } = useAuth();
  const myRes = useMyReservation(Number(id), userId);
  // Tarea del modo prueba: algo para un bebé de 6 meses a menos de 5 km.
  useEffect(() => {
    if (p && p.stages.includes('6-12') && p.distanceKm <= 5) completeTask(userId, 'find');
  }, [p, userId]);
  if (loading) return <LoadingScreen />;
  if (!p) return error ? <LoadError withBack /> : <NotFound />;

  const saving = p.newPrice ? Math.round((1 - p.price / p.newPrice) * 100) : null;
  const tone = TONES[p.seller.tone];

  return (
    <>
      <main className="scroll" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
        <div className={[styles.hero, !hasViewTransitions && styles.grow].filter(Boolean).join(' ')} style={{ viewTransitionName: 'hero' }}>
          <div className={styles.floating}>
            <BackButton />
            <div className="row">
              <button
                type="button"
                className="icon-btn"
                aria-label="Compartir"
                onClick={async () => {
                  const url = window.location.href;
                  try {
                    if (navigator.share) await navigator.share({ title: p.title, url });
                    else { await navigator.clipboard.writeText(url); toast('Enlace copiado para compartir por WhatsApp'); }
                  } catch { /* compartir cancelado */ }
                }}
              >
                <Icon name="share" size={19} />
              </button>
              <FavButton id={p.id} size={19} className={styles.fav} label={favorites.has(p.id) ? 'Quitar de favoritos' : 'Guardar en favoritos'} />
            </div>
          </div>
          <img src={productImage(p)} alt={p.title} />
          <div className={styles.dots} aria-hidden="true"><i /><i /><i /></div>
        </div>

        <div className={styles.sheet}>
          <h1 className={styles.title}>{p.title}</h1>
          <div className={styles.price}>
            <b>{euros(p.price)}</b>
            {p.newPrice && <><s>{euros(p.newPrice)} nuevo</s><em>Ahorras {saving} %</em></>}
          </div>

          <dl className="facts">
            <div className="fact"><dt><small>Estado</small></dt><dd><b>{p.condition}</b></dd></div>
            <div className="fact"><dt><small>Uso</small></dt><dd><b>{p.usage}</b></dd></div>
            <div className="fact"><dt><small>Etapa</small></dt><dd><b>{p.stages.map(stageLabel).join(', ')}</b></dd></div>
            <div className="fact"><dt><small>Distancia</small></dt><dd><b>{km(p.distanceKm)}{p.distanceKm <= 2 ? ' · a pie' : ''}</b></dd></div>
            <div className="fact wide"><dt><small>Incluye</small></dt><dd><b>{p.includes}</b></dd></div>
          </dl>

          <ul className="tags" aria-label="Higiene">
            {p.hygiene.map((h) => <li key={h} className="tag"><Icon name="check" size={15} /> {h}</li>)}
          </ul>

          <p className={styles.desc}>{p.description}</p>

          <div className={styles.seller}>
            <div className="avatar" style={{ background: tone.bg, color: tone.ink }} aria-hidden="true">{initials(p.seller.name)}</div>
            <div style={{ flex: 1 }}>
              <b>{p.seller.name}</b>
              <div className="cmeta">
                <Icon name="star" size={13} /> {rating(p.seller.rating)} · {p.seller.sales} ventas
                {p.seller.verified && <> · <span className="verified"><Icon name="shield" size={13} /> Verificada</span></>}
              </div>
            </div>
            <span className="cmeta" title="Suele responder en 1 hora"><Icon name="clock" size={13} /> 1 h</span>
          </div>

          <div className={styles.map}>
            <svg width="100%" height="100%" viewBox="0 0 340 120" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 40h340M0 88h340M70 0v120M180 0v120M270 0v120M0 0l140 120" stroke="#fff" strokeWidth="7" fill="none" />
            </svg>
            <span className={styles.pin} aria-hidden="true" />
            <span className={styles.mapLabel}>Entrega sugerida: {p.meetingPoint}</span>
          </div>

          <div className="trust">
            <Icon name="lock" size={24} />
            <div><b>Pago protegido también en mano</b><p>Pagas en la app y el dinero se libera cuando confirmas la entrega con un código.</p></div>
          </div>
        </div>
      </main>

      <div className="actionbar">
        {p.sellerId === userId ? (
          <ButtonLink to="/perfil" variant="ghost">Es tu anuncio · Gestionarlo</ButtonLink>
        ) : myRes && myRes.status !== 'cancelled' ? (
          <>
            <ButtonLink to={`/chat/${p.id}`} variant="ghost"><Icon name="chat" size={19} /> Chat</ButtonLink>
            <ButtonLink to={`/reservado/${p.id}`} variant="dark"><Icon name="check" size={18} /> {myRes.status === 'delivered' ? 'Comprado' : 'Pagado'}</ButtonLink>
          </>
        ) : p.status && p.status !== 'live' ? (
          <>
            <ButtonLink to={`/chat/${p.id}`} variant="ghost"><Icon name="chat" size={19} /> Chat</ButtonLink>
            <ButtonLink to={`/reservado/${p.id}`} variant="dark">{p.status === 'sold' ? 'Vendido' : 'Reservado'}</ButtonLink>
          </>
        ) : (
          <>
            <ButtonLink to={`/chat/${p.id}`} variant="ghost"><Icon name="chat" size={19} /> Chatear</ButtonLink>
            <ButtonLink to={`/pagar/${p.id}`}>Pagar · {euros(p.price)}</ButtonLink>
          </>
        )}
      </div>
    </>
  );
}
