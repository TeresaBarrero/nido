import { Button } from './Button';
import { BackButton } from './BackButton';
import { Icon } from './Icon';

/** Pantalla de carga de una ficha: esqueleto con la forma de la foto y el título. */
export function LoadingScreen() {
  return (
    <main className="scroll" aria-busy="true" style={{ padding: 0 }}>
      <div className="skel" style={{ height: 300, borderRadius: 0 }} />
      <div style={{ padding: 'var(--pad)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="skel" style={{ height: 26, width: '80%' }} />
        <div className="skel" style={{ height: 32, width: '35%' }} />
        <div className="skel" style={{ height: 120 }} />
      </div>
      <span className="sr-only" role="status">Cargando…</span>
    </main>
  );
}

/** Aviso cuando no se pueden cargar los datos (sin conexión, servidor caído…). */
export function LoadError({ onRetry, withBack }: { onRetry?: () => void; withBack?: boolean }) {
  return (
    <>
      {withBack && <header className="bar"><BackButton /></header>}
      <div className="done-screen" role="alert" style={{ paddingTop: withBack ? 20 : undefined }}>
        <div className="ok" style={{ background: 'var(--peach)', color: '#9A4D2E' }}><Icon name="help" size={40} /></div>
        <h2 style={{ fontSize: 22, fontWeight: 900 }}>No hemos podido cargar los anuncios</h2>
        <p>Revisa tu conexión a internet y vuelve a intentarlo.</p>
        {onRetry ? <Button onClick={onRetry}>Reintentar</Button> : <Button onClick={() => window.location.reload()}>Reintentar</Button>}
      </div>
    </>
  );
}
