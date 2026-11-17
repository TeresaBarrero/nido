import { useRef } from 'react';
import { Link } from 'react-router';
import { useApp } from '../app/AppState';
import { euros, km } from '../data/format';
import { productImage, type Product } from '../data/products';
import { FavButton } from './FavButton';
import { Icon } from './Icon';
import styles from './ProductCard.module.css';

export function ProductCard({ product: p }: { product: Product }) {
  const thumb = useRef<HTMLDivElement>(null);
  const { favorites } = useApp();

  return (
    <div className={styles.card}>
      <FavButton id={p.id} className={styles.fav} label={favorites.has(p.id) ? `Quitar ${p.title} de favoritos` : `Guardar ${p.title} en favoritos`} />
      <Link
        to={`/producto/${p.id}`}
        viewTransition
        className={styles.link}
        aria-label={`${p.title}, ${euros(p.price)}, a ${km(p.distanceKm)}, ${p.condition}`}
        onClick={() => {
          // La foto pulsada "crece" hasta la ficha (View Transitions).
          if (thumb.current) thumb.current.style.viewTransitionName = 'hero';
        }}
      >
        <div className={styles.thumb} ref={thumb}>
          {p.isNew ? <span className={`${styles.badge} ${styles.new}`}>Nuevo</span> : p.lotCount ? <span className={styles.badge}>Lote · {p.lotCount}</span> : null}
          <img src={productImage(p)} alt="" loading="lazy" />
        </div>
        <span className="price">{euros(p.price)}</span>
        <span className="ctitle">{p.title}</span>
        <span className="cmeta"><Icon name="pin" size={13} /> {km(p.distanceKm)} · {p.condition}</span>
      </Link>
    </div>
  );
}

/** Esqueleto de carga con la misma forma que la tarjeta. */
export function ProductCardSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      <div className="skel" style={{ aspectRatio: '1 / 1', borderRadius: 'var(--radius-lg)' }} />
      <div className="skel" style={{ height: 14, width: '50%' }} />
      <div className="skel" style={{ height: 12, width: '85%' }} />
    </div>
  );
}
