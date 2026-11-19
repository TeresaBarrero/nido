import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../app/Auth';
import { ButtonLink } from '../components/Button';
import { Icon } from '../components/Icon';
import { LoadError } from '../components/LoadState';
import { TabBar } from '../components/TabBar';
import { fetchConversations, type ConversationSummary } from '../data/api';
import { TONES } from '../data/catalog';
import { initials } from '../data/format';
import styles from './Messages.module.css';

const when = (iso: string) => {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (d.toDateString() === new Date().toDateString()) return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  if (days < 1) return 'Ayer';
  if (days < 6) return d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).replace('.', '');
};

export function Messages() {
  const { userId } = useAuth();
  const [list, setList] = useState<ConversationSummary[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setError(false);
    fetchConversations().then((c) => alive && setList(c)).catch(() => alive && setError(true));
    return () => { alive = false; };
  }, [attempt]);

  return (
    <>
      <header className="app-top"><h1 className="page-title">Mensajes</h1></header>
      <main className="scroll fade">
        {error ? (
          <LoadError onRetry={() => setAttempt((n) => n + 1)} />
        ) : list === null ? (
          <div className="panel" aria-busy="true" style={{ marginTop: 6, height: 140 }} />
        ) : list.length === 0 ? (
          <div className="panel" style={{ marginTop: 6, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
            <Icon name="chat" size={30} style={{ color: 'var(--primary)' }} />
            <b>Aún no tienes conversaciones</b>
            <p className="muted" style={{ fontSize: 14 }}>Abre un anuncio y pulsa «Chatear». En la demo, las familias de ejemplo te responden solas.</p>
            <ButtonLink to="/buscar" size="sm">Explorar anuncios</ButtonLink>
          </div>
        ) : (
          <ul className="panel list" style={{ marginTop: 6, listStyle: 'none' }}>
            {list.map((c) => {
              const iAmSeller = c.seller.id === userId;
              const other = iAmSeller ? c.buyer : c.seller;
              const tone = TONES[other.tone];
              const last = c.last
                ? (c.last.kind === 'meeting_proposal' ? 'Propuesta de entrega' : c.last.deleted_at ? 'Mensaje eliminado' : c.last.body)
                : 'Conversación nueva';
              return (
                <li key={c.id} className={styles.item}>
                  <Link to={iAmSeller ? `/chat/${c.listing_id}?c=${c.id}` : `/chat/${c.listing_id}`} className="listrow">
                    <div className="mini" style={{ width: 52, height: 52 }}>
                      {c.photo
                        ? <img src={c.photo} alt="" />
                        : <span className="avatar" style={{ background: tone.bg, color: tone.ink }}>{initials(other.name)}</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="row between"><b>{other.name}</b>{c.last && <span className="cmeta">{when(c.last.created_at)}</span>}</div>
                      <div className="cmeta">{c.title}{iAmSeller ? ' · tu anuncio' : ''}</div>
                      <div className="ctitle one muted">{c.last?.sender_id === userId ? 'Tú: ' : ''}{last}</div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <section className="section">
          <div className="section-head">
            <h2 className={styles.h}><Icon name="help" size={18} style={{ verticalAlign: -3, color: 'var(--primary)' }} /> Ayuda rápida</h2>
          </div>
          <div className="faqs">
            <details className="faq"><summary>¿Cómo funciona el pago protegido?</summary><p>Pagas en la app al reservar. El dinero queda retenido y se libera cuando la otra persona introduce tu código de entrega.</p></details>
            <details className="faq"><summary>¿Qué hago si no se presenta?</summary><p>Cancela la reserva desde el chat y te devolvemos el dinero en 24 horas. Las ausencias quedan registradas en el perfil.</p></details>
            <details className="faq"><summary>¿Qué no se puede vender en Nido?</summary><p>Sillas de coche usadas, leche de fórmula, alimentación infantil y productos de higiene abiertos.</p></details>
          </div>
        </section>
      </main>
      <TabBar />
    </>
  );
}
