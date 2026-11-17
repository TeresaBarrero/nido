import { useNavigate } from 'react-router';
import { Icon } from './Icon';

/** Vuelve a la pantalla anterior; si se entró directamente por enlace, va a Inicio. */
export function useBack(fallback = '/') {
  const navigate = useNavigate();
  return () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate(fallback, { replace: true });
  };
}

export function BackButton({ fallback, onClick }: { fallback?: string; onClick?: () => void }) {
  const back = useBack(fallback);
  return (
    <button type="button" className="icon-btn" aria-label="Volver" onClick={onClick ?? back}>
      <Icon name="back" size={20} />
    </button>
  );
}
