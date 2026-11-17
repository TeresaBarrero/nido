import { Link } from 'react-router';
import { Icon } from '../components/Icon';
import { TabBar } from '../components/TabBar';
import { getProduct, productImage } from '../data/products';
import styles from './Messages.module.css';

const CONVERSATIONS = [
  { productId: 1, last: '¡Hola! Sí, está como nueva. Vivo al lado de Plaza de Olavide…', time: '10:15', unread: true },
  { productId: 2, last: 'Te la puedo dejar en 80 € si vienes esta semana', time: 'Ayer', unread: false },
  { productId: 4, last: 'Tú: ¿Incluye el baby set?', time: 'Lun', unread: false },
];

export function Messages() {
  return (
    <>
      <header className="app-top"><h1 className="page-title">Mensajes</h1></header>
      <main className="scroll fade">
        <ul className="panel list" style={{ marginTop: 6, listStyle: 'none' }}>
          {CONVERSATIONS.map((c) => {
            const p = getProduct(c.productId)!;
            return (
              <li key={c.productId} className={styles.item}>
                <Link to={`/chat/${p.id}`} className="listrow">
                  <div className="mini" style={{ width: 52, height: 52 }}><img src={productImage(p)} alt="" /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row between"><b>{p.seller.name}</b><span className="cmeta">{c.time}</span></div>
                    <div className="ctitle one muted">{c.last}</div>
                  </div>
                  {c.unread && <span className={styles.dot}><span className="sr-only">Sin leer</span></span>}
                </Link>
              </li>
            );
          })}
        </ul>

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
