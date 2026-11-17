import { useEffect, useState } from 'react';
import { useApp } from '../app/AppState';
import { Art } from '../components/Art';
import { BackButton } from '../components/BackButton';
import { Button, ButtonLink } from '../components/Button';
import { Chip, ChipRow } from '../components/Chip';
import { Icon } from '../components/Icon';
import { TabBar } from '../components/TabBar';
import { Link } from 'react-router';
import { euros } from '../data/format';
import styles from './Sell.module.css';

type Step = 'photos' | 'analyzing' | 'review' | 'published' | 'carseat';

// Anuncio de ejemplo que "detecta" Nido a partir de las fotos.
const DETECTED = { title: 'Bañera plegable con hamaca', photo: '/img/banera.jpg', suggested: 25, min: 15, max: 35 };
const CONDITIONS = ['Nuevo precintado', 'Como nuevo', 'Buen estado', 'Con señales de uso'];

function Progress({ n, label }: { n: 1 | 2 | 3; label: string }) {
  return (
    <div className={styles.progress} role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={n} aria-label={`Paso ${n} de 3: ${label}`}>
      <div className={styles.plabel}><span>Paso {n} de 3</span><span>{label}</span></div>
      <div className={styles.track}>{[1, 2, 3].map((i) => <i key={i} className={i <= n ? styles.on : undefined} />)}</div>
    </div>
  );
}

