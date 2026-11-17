import { useEffect, useState } from 'react';
import { useApp } from '../app/AppState';
import styles from './Toast.module.css';

/** Aviso breve en la parte inferior. Se lee también con lector de pantalla. */
export function Toast() {
  const { toastMessage } = useApp();
  // Conserva el último texto mientras el aviso se desvanece.
  const [text, setText] = useState('');
  useEffect(() => { if (toastMessage) setText(toastMessage); }, [toastMessage]);

  return (
    <div className={[styles.toast, toastMessage && styles.show].filter(Boolean).join(' ')} role="status" aria-live="polite">
      <span aria-hidden={!toastMessage}>{text}</span>
    </div>
  );
}
