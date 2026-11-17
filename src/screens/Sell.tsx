import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { errorMessage, useAuth } from '../app/Auth';
import { useApp } from '../app/AppState';
import { Art } from '../components/Art';
import { BackButton } from '../components/BackButton';
import { Button, ButtonLink } from '../components/Button';
import { Chip, ChipRow } from '../components/Chip';
import { Icon } from '../components/Icon';
import { TabBar } from '../components/TabBar';
import { publishListing } from '../data/api';
import { completeTask } from '../app/testMode';
import { CAR_SEAT_SUBCATEGORY, CONDITIONS, SECTIONS, sectionByName, STAGES, type Condition, type SectionName, type StageKey } from '../data/catalog';
import { euros } from '../data/format';
import { useListings } from '../data/listings';
import styles from './Sell.module.css';

type Step = 'photos' | 'review' | 'published' | 'carseat' | 'banned';

const MAX_PHOTOS = 10;
const HYGIENE_SUB = 'Higiene nueva';
// Regla 2: ni leche de fórmula ni alimentación infantil.
const BANNED = /leche (de )?f[oó]rmula|leche de continuaci[oó]n|potito|papilla|cereales infantiles|alimentaci[oó]n infantil/i;
const HYGIENE = ['Lavada y desinfectada', 'Casa sin humo', 'Casa sin mascotas'];

function Progress({ n, label }: { n: 1 | 2 | 3; label: string }) {
  return (
    <div className={styles.progress} role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={n} aria-label={`Paso ${n} de 3: ${label}`}>
      <div className={styles.plabel}><span>Paso {n} de 3</span><span>{label}</span></div>
      <div className={styles.track}>{[1, 2, 3].map((i) => <i key={i} className={i <= n ? styles.on : undefined} />)}</div>
    </div>
  );
}

/** Desplaza la ubicación unos cientos de metros para no revelar el domicilio. */
const fuzz = (v: number | null) => (v == null ? null : Math.round((v + (Math.random() - 0.5) * 0.006) * 10000) / 10000);

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.floor((s.length - 1) / 2)] : null;
};

