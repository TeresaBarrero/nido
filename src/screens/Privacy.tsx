import { BackButton } from '../components/BackButton';

// Política de privacidad de Nido (demo de portfolio).
const CONTACT = 'mariateresabi98@gmail.com';

export function Privacy() {
  return (
    <>
      <header className="bar">
        <BackButton />
        <h1 style={{ fontSize: 20, fontWeight: 900 }}>Privacidad</h1>
      </header>
      <main className="legal fade">
        <p className="muted">Última actualización: 19 de noviembre de 2026</p>

        <h2>Qué es Nido</h2>
        <p>
          Nido es una <b>demo de portfolio</b> de María Teresa Barrero Isidoro, que es la responsable de tus datos. No es una tienda real: los
          anuncios son de ejemplo y los pagos son simulados, así que nunca se cobra dinero. Para cualquier duda, escribe a{' '}
          <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
        </p>

        <h2>Qué datos guardamos</h2>
        <ul>
          <li><b>En la demo:</b> se crea una cuenta de invitada sin correo. Lo que hagas solo sirve para que pruebes la app y solo lo ves tú.</li>
          <li><b>Si entras con tu correo:</b> tu correo, para enviarte el enlace de acceso.</li>
          <li><b>Tu perfil:</b> el nombre que elijas y tu barrio o una ubicación aproximada, redondeada a unos 100 metros. Nunca guardamos tu posición exacta.</li>
          <li><b>Tu bebé (opcional):</b> solo la fecha de nacimiento y, si quieres, un nombre. Nunca fotos.</li>
          <li><b>Lo que publiques:</b> anuncios y sus fotos, mensajes del chat, reservas y valoraciones.</li>
          <li><b>Tu opinión:</b> si respondes la encuesta, tus puntuaciones y tu comentario.</li>
          <li><b>En tu navegador:</b> el progreso de las tareas de prueba y los borradores del chat. No salen de tu dispositivo.</li>
        </ul>
        <p>
          Si entras con tu correo, tu nombre, tu barrio, tus anuncios y tus valoraciones se ven en tu perfil público, como en cualquier app de
          compraventa. Si entras como invitada, nada de lo que hagas lo ve otra persona: ni tu perfil, ni tus anuncios y fotos, ni tus valoraciones.
        </p>

        <h2>Para qué los usamos</h2>
        <p>
          Solo para que la app funcione y para mejorar su diseño con las pruebas de usuarios. La base legal es tu consentimiento al usar la demo.
          No usamos cookies de publicidad ni de analítica, no vendemos tus datos y no los compartimos con nadie.
        </p>

        <h2>Dónde se guardan</h2>
        <p>
          La app está alojada en Vercel y los datos se guardan en Supabase, en servidores de la Unión Europea (Frankfurt). Son los proveedores
          técnicos que hacen funcionar Nido y solo tratan los datos para prestar ese servicio. Vercel es una empresa de Estados Unidos y sirve
          la web desde allí, así que datos técnicos de tu visita (como la dirección IP) pueden tratarse fuera de la Unión Europea. Está
          adherida al Marco de Privacidad de Datos UE-EE. UU., que garantiza un nivel de protección equivalente al europeo.
        </p>

        <h2>Cuánto tiempo</h2>
        <ul>
          <li><b>Cuentas de invitada:</b> se borran solas a las 48 horas, con todo lo que contengan (perfil, anuncios, fotos, mensajes, reservas y valoraciones).</li>
          <li><b>Cuentas con correo:</b> mientras la demo siga publicada.</li>
          <li><b>Respuestas de la encuesta:</b> se conservan para mejorar el diseño. Al borrarse tu cuenta dejan de estar vinculadas a ella.</li>
        </ul>
        <p>Puedes pedir que borremos tus datos en cualquier momento.</p>

        <h2>Tus derechos</h2>
        <p>
          Puedes pedir ver, corregir o borrar tus datos. También puedes oponerte a su uso, limitarlo o pedir una copia. Para ello, escribe a{' '}
          <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. Si no te respondemos bien, puedes reclamar ante la{' '}
          <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">Agencia Española de Protección de Datos</a>.
        </p>
        <p className="muted">Por favor, no subas fotos en las que aparezcan personas o datos de otras personas.</p>
      </main>
    </>
  );
}
