import { useNavigate } from 'react-router';
import { useApp } from '../app/AppState';
import { Art, type ArtKey } from '../components/Art';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { TabBar } from '../components/TabBar';
import { TONES, type Tone } from '../data/catalog';
import { euros, rating } from '../data/format';
import { DEMO_USER, formatDate } from '../data/user';
import styles from './Profile.module.css';

type Status = 'live' | 'reserved' | 'sold' | 'paused';
const STATUS_LABEL: Record<Status, string> = { live: 'En venta', reserved: 'Reservado', sold: 'Vendido', paused: 'Pausado' };

interface MyItem { title: string; price: number; img?: string; art: ArtKey; tone: Tone; status: Status; editable?: boolean }

const REVIEWS: { name: string; when: string; text: string; tone: Tone }[] = [
  { name: 'Carmen', when: 'hace 2 semanas', text: 'La cuna estaba impecable y Laura fue puntualísima. Repetiría.', tone: 'sky' },
  { name: 'Íñigo', when: 'hace 1 mes', text: 'Todo tal cual en las fotos. Muy fácil quedar en la plaza.', tone: 'mint' },
];

export function Profile() {
  const { myListing, setMyListing, toast, resetDemo } = useApp();
  const navigate = useNavigate();
  const u = DEMO_USER;

  const mine: MyItem[] = [];
  if (myListing !== 'none') mine.push({ title: 'Bañera plegable con hamaca', price: 25, img: 'banera', art: 'bath', tone: 'sky', status: myListing, editable: true });
  mine.push({ title: 'Lote 18 prendas niña 0-3 meses', price: 28, img: 'lote-ropa', art: 'clothes', tone: 'pink', status: 'reserved' });
  mine.push({ title: 'Capazo Joolz Day+', price: 120, art: 'stroller', tone: 'lavender', status: 'sold' });
  mine.push({ title: 'Cojín de lactancia', price: 15, art: 'bouncer', tone: 'peach', status: 'sold' });

  const togglePause = () => {
    const next = myListing === 'paused' ? 'live' : 'paused';
    setMyListing(next);
    toast(next === 'paused' ? 'Anuncio pausado: nadie lo verá hasta que lo reactives' : 'Anuncio visible de nuevo');
  };

  return (
    <>
      <header className="app-top">
        <div className="row between">
          <h1 className="page-title">Perfil</h1>
          <button type="button" className="icon-btn" aria-label="Ajustes" onClick={() => toast('Ajustes: próximamente')}><Icon name="gear" size={20} /></button>
        </div>
      </header>
      <main className="scroll fade">
        <div className={styles.prof}>
          <div className="avatar" style={{ background: 'var(--primary-soft)', color: 'var(--primary)', width: 66, height: 66, fontSize: 24 }} aria-hidden="true">{u.name[0]}</div>
          <div>
            <h2 className={styles.name}>{u.name}</h2>
            <div className="cmeta"><Icon name="pin" size={13} /> {u.neighborhood} · <span className="verified"><Icon name="shield" size={13} /> Verificada</span></div>
            <div className="cmeta"><Icon name="star" size={13} /> {rating(u.rating)} · {u.ratingCount} valoraciones</div>
          </div>
        </div>

        <dl className={styles.stats}>
          <div className={styles.stat}><dd>{u.stats.sold}</dd><dt>Vendidos</dt></div>
          <div className={styles.stat}><dd>{u.stats.bought}</dd><dt>Comprados</dt></div>
          <div className={styles.stat}><dd>{euros(u.stats.recovered)}</dd><dt>Recuperados</dt></div>
        </dl>

        <div className={styles.baby}>
          <div className={styles.babyAv}><Icon name="baby" size={28} /></div>
          <div style={{ flex: 1 }}>
            <small>Perfil del bebé</small>
            <strong>{u.baby.name} · nació el {formatDate(u.baby.birthDate)}</strong>
            <div className="cmeta">Usamos solo la fecha para sugerirte qué comprar y qué vender</div>
          </div>
        </div>

        <section className="section">
          <div className="section-head"><h2 className={styles.h}>Mis anuncios</h2></div>
          <ul className="panel list" style={{ marginTop: 0, listStyle: 'none' }}>
            {mine.map((m) => (
              <li key={m.title} className="listrow">
                <div className="mini" style={{ width: 52, height: 52 }}>
                  {m.img ? <img src={`/img/${m.img}.jpg`} alt="" /> : <Art name={m.art} color={TONES[m.tone].ink} className={styles.art} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="ctitle one">{m.title}</div>
                  <b>{euros(m.price)}</b>
                  {m.editable && (
                    <div className={styles.actions}>
                      <button type="button" onClick={() => toast('Abriendo el anuncio para editarlo')}>Editar</button>
                      <button type="button" onClick={togglePause}>{myListing === 'paused' ? 'Reactivar' : 'Pausar'}</button>
                    </div>
                  )}
                </div>
                <span className={`pill ${m.status}`}>{STATUS_LABEL[m.status]}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="section">
          <div className="section-head">
            <h2 className={styles.h}>Valoraciones</h2>
            <span className="cmeta"><Icon name="star" size={13} /> {rating(u.rating)} · {u.ratingCount}</span>
          </div>
          <ul className="panel list" style={{ marginTop: 0, listStyle: 'none' }}>
            {REVIEWS.map((r) => (
              <li key={r.name} className={styles.review}>
                <div className="row">
                  <div className="avatar" style={{ width: 34, height: 34, fontSize: 12, background: TONES[r.tone].bg, color: TONES[r.tone].ink }} aria-hidden="true">{r.name[0]}</div>
                  <div style={{ flex: 1 }}><b>{r.name}</b><div className="cmeta">{r.when}</div></div>
                  <span className={styles.stars} role="img" aria-label="5 estrellas">
                    {[1, 2, 3, 4, 5].map((n) => <Icon key={n} name="star" size={13} filled />)}
                  </span>
                </div>
                <p className={styles.reviewText}>{r.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="nudge" style={{ marginTop: 16 }}>
          <div className="row"><Icon name="gift" size={24} style={{ color: '#B4613E' }} /><strong>Pasa el testigo</strong></div>
          <p>Invita a una amiga embarazada: las dos tenéis 5 € para vuestra próxima compra.</p>
          <Button size="sm" variant="dark" style={{ alignSelf: 'flex-start' }} onClick={() => toast('Invitación copiada')}>Invitar a una amiga</Button>
        </div>

        <button
          type="button"
          className={styles.reset}
          onClick={() => { resetDemo(); navigate('/bienvenida', { replace: true }); }}
        >
          Reiniciar la demo
        </button>
      </main>
      <TabBar />
    </>
  );
}