export function Sell() {
  const { userId, profile } = useAuth();
  const { toast } = useApp();
  const { data: listings } = useListings();
  const fileInput = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('photos');
  const [photos, setPhotos] = useState<{ file: File; url: string }[]>([]);
  const [title, setTitle] = useState('');
  const [section, setSection] = useState<SectionName | null>(null);
  const [sub, setSub] = useState<string | null>(null);
  const [spec, setSpec] = useState<string | null>(null);
  const [stages, setStages] = useState<StageKey[]>([]);
  const [condition, setCondition] = useState<Condition>('Como nuevo');
  const [complete, setComplete] = useState(true);
  const [hygiene, setHygiene] = useState<string[]>(['Lavada y desinfectada', 'Casa sin humo']);
  const [price, setPrice] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [description, setDescription] = useState('');
  const [meetingPoint, setMeetingPoint] = useState(profile?.neighborhood ?? '');
  const [shipping, setShipping] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ id: number; review: boolean; photo: string | null } | null>(null);

  // Libera las vistas previas de las fotos al salir.
  const photosRef = useRef(photos);
  photosRef.current = photos;
  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const room = MAX_PHOTOS - photos.length;
    const picked = [...files].filter((f) => f.type.startsWith('image/')).slice(0, room);
    if (files.length > room) toast(`Máximo ${MAX_PHOTOS} fotos por anuncio`);
    setPhotos((prev) => [...prev, ...picked.map((file) => ({ file, url: URL.createObjectURL(file) }))]);
    if (picked.length && step === 'photos') setStep('review');
  };

  // Para testers sin fotos: carga fotos de ejemplo de la bañera.
  const loadSamplePhotos = async () => {
    try {
      const blob = await (await fetch('/img/banera.jpg')).blob();
      const files = [new File([blob], 'banera.jpg', { type: 'image/jpeg' })];
      setPhotos(files.map((file) => ({ file, url: URL.createObjectURL(file) })));
      if (!title) setTitle('Bañera plegable con hamaca');
      setStep('review');
    } catch {
      toast('No se han podido cargar las fotos de ejemplo');
    }
  };

  const removePhoto = (i: number) => {
    URL.revokeObjectURL(photos[i].url);
    setPhotos((prev) => prev.filter((_, j) => j !== i));
  };

  // Precio orientativo a partir de anuncios parecidos.
  const comps = useMemo(() => {
    const same = listings.filter((p) => (sub ? p.subcategory === sub : section && p.section === section)).map((p) => p.price);
    if (same.length < 2) return null;
    return { min: Math.min(...same), max: Math.max(...same), mid: median(same)! };
  }, [listings, section, sub]);

  const sec = section ? sectionByName(section) : null;
  const sealedOnly = sub === CAR_SEAT_SUBCATEGORY || sub === HYGIENE_SUB;
  const priceNum = Number(price.replace(',', '.'));
  const newPriceNum = newPrice ? Number(newPrice.replace(',', '.')) : null;
  const valid = photos.length > 0 && title.trim().length >= 3 && section && sub && priceNum > 0 && meetingPoint.trim();

  const pickSub = (s: string) => {
    setSub(s);
    if (s === CAR_SEAT_SUBCATEGORY && condition !== 'Nuevo precintado') setStep('carseat');
    else if (s === HYGIENE_SUB) setCondition('Nuevo precintado');
  };

  const publish = async () => {
    if (!valid || !userId) return;
    if (BANNED.test(`${title} ${description}`)) { setStep('banned'); return; }
    if (sub === CAR_SEAT_SUBCATEGORY && condition !== 'Nuevo precintado') { setStep('carseat'); return; }
    setBusy(true);
    try {
      const r = await publishListing(userId, {
        title: title.trim(),
        description: description.trim(),
        section: section!,
        subcategory: sub!,
        spec_value: spec,
        stages,
        condition,
        is_complete: complete,
        hygiene: sub === HYGIENE_SUB ? ['Nuevo precintado'] : hygiene,
        price: Math.round(priceNum * 100) / 100,
        new_price: newPriceNum && newPriceNum > 0 ? Math.round(newPriceNum * 100) / 100 : null,
        delivery: shipping ? 'hand_ship' : 'hand',
        meeting_point: meetingPoint.trim(),
        lat: fuzz(profile?.lat ?? null),
        lng: fuzz(profile?.lng ?? null),
      }, photos.map((p) => p.file));
      setResult({ id: r.id, review: r.status === 'review', photo: r.photo });
      completeTask(userId, 'publish');
      setStep('published');
    } catch (e) {
      toast(errorMessage(e, 'No se ha podido publicar. Revisa los datos e inténtalo de nuevo.'));
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    photos.forEach((p) => URL.revokeObjectURL(p.url));
    setPhotos([]); setTitle(''); setSection(null); setSub(null); setSpec(null); setStages([]);
    setCondition('Como nuevo'); setPrice(''); setNewPrice(''); setDescription(''); setResult(null);
    setStep('photos');
  };

  const picker = (
    <input
      ref={fileInput} type="file" accept="image/*" multiple hidden
      onChange={(e) => { addPhotos(e.target.files); e.target.value = ''; }}
    />
  );

  if (step === 'photos') {
    return (
      <>
        <header className="bar">
          <h1 className="page-title" style={{ flex: 1, fontSize: 25 }}>Vender</h1>
          <Link to="/" className="link">Cerrar</Link>
        </header>
        <Progress n={1} label="Fotos" />
        <main className="scroll fade" style={{ display: 'flex', flexDirection: 'column' }}>
          {picker}
          <button type="button" className={styles.drop} onClick={() => fileInput.current?.click()}>
            <span className={styles.big}><Icon name="camera" size={34} /></span>
            <b>Haz 3 fotos y listo</b>
            <span className="cmeta" style={{ justifyContent: 'center' }}>Con luz natural y fondo liso. Después rellenas la ficha en un minuto.</span>
            <span className={styles.fakeBtn}>Añadir fotos</span>
          </button>
          <button type="button" className={styles.demoLink} onClick={loadSamplePhotos}>¿Sin fotos a mano? Usa las de ejemplo de una bañera</button>
          <section className="section">
            <div className="section-head"><h2 className={styles.h}>Para vender rápido</h2></div>
            <ul className={`panel ${styles.tips}`} style={{ marginTop: 0 }}>
              <li><Icon name="check" size={18} style={{ color: 'var(--mint-ink)' }} /> Fotos con luz natural y fondo liso</li>
              <li><Icon name="check" size={18} style={{ color: 'var(--mint-ink)' }} /> Indica cómo está de limpio: da confianza</li>
              <li><Icon name="check" size={18} style={{ color: 'var(--mint-ink)' }} /> Junta la ropa de la misma talla en un lote</li>
            </ul>
          </section>
          <div className="warn"><Icon name="ban" size={20} /><span><b>No se pueden vender sillas de coche usadas</b>, ni leche de fórmula o alimentación infantil.</span></div>
        </main>
        <TabBar />
      </>
    );
  }

  if (step === 'carseat' || step === 'banned') {
    const carseat = step === 'carseat';
    return (
      <>
        <header className="bar"><BackButton onClick={() => setStep('review')} /><h1 className={styles.barTitle}>Vender</h1></header>
        <main className="done-screen fade" style={{ paddingTop: 20 }}>
          <div className={styles.carseat}>{carseat ? <Art name="carseat" color="#A84866" /> : <Icon name="ban" size={64} style={{ color: '#A84866' }} />}</div>
          {carseat ? (
            <>
              <h2 style={{ fontSize: 23, fontWeight: 900 }}>Las sillas de coche, solo nuevas</h2>
              <p>Por seguridad, en Nido no se pueden vender sillas de coche usadas: un golpe puede dañarlas por dentro sin que se note.</p>
              <details className="faq">
                <summary>¿Por qué esta norma?</summary>
                <p>Las organizaciones de consumidores y de seguridad vial infantil desaconsejan comprarlas usadas: no se puede saber si han sufrido un accidente ni si han caducado.</p>
              </details>
              <div className="stack" style={{ marginTop: 6 }}>
                <Button block onClick={() => { setSub(null); setStep('review'); }}>Vender otra cosa</Button>
                <Button block variant="ghost" onClick={() => { setCondition('Nuevo precintado'); setStep('review'); toast('La revisaremos antes de publicarla'); }}>Está nueva y precintada</Button>
              </div>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: 23, fontWeight: 900 }}>Esto no se puede vender en Nido</h2>
              <p>No se permite la leche de fórmula ni la alimentación infantil: no podemos garantizar cómo se ha conservado.</p>
              <div className="stack" style={{ marginTop: 6 }}>
                <Button block onClick={() => setStep('review')}>Revisar el anuncio</Button>
              </div>
            </>
          )}
        </main>
      </>
    );
  }

  if (step === 'published' && result) {
    return (
      <>
        <div style={{ paddingTop: 'calc(16px + var(--top-safe))' }}><Progress n={3} label={result.review ? 'En revisión' : 'Publicado'} /></div>
        <main className="done-screen fade" style={{ paddingTop: 30 }}>
          <div className="ok draw"><Icon name="check" size={44} /></div>
          <h1 className="rise" style={{ fontSize: 27, fontWeight: 900 }}>{result.review ? '¡Enviado a revisión!' : '¡Anuncio publicado!'}</h1>
          <p>{result.review
            ? 'Las sillas de coche nuevas se revisan antes de publicarse. Te avisaremos cuando esté visible.'
            : 'Ya lo pueden ver las familias cerca de ti. Te avisaremos cuando alguien te escriba.'}</p>
          <div className={styles.preview} aria-hidden="true">
            <div className={styles.previewThumb}>{result.photo && <img src={result.photo} alt="" />}</div>
            <span className="price">{euros(priceNum)}</span>
            <span className="ctitle">{title}</span>
          </div>
          <div className="stack" style={{ marginTop: 10 }}>
            {!result.review && (
              <Button
                block variant="dark"
                onClick={async () => {
                  const url = `${window.location.origin}/producto/${result.id}`;
                  try {
                    if (navigator.share) await navigator.share({ title, url });
                    else { await navigator.clipboard.writeText(url); toast('Enlace listo para pegar en el grupo de WhatsApp'); }
                  } catch { /* cancelado */ }
                }}
              >
                <Icon name="share" size={18} /> Compartir en WhatsApp
              </Button>
            )}
            <ButtonLink to="/perfil" block variant="ghost">Editar o pausar en Mis anuncios</ButtonLink>
            <Button block variant="ghost" onClick={reset}>Vender otra cosa</Button>
          </div>
        </main>
      </>
    );
  }

  // step === 'review'
  return (
    <>
      <header className="bar"><BackButton onClick={() => setStep('photos')} /><h1 className={styles.barTitle}>Tu anuncio</h1></header>
      <Progress n={2} label="Detalles" />
      <main className="scroll stagger">
        {picker}
        <div className={styles.photos} style={{ marginTop: 8 }}>
          {photos.map((p, i) => (
            <div key={p.url} className={styles.ph}>
              <img src={p.url} alt={`Foto ${i + 1} del producto`} />
              <button type="button" className={styles.rm} aria-label={`Quitar foto ${i + 1}`} onClick={() => removePhoto(i)}><Icon name="close" size={14} /></button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button type="button" className={styles.addph} onClick={() => fileInput.current?.click()}><Icon name="plus" size={20} />Añadir</button>
          )}
        </div>

        <section className="panel">
          <div className="field" style={{ marginTop: 0 }}>
            <label htmlFor="pt">Título</label>
            <input id="pt" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="Ej.: Bañera plegable con hamaca" />
          </div>
          <h2 className={styles.h4} style={{ marginTop: 14 }}>Sección</h2>
          <ChipRow wrap label="Sección">
            {SECTIONS.map((s) => (
              <Chip key={s.name} small pressed={section === s.name} onClick={() => { setSection(s.name); setSub(null); setSpec(null); }}>{s.name}</Chip>
            ))}
          </ChipRow>
          {sec && (
            <>
              <h2 className={styles.h4} style={{ marginTop: 14 }}>Tipo</h2>
              <ChipRow wrap label="Tipo">
                {sec.subcategories.map((s) => <Chip key={s} small pressed={sub === s} onClick={() => pickSub(s)}>{s}</Chip>)}
              </ChipRow>
              <h2 className={styles.h4} style={{ marginTop: 14 }}>{sec.spec.label} <span className="cmeta" style={{ display: 'inline' }}>(opcional)</span></h2>
              <ChipRow wrap label={sec.spec.label}>
                {sec.spec.options.map((o) => <Chip key={o.value} small pressed={spec === o.value} onClick={() => setSpec(spec === o.value ? null : o.value)}>{o.label}</Chip>)}
              </ChipRow>
            </>
          )}
          <h2 className={styles.h4} style={{ marginTop: 14 }}>Etapa</h2>
          <ChipRow wrap label="Etapa">
            {STAGES.map((s) => (
              <Chip key={s.key} small pressed={stages.includes(s.key)}
                onClick={() => setStages((prev) => prev.includes(s.key) ? prev.filter((x) => x !== s.key) : [...prev, s.key])}>
                {s.label}
              </Chip>
            ))}
          </ChipRow>
        </section>

        <section className="panel">
          <h2 className={styles.h4}>Estado</h2>
          <ChipRow wrap label="Estado">
            {CONDITIONS.map((c) => (
              <Chip key={c} pressed={condition === c} disabled={sealedOnly && c !== 'Nuevo precintado'} onClick={() => setCondition(c)}>{c}</Chip>
            ))}
          </ChipRow>
          {sealedOnly && <p className="cmeta" style={{ marginTop: 8 }}>En este tipo solo se admiten productos nuevos y precintados.</p>}
        </section>

        <section className="panel">
          <h2 className={styles.h4}>¿Está completo?</h2>
          <div className={styles.seg}>
            <button type="button" aria-pressed={complete} onClick={() => setComplete(true)}><b>Todo completo</b>Con piezas y manual</button>
            <button type="button" aria-pressed={!complete} onClick={() => setComplete(false)}><b>Falta algo</b>Indícalo en la descripción</button>
          </div>
          <div className="field">
            <label htmlFor="desc">Descripción</label>
            <textarea id="desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} placeholder="Cuánto se ha usado, qué incluye, si falta algo…" />
          </div>
        </section>

        {sub !== HYGIENE_SUB && (
          <fieldset className={`panel ${styles.fieldset}`}>
            <legend className={styles.h4}>Higiene y casa</legend>
            {HYGIENE.map((h) => (
              <label key={h} className={styles.check}>
                <input type="checkbox" checked={hygiene.includes(h)}
                  onChange={(e) => setHygiene((prev) => e.target.checked ? [...prev, h] : prev.filter((x) => x !== h))} /> {h}
              </label>
            ))}
          </fieldset>
        )}

        <section className="panel">
          <div className="row between">
            <h2 className={styles.h4}>Precio</h2>
            {comps && <span className="ai"><Icon name="sparkle" size={13} /> Recomendado: {euros(comps.mid)}</span>}
          </div>
          <div className="row" style={{ gap: 10, marginTop: 8 }}>
            <div className="field" style={{ marginTop: 0, flex: 1, minWidth: 0 }}>
              <label htmlFor="price">Tu precio (€)</label>
              <input id="price" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder={comps ? String(comps.mid) : '25'} />
            </div>
            <div className="field" style={{ marginTop: 0, flex: 1, minWidth: 0 }}>
              <label htmlFor="newprice">Precio nuevo (opcional)</label>
              <input id="newprice" inputMode="decimal" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
            </div>
          </div>
          {comps && <p className="cmeta" style={{ marginTop: 8 }}>Cerca se venden entre {euros(comps.min)} y {euros(comps.max)}.</p>}
        </section>

        <section className="panel">
          <h2 className={styles.h4}>Entrega</h2>
          <div className={styles.seg}>
            <button type="button" aria-pressed={!shipping} onClick={() => setShipping(false)}><b>Solo en mano</b>Gratis · ideal para objetos grandes</button>
            <button type="button" aria-pressed={shipping} onClick={() => setShipping(true)}><b>En mano y envío</b>Desde 3,95 € · lo paga quien compra</button>
          </div>
          <div className="field">
            <label htmlFor="meet">Punto de entrega sugerido</label>
            <input id="meet" value={meetingPoint} onChange={(e) => setMeetingPoint(e.target.value)} maxLength={80} placeholder="Ej.: Plaza de Olavide" />
          </div>
          <p className="cmeta" style={{ marginTop: 8 }}>Mejor un sitio público. Nunca mostramos tu dirección.</p>
        </section>
      </main>
      <div className="actionbar">
        <Button disabled={!valid || busy} onClick={publish}>
          {busy ? 'Publicando…' : sub === CAR_SEAT_SUBCATEGORY ? 'Enviar a revisión' : 'Publicar anuncio'}
        </Button>
      </div>
    </>
  );
}