export function Sell() {
  const [step, setStep] = useState<Step>('photos');
  const { setMyListing, toast } = useApp();
  const [title, setTitle] = useState(DETECTED.title);
  const [condition, setCondition] = useState('Como nuevo');
  const [complete, setComplete] = useState(true);
  const [hygiene, setHygiene] = useState({ washed: true, smokeFree: true, petFree: false });
  const [price, setPrice] = useState(DETECTED.suggested);
  const [shipping, setShipping] = useState(false);
  const [analysis, setAnalysis] = useState(0);

  // Simulación del análisis de fotos: dos comprobaciones y paso a la ficha.
  useEffect(() => {
    if (step !== 'analyzing') return;
    setAnalysis(0);
    const t = [
      window.setTimeout(() => setAnalysis(1), 900),
      window.setTimeout(() => setAnalysis(2), 1700),
      window.setTimeout(() => setStep('review'), 2500),
    ];
    return () => t.forEach(window.clearTimeout);
  }, [step]);

  if (step === 'photos') {
    return (
      <>
        <header className="bar">
          <h1 className="page-title" style={{ flex: 1, fontSize: 25 }}>Vender</h1>
          <Link to="/" className="link">Cerrar</Link>
        </header>
        <Progress n={1} label="Fotos" />
        <main className="scroll fade" style={{ display: 'flex', flexDirection: 'column' }}>
          <button type="button" className={styles.drop} onClick={() => setStep('analyzing')}>
            <span className={styles.big}><Icon name="camera" size={34} /></span>
            <b>Haz 3 fotos y listo</b>
            <span className="cmeta" style={{ justifyContent: 'center' }}>Nido reconoce el producto, rellena la ficha y te sugiere un precio.</span>
            <span className={styles.fakeBtn}>Añadir fotos</span>
          </button>
          <button type="button" className={styles.demoLink} onClick={() => setStep('carseat')}>Probar con una foto de silla de coche</button>
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

  if (step === 'analyzing') {
    return (
      <>
        <header className="bar"><h1 className={styles.barTitle}>Vender</h1></header>
        <Progress n={1} label="Fotos" />
        <main className={`${styles.analyzing} fade`}>
          <div className={styles.photos}>
            {['50% 50%', '20% 60%', '80% 40%'].map((pos, i) => (
              <div key={pos} className={styles.ph}>
                <img src={DETECTED.photo} alt="" style={{ objectPosition: pos }} />
                <span className={styles.scan} style={{ animationDelay: `${i * 0.2}s` }} />
              </div>
            ))}
          </div>
          <h2 className={styles.analyzingTitle}>Preparando tu anuncio</h2>
          <ul className={styles.steps} aria-live="polite">
            <li className={styles.done}><Icon name="check" size={15} /> 3 fotos recibidas</li>
            <li className={analysis >= 1 ? styles.done : undefined}>
              {analysis >= 1 ? <><Icon name="check" size={15} /> Es una bañera plegable con hamaca</> : 'Reconociendo el producto…'}
            </li>
            <li className={analysis >= 2 ? styles.done : undefined}>
              {analysis >= 2 ? <><Icon name="check" size={15} /> 12 ventas similares a menos de 5 km</> : 'Buscando precios cerca de ti…'}
            </li>
          </ul>
        </main>
      </>
    );
  }

  if (step === 'carseat') {
    return (
      <>
        <header className="bar"><BackButton onClick={() => setStep('photos')} /><h1 className={styles.barTitle}>Vender</h1></header>
        <main className="done-screen fade" style={{ paddingTop: 20 }}>
          <div className={styles.carseat}><Art name="carseat" color="#A84866" /></div>
          <h2 style={{ fontSize: 23, fontWeight: 900 }}>Parece una silla de coche</h2>
          <p>Por seguridad, en Nido no se pueden vender sillas de coche usadas: un golpe puede dañarlas por dentro sin que se note.</p>
          <details className="faq">
            <summary>¿Por qué esta norma?</summary>
            <p>Las organizaciones de consumidores y de seguridad vial infantil desaconsejan comprarlas usadas: no se puede saber si han sufrido un accidente ni si han caducado.</p>
          </details>
          <div className="stack" style={{ marginTop: 6 }}>
            <Button block onClick={() => setStep('photos')}>Vender otra cosa</Button>
            <Button block variant="ghost" onClick={() => toast('Si está nueva y precintada, se revisa antes de publicarse')}>Está nueva y precintada</Button>
          </div>
        </main>
      </>
    );
  }

  if (step === 'published') {
    return (
      <>
        <div style={{ paddingTop: 'calc(16px + var(--top-safe))' }}><Progress n={3} label="Publicado" /></div>
        <main className="done-screen fade" style={{ paddingTop: 30 }}>
          <div className="ok draw"><Icon name="check" size={44} /></div>
          <h1 className="rise" style={{ fontSize: 27, fontWeight: 900 }}>¡Anuncio publicado!</h1>
          <p>14 familias a menos de 3 km buscan una bañera. Les hemos avisado.</p>
          <div className={styles.preview} aria-hidden="true">
            <div className={styles.previewThumb}><img src={DETECTED.photo} alt="" /></div>
            <span className="price">{euros(price)}</span>
            <span className="ctitle">{title}</span>
          </div>
          <div className="stack" style={{ marginTop: 10 }}>
            <Button block variant="dark" onClick={() => toast('Enlace listo para pegar en el grupo de WhatsApp')}><Icon name="share" size={18} /> Compartir en WhatsApp</Button>
            <ButtonLink to="/perfil" block variant="ghost">Editar o pausar en Mis anuncios</ButtonLink>
          </div>
        </main>
      </>
    );
  }

  // step === 'review'
  return (
    <>
      <header className="bar"><BackButton onClick={() => setStep('photos')} /><h1 className={styles.barTitle}>Revisa tu anuncio</h1></header>
      <Progress n={2} label="Detalles" />
      <main className="scroll stagger">
        <div className={styles.photos} style={{ marginTop: 8 }}>
          <div className={styles.ph}><img src={DETECTED.photo} alt="Foto 1 del producto" /></div>
          <div className={styles.ph}><img src={DETECTED.photo} alt="Foto 2 del producto" style={{ objectPosition: '20% 60%' }} /></div>
          <button type="button" className={styles.addph} onClick={() => toast('Hasta 10 fotos por anuncio')}><Icon name="plus" size={20} />Añadir</button>
        </div>

        <section className="panel">
          <div className="row between"><h2 className={styles.h4}>Lo que ha detectado Nido</h2><span className="ai"><Icon name="sparkle" size={13} /> Sugerido</span></div>
          <div className="field"><label htmlFor="pt">Título</label><input id="pt" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <dl className="facts" style={{ marginTop: 12 }}>
            <div className="fact"><dt><small>Sección</small></dt><dd><b>Baño y cambio · Bañeras</b></dd></div>
            <div className="fact"><dt><small>Etapa</small></dt><dd><b>0-12 meses</b></dd></div>
            <div className="fact"><dt><small>Incluye</small></dt><dd><b>Hamaca de baño</b></dd></div>
            <div className="fact"><dt><small>Precio nuevo</small></dt><dd><b>45 €</b></dd></div>
          </dl>
        </section>

        <section className="panel">
          <h2 className={styles.h4}>Estado</h2>
          <ChipRow wrap label="Estado">
            {CONDITIONS.map((c) => <Chip key={c} pressed={condition === c} onClick={() => setCondition(c)}>{c}</Chip>)}
          </ChipRow>
        </section>

        <section className="panel">
          <h2 className={styles.h4}>¿Está completo?</h2>
          <div className={styles.seg}>
            <button type="button" aria-pressed={complete} onClick={() => setComplete(true)}><b>Todo completo</b>Con piezas y manual</button>
            <button type="button" aria-pressed={!complete} onClick={() => setComplete(false)}><b>Falta algo</b>Indícalo en la descripción</button>
          </div>
        </section>

        <fieldset className={`panel ${styles.fieldset}`}>
          <legend className={styles.h4}>Higiene y casa</legend>
          <label className={styles.check}><input type="checkbox" checked={hygiene.washed} onChange={(e) => setHygiene({ ...hygiene, washed: e.target.checked })} /> Lavada y desinfectada</label>
          <label className={styles.check}><input type="checkbox" checked={hygiene.smokeFree} onChange={(e) => setHygiene({ ...hygiene, smokeFree: e.target.checked })} /> Casa sin humo</label>
          <label className={styles.check}><input type="checkbox" checked={hygiene.petFree} onChange={(e) => setHygiene({ ...hygiene, petFree: e.target.checked })} /> Casa sin mascotas</label>
        </fieldset>

        <section className="panel">
          <div className="row between"><h2 className={styles.h4}><label htmlFor="price">Precio</label></h2><span className="ai"><Icon name="sparkle" size={13} /> Recomendado</span></div>
          <div className={styles.priceValue} aria-hidden="true">{euros(price)}</div>
          <input
            id="price" type="range" className={styles.range}
            min={DETECTED.min} max={DETECTED.max} step={1} value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            aria-valuetext={euros(price)}
          />
          <div className={styles.ends}><span>{DETECTED.min} €</span><span>Cerca se venden entre 20 y 30 €</span><span>{DETECTED.max} €</span></div>
        </section>

        <section className="panel">
          <h2 className={styles.h4}>Entrega</h2>
          <div className={styles.seg}>
            <button type="button" aria-pressed={!shipping} onClick={() => setShipping(false)}><b>Solo en mano</b>Gratis · ideal para objetos grandes</button>
            <button type="button" aria-pressed={shipping} onClick={() => setShipping(true)}><b>En mano y envío</b>Desde 3,95 € · lo paga quien compra</button>
          </div>
        </section>
      </main>
      <div className="actionbar">
        <Button disabled={!title.trim()} onClick={() => { setMyListing('live'); setStep('published'); }}>Publicar anuncio</Button>
      </div>
    </>
  );
}
