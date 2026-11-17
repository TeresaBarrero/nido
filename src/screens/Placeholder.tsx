import { TabBar } from '../components/TabBar';

/** Pantalla provisional mientras se construye el resto de la fase 1. */
export function Placeholder({ title }: { title: string }) {
  return (
    <>
      <div className="app-top"><h1 className="page-title">{title}</h1></div>
      <div className="scroll fade"><p className="muted">Esta pantalla llega en el siguiente bloque.</p></div>
      <TabBar />
    </>
  );
}
