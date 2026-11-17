import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useApp } from '../app/AppState';
import { BackButton } from '../components/BackButton';
import { Button, ButtonLink } from '../components/Button';
import { Chip } from '../components/Chip';
import { Icon } from '../components/Icon';
import { TONES } from '../data/catalog';
import { euros, firstName, initials } from '../data/format';
import { getProduct, productImage } from '../data/products';
import { ageInMonths, DEMO_USER } from '../data/user';
import { NotFound } from './NotFound';
import styles from './Chat.module.css';

const QUICK = ['¿Tiene algún defecto?', '¿Incluye el manual?', '¿Puedes otro día?'];

export function Chat() {
  const { id } = useParams();
  const p = getProduct(Number(id));
  const { chat, sendMessage, toast } = useApp();
  const [draft, setDraft] = useState('');
  const list = useRef<HTMLDivElement>(null);
  const state = chat(Number(id));

  // Siempre muestra el último mensaje.
  useEffect(() => {
    const el = list.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [state.sent.length]);

  if (!p) return <NotFound />;
  const seller = firstName(p.seller.name);
  const tone = TONES[p.seller.tone];
  const months = ageInMonths(DEMO_USER.baby.birthDate);

  const send = (text: string) => {
    const t = text.trim();
    if (t) sendMessage(p.id, t);
  };

  return (
    <>
      <header className={styles.head}>
        <BackButton />
        <div className="avatar" style={{ background: tone.bg, color: tone.ink, width: 40, height: 40, fontSize: 13 }} aria-hidden="true">{initials(p.seller.name)}</div>
        <div style={{ flex: 1 }}>
          <h1 className={styles.name}>{p.seller.name}</h1>
          <div className="cmeta">
            {p.seller.verified && <><span className="verified"><Icon name="shield" size={12} /> Verificada</span> · </>}en línea
          </div>
        </div>
      </header>

      <div className={styles.product}>
        <div className="mini"><img src={productImage(p)} alt="" /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ctitle one">{p.title}</div>
          <b>{euros(p.price)}</b>
        </div>
        <span className={`pill ${state.accepted ? 'reserved' : 'live'}`}>{state.accepted ? 'Reservado' : 'Disponible'}</span>
      </div>

      <div className={styles.msgs} ref={list} role="log" aria-label="Conversación">
        <div className={styles.sys}>Mantén la conversación y el pago en Nido para estar protegida</div>
        <div className={`${styles.msg} ${styles.me}`}>¡Hola! ¿Sigue disponible? Me vendría genial para mi bebé de {months} meses.<time>10:12</time></div>
        <div className={`${styles.msg} ${styles.them}`}>¡Hola! Sí, está como nueva. Vivo al lado de {p.meetingPoint}, ¿te viene bien quedar allí?<time>10:15</time></div>

        <div className={styles.meet}>
          <h2>Propuesta de entrega de {seller}</h2>
          <div className={styles.r}><Icon name="pin" size={18} /><span><b>{p.meetingPoint}</b> · Punto de encuentro seguro</span></div>
          <div className={styles.r}><Icon name="clock" size={18} /><span>Sábado 21 nov · 10:30</span></div>
          <div className={styles.r}><Icon name="lock" size={18} /><span>Pago protegido · {euros(p.price)}</span></div>
          {state.accepted ? (
            <div className="tag" style={{ alignSelf: 'flex-start' }}><Icon name="check" size={15} /> Aceptada y pagada</div>
          ) : (
            <div className="row">
              <ButtonLink to={`/pagar/${p.id}`} size="sm" style={{ flex: 1 }}>Aceptar y pagar</ButtonLink>
              <Button size="sm" variant="ghost" onClick={() => toast('Puedes proponer otro lugar u hora')}>Otra hora</Button>
            </div>
          )}
        </div>

        {state.sent.map((m, i) => (
          <div key={i} className={`${styles.msg} ${styles.me} fade`}>{m}<time>Ahora</time></div>
        ))}
      </div>

      <div className={styles.quick} role="group" aria-label="Preguntas rápidas">
        {QUICK.map((q) => <Chip key={q} onClick={() => send(q)}>{q}</Chip>)}
      </div>
      <form
        className={styles.composer}
        onSubmit={(e) => { e.preventDefault(); send(draft); setDraft(''); }}
      >
        <label htmlFor="m" className="sr-only">Escribe un mensaje</label>
        <input id="m" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Escribe un mensaje…" autoComplete="off" enterKeyHint="send" />
        <button type="submit" className={`icon-btn ${styles.send}`} aria-label="Enviar">
          <Icon name="send" size={19} />
        </button>
      </form>
    </>
  );
}
