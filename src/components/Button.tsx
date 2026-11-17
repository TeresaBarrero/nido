import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import styles from './Button.module.css';

type Variant = 'primary' | 'dark' | 'ghost';

interface Common {
  variant?: Variant;
  size?: 'md' | 'sm';
  block?: boolean;
  children: ReactNode;
}

const cls = ({ variant = 'primary', size = 'md', block }: Omit<Common, 'children'>, extra?: string) =>
  [styles.btn, styles[variant], size === 'sm' && styles.sm, block && styles.block, extra].filter(Boolean).join(' ');

export function Button({ variant, size, block, className, children, type = 'button', ...rest }: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={cls({ variant, size, block }, className)} {...rest}>
      {children}
    </button>
  );
}

/** Enlace con aspecto de botón (navega a otra pantalla). */
export function ButtonLink({ variant, size, block, className, children, ...rest }: Common & LinkProps) {
  return (
    <Link className={cls({ variant, size, block }, className)} {...rest}>
      {children}
    </Link>
  );
}
