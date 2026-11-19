import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { errorMessage, useAuth } from '../app/Auth';
import { useApp } from '../app/AppState';
import { BackButton } from '../components/BackButton';
import { Button, ButtonLink } from '../components/Button';
import { Chip } from '../components/Chip';
import { Icon } from '../components/Icon';
import { TabBar } from '../components/TabBar';
import { LoadError, LoadingScreen } from '../components/LoadState';
import { meetingLabel, useConversation, useMyReservation, type Message } from '../data/api';
import { TONES } from '../data/catalog';
import { euros, firstName, initials } from '../data/format';
import { useListing } from '../data/listings';
import { productImage } from '../data/products';
import { NotFound } from './NotFound';
import styles from './Chat.module.css';

const QUICK = ['¿Tiene algún defecto?', '¿Incluye el manual?', '¿Puedes otro día?'];
// El borrador del mensaje se guarda en este dispositivo para no perderlo al salir del chat.
const draftKey = (user: string | null, listing: number) => `nido:draft:${user ?? 'anon'}:${listing}`;
const readDraft = (key: string) => { try { return localStorage.getItem(key) ?? ''; } catch { return ''; } };
const writeDraft = (key: string, text: string) => {
  try { if (text) localStorage.setItem(key, text); else localStorage.removeItem(key); } catch { /* sin almacenamiento */ }
};
const hour = (iso: string) => new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

