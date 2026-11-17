import { useState } from 'react';
import { useApp } from '../app/AppState';
import { Icon } from './Icon';
import styles from './FavButton.module.css';

/** Corazón de favoritos con animación "pop" al guardar. */
export function FavButton({ id, label, className, size = 18 }: { id: number; label: string; className?: string; size?: number }) {
  const { favorites, toggleFavorite, toast } = useApp();
  const [popping, setPopping] = useState(false);
  const on = favorites.has(id);

  return (
    <button
      type="button"
      className={[styles.fav, popping && styles.pop, className].filter(Boolean).join(' ')}
      aria-pressed={on}
      aria-label={label}
      onClick={() => {
        if (toggleFavorite(id)) {
          setPopping(true);
          toast('Guardado. Te avisamos si baja de precio');
        }
      }}
      onAnimationEnd={() => setPopping(false)}
    >
      <span className={styles.circle}>
        <Icon name="heart" size={size} />
      </span>
    </button>
  );
}
