import { Link, useNavigate } from 'react-router';
import { useAuth } from '../app/Auth';
import { freshFilters, useApp } from '../app/AppState';
import { BabyStrip } from '../components/BabyStrip';
import { Icon } from '../components/Icon';
import { LoadError } from '../components/LoadState';
import { Logo } from '../components/Logo';
import { ProductCard, ProductCardSkeleton } from '../components/ProductCard';
import { SectionTile } from '../components/SectionTile';
import { TabBar } from '../components/TabBar';
import { TestCard } from '../components/TestCard';
import { meetingLabel, useActiveReservation } from '../data/api';
import { SECTIONS, stageLabel } from '../data/catalog';
import { useListings } from '../data/listings';
import { ageInMonths, nextStage, stageForMonths } from '../data/user';
import styles from './Home.module.css';

export function Home() {
  const { profile, baby, userId } = useAuth();
  const { unreadCount, setFilters } = useApp();
  const navigate = useNavigate();
  const { data: all, loading, error, reload } = useListings();
  const reservation = useActiveReservation(userId);

  // Tus propios anuncios no aparecen como sugerencias.
  const listings = all.filter((p) => p.sellerId !== userId);
  const stage = baby ? stageForMonths(ageInMonths(baby.birth_date)) : '0-3';
  const upcoming = baby ? nextStage(stage) : '0-3';
  const near = [...listings].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 4);
  const soon = listings.filter((p) => p.stages.includes(upcoming)).slice(0, 5);

  return (
    <>
      <header className="app-top">
        <div className="row between">
          <div className="row" style={{ gap: 8 }}>
            <Logo size={30} />
            <div>
              <div className={styles.hello}>Hola, {profile?.name ?? 'familia'}</div>
              <span className={styles.loc}><Icon name="pin" size={15} /> {profile?.neighborhood ?? 'Cerca de ti'} · 5 km</span>
            </div>
          </div>
          <Link
            to="/notificaciones"
            className={`icon-btn ${unreadCount ? styles.dot : ''}`}
            aria-label={unreadCount ? `Notificaciones, ${unreadCount} sin leer` : 'Notificaciones'}
          >
            <Icon name="bell" size={20} />
          </Link>
        </div>
        <Link to="/buscar" className={styles.search}>
          <Icon name="search" size={20} />
          <span>Busca bañeras, cunas, ropa 3-6 m…</span>
        </Link>
      </header>

      <main className="scroll fade">
        <h1 className="sr-only">Inicio</h1>
        <nav className={styles.secs} aria-label="Secciones">
          {SECTIONS.map((s) => (
            <SectionTile
              key={s.name}
              section={s}
              onClick={() => { setFilters(freshFilters({ section: s.name, dist: 20 })); navigate('/buscar'); }}
            />
          ))}
        </nav>

        <TestCard />

        <BabyStrip baby={baby} onStage={() => { setFilters(freshFilters({ stage })); navigate('/buscar'); }} />

        <section className="section" style={{ marginTop: 20 }} aria-labelledby="near">
          <div className="section-head">
            <h2 id="near" className={styles.h}>Cerca de ti</h2>
            <Link to="/buscar" className="link">Ver todo</Link>
          </div>
          {error ? (
            <LoadError onRetry={reload} />
          ) : (
            <div className="grid" aria-busy={loading}>
              {loading
                ? [0, 1, 2, 3].map((i) => <ProductCardSkeleton key={i} />)
                : near.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>

        {!error && soon.length > 0 && (
          <section className="section" aria-labelledby="soon">
            <div className="section-head">
              <h2 id="soon" className={styles.h}>{baby ? 'Lo que necesitará pronto' : 'Para los primeros meses'}</h2>
              <span className="cmeta">{stageLabel(upcoming).replace(' m', ' meses')}</span>
            </div>
            <div className="hlist" aria-busy={loading}>
              {soon.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
        <p className={styles.demoNote}>Demo de portfolio · datos y pagos de prueba</p>
      </main>
      {reservation && (
        <Link to={`/reservado/${reservation.listing_id}`} className={`${styles.reserved} rise`}>
          <span className={styles.reservedIcon} aria-hidden="true"><Icon name="check" size={18} /></span>
          <span className={styles.reservedText}>
            <b>Pagado · {reservation.title}</b>
            <span>{meetingLabel(reservation.meeting_at)} · {reservation.meeting_place}</span>
          </span>
          <span className={styles.reservedCta}>Ver</span>
        </Link>
      )}
      <TabBar />
    </>
  );
}
