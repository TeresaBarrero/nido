import { ButtonLink } from '../components/Button';
import { Logo } from '../components/Logo';

export function NotFound() {
  return (
    <div className="done-screen fade">
      <Logo size={72} />
      <h1 style={{ fontSize: 27, fontWeight: 900 }}>No encontramos esta página</h1>
      <p>Puede que el anuncio ya no exista o que el enlace esté incompleto.</p>
      <ButtonLink to="/" block>Volver al inicio</ButtonLink>
    </div>
  );
}
