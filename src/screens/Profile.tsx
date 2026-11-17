import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { errorMessage, useAuth } from '../app/Auth';
import { useApp } from '../app/AppState';
import { Button, ButtonLink } from '../components/Button';
import { Icon } from '../components/Icon';
import { TabBar } from '../components/TabBar';
import {
  fetchMyListings, fetchReviews, fetchStats, timeAgo, updateMyListing,
  type MyListing, type ProfileStats, type Review,
} from '../data/api';
import { sectionByName, TONES } from '../data/catalog';
import { Art } from '../components/Art';
import { NO_PHOTO } from '../data/listings';
import { euros, initials, rating } from '../data/format';
import type { ListingStatus } from '../data/products';
import { supabase } from '../data/supabase';
import { formatDate } from '../data/user';
import styles from './Profile.module.css';

const STATUS_LABEL: Record<ListingStatus, string> = { live: 'En venta', reserved: 'Reservado', sold: 'Vendido', paused: 'Pausado', review: 'En revisión' };

export function Profile() {
  const { userId, profile, baby, isDemo, refresh, signOut } = useAuth();
  const { toast } = useApp();
  const navigate = useNavigate();
  const [mine, setMine] = useState<MyListing[] | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [price, setPrice] = useState('');

  const load = useCallback(() => {
    if (!userId) return;
    fetchMyListings(userId).then(setMine).catch(() => setMine([]));
    fetchStats(userId).then(setStats).catch(() => {});
    fetchReviews(userId).then(setReviews).catch(() => {});
  }, [userId]);

  useEffect(load, [load]);

  if (!profile) return null;

  const change = async (m: MyListing, patch: Parameters<typeof updateMyListing>[1], msg: string) => {
    try {
      await updateMyListing(m.id, patch);
      setMine((prev) => prev?.map((x) => (x.id === m.id ? { ...x, ...patch } : x)) ?? null);
      toast(msg);
    } catch (e) { toast(errorMessage(e)); }
  };

  const savePrice = (m: MyListing) => {
    const n = Number(price.replace(',', '.'));
    if (!Number.isFinite(n) || n <= 0) { toast('Escribe un precio válido'); return; }
    setEditing(null);
    change(m, { price: Math.round(n * 100) / 100 }, 'Precio actualizado');
  };

  const removeBaby = async () => {
    if (!baby) return;
    const { error } = await supabase.from('babies').delete().eq('id', baby.id);
    if (error) { toast(errorMessage(error)); return; }
    await refresh();
    toast('Perfil del bebé borrado');
  };

  const leave = async () => {
    await signOut();
    navigate('/bienvenida', { replace: true });
  };

  return (
    <>
      <header className="app-top">
        <div className="row between">
          <h1 className="page-title">Perfil</h1>
          <Link to="/notificaciones" className="icon-btn" aria-label="Notificaciones"><Icon name="bell" size={20} /></Link>
        </div>
      </header>
      <main className="scroll fade">
        {isDemo && (
          <div className="trust" style={{ marginTop: 4 }}>
            <Icon name="sparkle" size={22} />
            <div><b>Estás en la demo</b><p>Datos de ejemplo y pagos simulados. Lo que publiques lo verán otras personas que prueben la demo.</p></div>
          </div>
        )}

        <div className={styles.prof}>
          <div className="avatar" style={{ background: TONES[profile.tone].bg, color: TONES[profile.tone].ink, width: 66, height: 66, fontSize: 24 }} aria-hidden="true">{initials(profile.name)}</div>
          <div>
            <h2 className={styles.name}>{profile.name}</h2>
            <div className="cmeta">
              <Icon name="pin" size={13} /> {profile.neighborhood ?? 'Tu zona'}
              {profile.verified && <> · <span className="verified"><Icon name="shield" size={13} /> Verificada</span></>}
            </div>
            <div className="cmeta">
              <Icon name="star" size={13} /> {profile.rating_count ? `${rating(profile.rating_avg)} · ${profile.rating_count} valoraciones` : 'Sin valoraciones todavía'}
            </div>
          </div>
        </div>

        <dl className={styles.stats}>
          <div className={styles.stat}><dd>{stats?.sold ?? '–'}</dd><dt>Vendidos</dt></div>
          <div className={styles.stat}><dd>{stats?.bought ?? '–'}</dd><dt>Comprados</dt></div>
          <div className={styles.stat}><dd>{stats ? euros(stats.recovered) : '–'}</dd><dt>Recuperados</dt></div>
        </dl>

        <div className={styles.baby}>
          <div className={styles.babyAv}><Icon name="baby" size={28} /></div>
          <div style={{ flex: 1 }}>
            <small>Perfil del bebé</small>
            {baby ? (
              <strong>{baby.name || 'Tu bebé'} · {new Date(baby.birth_date) > new Date() ? 'llega el' : 'nació el'} {formatDate(baby.birth_date)}</strong>
            ) : (
              <strong>Sin añadir</strong>
            )}
            <div className="cmeta">Usamos solo la fecha para sugerirte qué comprar y qué vender</div>
            {baby && <button type="button" className="link" style={{ marginTop: 4 }} onClick={removeBaby}>Borrar</button>}
          </div>
        </div>

        <section className="section">
          <div className="section-head">
            <h2 className={styles.h}>Mis anuncios</h2>
            <Link to="/vender" className="link">Publicar</Link>
          </div>
          {mine && mine.length === 0 ? (
            <div className="panel" style={{ marginTop: 0, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
              <p className="muted" style={{ fontSize: 14 }}>Aún no has publicado nada. ¿Algo que a tu bebé ya no le vale?</p>
              <ButtonLink to="/vender" size="sm">Vender algo</ButtonLink>
            </div>
          ) : (
            <ul className="panel list" style={{ marginTop: 0, listStyle: 'none' }} aria-busy={mine === null}>
              {(mine ?? []).map((m) => (
                <li key={m.id} className="listrow">
                  <Link to={`/producto/${m.id}`} className="mini" style={{ width: 52, height: 52 }} aria-label={`Ver ${m.title}`}>
                    {m.photo === NO_PHOTO ? <Art name={m.art} color={TONES[sectionByName(m.section).tone].ink} className={styles.art} /> : <img src={m.photo} alt="" />}
                  </Link>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ctitle one">{m.title}</div>
                    {editing === m.id ? (
                      <form className="row" style={{ gap: 6, marginTop: 4 }} onSubmit={(e) => { e.preventDefault(); savePrice(m); }}>
                        <label htmlFor={`p${m.id}`} className="sr-only">Nuevo precio en euros</label>
                        <input id={`p${m.id}`} inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} className={styles.priceInput} autoFocus />
                        <span>€</span>
                        <Button size="sm" type="submit">Guardar</Button>
                        <Button size="sm" variant="ghost" type="button" onClick={() => setEditing(null)}>Cancelar</Button>
                      </form>
                    ) : (
                      <b>{euros(m.price)}</b>
                    )}
                    {(m.status === 'live' || m.status === 'paused') && editing !== m.id && (
                      <div className={styles.actions}>
                        <button type="button" onClick={() => { setEditing(m.id); setPrice(String(m.price)); }}>Cambiar precio</button>
                        {m.status === 'live'
                          ? <button type="button" onClick={() => change(m, { status: 'paused' }, 'Anuncio pausado: nadie lo verá hasta que lo reactives')}>Pausar</button>
                          : <button type="button" onClick={() => change(m, { status: 'live' }, 'Anuncio visible de nuevo')}>Reactivar</button>}
                      </div>
                    )}
                  </div>
                  <span className={`pill ${m.status === 'review' ? 'paused' : m.status}`}>{STATUS_LABEL[m.status]}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="section">
          <div className="section-head">
            <h2 className={styles.h}>Valoraciones</h2>
            {profile.rating_count > 0 && <span className="cmeta"><Icon name="star" size={13} /> {rating(profile.rating_avg)} · {profile.rating_count}</span>}
          </div>
          {reviews.length === 0 ? (
            <p className="muted panel" style={{ marginTop: 0, fontSize: 14 }}>Cuando vendas algo, las familias podrán valorarte aquí.</p>
          ) : (
            <ul className="panel list" style={{ marginTop: 0, listStyle: 'none' }}>
              {reviews.map((r) => {
                const tone = TONES[r.author?.tone ?? 'sky'];
                return (
                  <li key={r.id} className={styles.review}>
                    <div className="row">
                      <div className="avatar" style={{ width: 34, height: 34, fontSize: 12, background: tone.bg, color: tone.ink }} aria-hidden="true">{initials(r.author?.name ?? '?')}</div>
                      <div style={{ flex: 1 }}><b>{r.author?.name ?? 'Familia de Nido'}</b><div className="cmeta">{timeAgo(r.created_at)}</div></div>
                      <span className={styles.stars} role="img" aria-label={`${r.stars} estrellas`}>
                        {[1, 2, 3, 4, 5].map((n) => <Icon key={n} name="star" size={13} filled={n <= r.stars} />)}
                      </span>
                    </div>
                    {r.text && <p className={styles.reviewText}>{r.text}</p>}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="nudge" style={{ marginTop: 16 }}>
          <div className="row"><Icon name="gift" size={24} style={{ color: '#B4613E' }} /><strong>Pasa el testigo</strong></div>
          <p>Invita a una amiga embarazada: las dos tenéis 5 € para vuestra próxima compra.</p>
          <Button
            size="sm" variant="dark" style={{ alignSelf: 'flex-start' }}
            onClick={async () => {
              const url = window.location.origin;
              try {
                if (navigator.share) await navigator.share({ title: 'Nido', text: 'Compra y vende cosas de bebé en tu barrio', url });
                else { await navigator.clipboard.writeText(url); toast('Invitación copiada'); }
              } catch { /* cancelado */ }
            }}
          >
            Invitar a una amiga
          </Button>
        </div>

        <button type="button" className={styles.reset} onClick={leave}>
          {isDemo ? 'Salir de la demo' : 'Cerrar sesión'}
        </button>
      </main>
      <TabBar />
    </>
  );
}
