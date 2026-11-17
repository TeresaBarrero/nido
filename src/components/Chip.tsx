import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Chip.module.css';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Si se indica, el chip funciona como interruptor (filtro activado o no). */
  pressed?: boolean;
  small?: boolean;
  children: ReactNode;
}

export function Chip({ pressed, small, className, children, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={[styles.chip, small && styles.sm, className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Fila de chips con scroll horizontal (o en varias líneas con wrap). */
export function ChipRow({ children, wrap, label }: { children: ReactNode; wrap?: boolean; label?: string }) {
  return (
    <div className={[styles.row, wrap && styles.wrap].filter(Boolean).join(' ')} role={label ? 'group' : undefined} aria-label={label}>
      {children}
    </div>
  );
}