export function Chat() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const listingId = Number(id);
  const { data: p, loading, error } = useListing(listingId);
  const { userId } = useAuth();
  const { toast } = useApp();
  const { conv, messages, error: convError, send, remove } = useConversation(listingId, params.get('c'));
  const [picked, setPicked] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const key = draftKey(userId, listingId);
  const [draft, setDraftState] = useState(() => readDraft(key));
  const setDraft = (t: string) => { setDraftState(t); writeDraft(key, t); };
  useEffect(() => { setDraftState(readDraft(key)); }, [key]);
  const [sending, setSending] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const myRes = useMyReservation(listingId, userId);

  // Siempre muestra el último mensaje.
  useEffect(() => {
    const el = list.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, conv]);

  if (loading) return <LoadingScreen />;
  if (!p) return error ? <LoadError withBack /> : <NotFound />;

  const iAmSeller = conv ? conv.seller.id === userId : p.sellerId === userId;
  const other = conv ? (iAmSeller ? conv.buyer : conv.seller) : { name: p.seller.name, tone: p.seller.tone, verified: p.seller.verified };
  const tone = TONES[other.tone];
  const reservedByMe = Boolean(myRes && myRes.status !== 'cancelled');
  const available = (p.status === 'live' || !p.status) && !reservedByMe;

  const submit = async (text: string) => {
    const t = text.trim();
    if (!t || !userId || sending) return;
    setSending(true);
    try { await send(userId, t); if (t === draft.trim()) setDraft(''); } catch (e) { toast(errorMessage(e, 'No se ha podido enviar el mensaje.')); } finally { setSending(false); }
  };

  const removeMessage = async (messageId: string) => {
    setDeleting(true);
    try { await remove(messageId); setPicked(null); toast('Mensaje eliminado'); } catch (e) { toast(errorMessage(e, 'No se ha podido eliminar el mensaje.')); } finally { setDeleting(false); }
  };

  const text = (m: Message) => {
    const mine = m.sender_id === userId;
    const cls = `${styles.msg} ${mine ? styles.me : styles.them}`;
    const time = <time dateTime={m.created_at}>{hour(m.created_at)}</time>;
    if (m.deleted_at) {
      return (
        <div key={m.id} className={`${cls} ${styles.deleted}`}>
          <Icon name="ban" size={14} /> {mine ? 'Has eliminado este mensaje' : 'Mensaje eliminado'}{time}
        </div>
      );
    }
    if (!mine) return <div key={m.id} className={`${cls} fade`}>{m.body}{time}</div>;
    const open = picked === m.id;
    return (
      <div key={m.id} className={`${styles.mine} fade`} onKeyDown={(e) => { if (e.key === 'Escape') setPicked(null); }}>
        <button
          type="button" className={`${cls} ${open ? styles.picked : ''}`}
          aria-expanded={open} aria-controls={`opt-${m.id}`}
          onClick={() => setPicked(open ? null : m.id)}
        >
          {m.body}{time}<span className="sr-only">. Toca para eliminarlo</span>
        </button>
        {open && (
          <div id={`opt-${m.id}`} ref={(el) => el?.scrollIntoView({ block: 'nearest' })} className={`${styles.msgMenu} fade`} role="group" aria-label="Opciones del mensaje">
            <Button size="sm" variant="ghost" onClick={() => setPicked(null)}>Cancelar</Button>
            <Button size="sm" variant="ghost" className={styles.del} disabled={deleting} onClick={() => removeMessage(m.id)}>
              {deleting ? 'Eliminando…' : 'Eliminar para todos'}
            </Button>
          </div>
        )}
      </div>
    );
  };

  const meeting = (m: Message) => {
    const mine = m.sender_id === userId;
    return (
      <div key={m.id} className={`${styles.meet} fade`}>
        <h2>{mine ? 'Tu propuesta de entrega' : `Propuesta de entrega de ${firstName(other.name)}`}</h2>
        <div className={styles.r}><Icon name="pin" size={18} /><span><b>{m.payload?.place}</b> · Punto de encuentro seguro</span></div>
        {m.payload?.at && <div className={styles.r}><Icon name="clock" size={18} /><span>{meetingLabel(m.payload.at)}</span></div>}
        <div className={styles.r}><Icon name="lock" size={18} /><span>Pago protegido · {euros(p.price)}</span></div>
        {!iAmSeller && (available ? (
          <div className="row">
            <ButtonLink to={`/pagar/${p.id}`} size="sm" style={{ flex: 1 }}>Aceptar y pagar</ButtonLink>
            <Button size="sm" variant="ghost" onClick={() => submit('¿Puedes otro día?')}>Otra hora</Button>
          </div>
        ) : (
          <ButtonLink to={`/reservado/${p.id}`} size="sm" variant="ghost"><Icon name="check" size={15} /> Ver mi compra</ButtonLink>
        ))}
      </div>
    );
  };

  return (
    <>
      <header className={styles.head}>
        <BackButton />
        <div className="avatar" style={{ background: tone.bg, color: tone.ink, width: 40, height: 40, fontSize: 13 }} aria-hidden="true">{initials(other.name)}</div>
        <div style={{ flex: 1 }}>
          <h1 className={styles.name}>{other.name}</h1>
          <div className="cmeta">
            {other.verified && <><span className="verified"><Icon name="shield" size={12} /> Verificada</span> · </>}
            {iAmSeller ? 'Interesada en tu anuncio' : 'Suele responder en 1 h'}
          </div>
        </div>
      </header>

      <div className={styles.product}>
        <div className="mini"><img src={productImage(p)} alt="" /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ctitle one">{p.title}</div>
          <b>{euros(p.price)}</b>
        </div>
        <span className={`pill ${available ? 'live' : 'reserved'}`}>
          {available ? 'Disponible' : reservedByMe ? (myRes?.status === 'delivered' ? 'Comprado' : 'Pagado') : p.status === 'sold' ? 'Vendido' : 'Reservado'}
        </span>
      </div>

      <div className={styles.msgs} ref={list} role="log" aria-label="Conversación" aria-busy={!conv && !convError}>
        <div className={styles.sys}>Mantén la conversación y el pago en Nido para estar protegida</div>
        {convError && <div className={styles.sys} role="alert">{/[áéíóú]/.test(convError) ? convError : 'No se ha podido abrir el chat.'}</div>}
        {conv && messages.length === 0 && (
          <p className="muted" style={{ textAlign: 'center', fontSize: 14 }}>Saluda a {firstName(other.name)} y pregunta lo que necesites.</p>
        )}
        {messages.map((m) => m.kind === 'meeting_proposal' ? meeting(m) : text(m))}
      </div>

      {conv && (
        <>
          {!iAmSeller && messages.length > 0 && (
            <div className={styles.quick} role="group" aria-label="Preguntas rápidas">
              {QUICK.map((q) => <Chip key={q} onClick={() => submit(q)}>{q}</Chip>)}
            </div>
          )}
          <form className={styles.composer} onSubmit={(e) => { e.preventDefault(); submit(draft); }}>
            <label htmlFor="m" className="sr-only">Escribe un mensaje</label>
            <input
              id="m" value={draft} onChange={(e) => setDraft(e.target.value)} autoComplete="off" enterKeyHint="send" maxLength={1000}
              placeholder={messages.length ? 'Escribe un mensaje…' : '¡Hola! ¿Sigue disponible?'}
            />
            <button
              type="submit" className={`icon-btn ${styles.send}`} aria-label="Enviar" disabled={sending}
              onClick={(e) => { if (!draft.trim() && !messages.length) { e.preventDefault(); submit('¡Hola! ¿Sigue disponible?'); } }}
            >
              <Icon name="send" size={19} />
            </button>
          </form>
        </>
      )}
      <TabBar active="/mensajes" />
    </>
  );
}
