import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { freshFilters, useApp } from '../app/AppState';
import { BabyStrip } from '../components/BabyStrip';
import { Icon } from '../components/Icon';
import { Logo } from '../components/Logo';
import { ProductCard, ProductCardSkeleton } from '../components/ProductCard';
import { SectionTile } from '../components/SectionTile';
import { TabBar } from '../components/TabBar';
import { SECTIONS, stageLabel } from '../data/catalog';
import { PRODUCTS } from '../data/products';
import { ageInMonths, DEMO_USER, nextStage, stageForMonths } from '../data/user';
import styles from './Home.module.css';

export function Home() {
  const { notificationsRead, setFilters } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Breve esqueleto de carga, como cuando lleguen los datos reales.
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 650);
    return () => window.clearTimeout(t);
  }, []);

  const stage = stageForMonths(ageInMonths(DEMO_USER.baby.birthDate));
  const upcoming = nextStage(stage);
  const near = [...PRODUCTS].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 4);
  const soon = PRODUCTS.filter((p) => p.stages.includes(upcoming)).slice(0, 5);

  return (
    <>
      <header className="app-top">
        <div className="row between">
          <div className="row" style={{ gap: 8 }}>
            <Logo size={30} />
            <div>
              <div className={styles.hello}>Hola, {DEMO_USER.name}</div>
              <span className={styles.loc}><Icon name="pin" size={15} /> {DEMO_USER.neighborhood} · 5 km</span>
            </div>
          </div>
          <Link
            to="/notificaciones"
            className={`icon-btn ${notificationsRead ? '' : styles.dot}`}
            aria-label={notificationsRead ? 'Notificaciones' : 'Notificaciones, 2 sin leer'}
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

        <BabyStrip onStage={() => { setFilters(freshFilters({ stage })); navigate('/buscar'); }} />

        <section className="section" style={{ marginTop: 20 }} aria-labelledby="near">
          <div className="section-head">
            <h2 id="near" className={styles.h}>Cerca de ti</h2>
            <Link to="/buscar" className="link">Ver todo</Link>
          </div>
          <div className="grid" aria-busy={loading}>
            {loading
              ? near.map((p) => <ProductCardSkeleton key={p.id} />)
              : near.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>

        <section className="section" aria-labelledby="soon">
          <div className="section-head">
            <h2 id="soon" className={styles.h}>Lo que necesitará pronto</h2>
            <span className="cmeta">{stageLabel(upcoming).replace(' m', ' meses')}</span>
          </div>
          <div className="hlist">
            {soon.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      </main>
      <TabBar />
    </>
  );
}
