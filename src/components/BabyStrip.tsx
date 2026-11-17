import { stageLabel } from '../data/catalog';
import { ageInMonths, DEMO_USER, previousStage, stageForMonths } from '../data/user';
import { ButtonLink } from './Button';
import { Icon } from './Icon';
import styles from './BabyStrip.module.css';

/** Franja del bebé en Inicio: edad, barra de etapa y aviso "ya no le vale". */
export function BabyStrip({ onStage }: { onStage: () => void }) {
  const { baby } = DEMO_USER;
  const months = ageInMonths(baby.birthDate);
  const stage = stageForMonths(months);
  const outgrown = previousStage(stage);
  // La barra muestra el primer año de vida.
  const progress = Math.min(100, Math.round((months / 12) * 100));

  return (
    <div className={styles.strip}>
      <div className={styles.top}>
        <div className={styles.av}><Icon name="baby" size={24} /></div>
        <div style={{ flex: 1 }}>
          <strong className={styles.name}>{baby.name} · {months} {months === 1 ? 'mes' : 'meses'}</strong>
          <div className={styles.bar} role="img" aria-label={`Etapa ${stageLabel(stage)}`}>
            <i style={{ width: `${Math.max(progress, 6)}%` }} />
          </div>
        </div>
        <button type="button" className="link" onClick={onStage}>Su etapa</button>
      </div>
      {outgrown && (
        <div className={styles.nudge}>
          <Icon name="bell" size={16} style={{ color: '#B4613E' }} />
          <span>La ropa de {stageLabel(outgrown)} ya no le vale. 38 familias cerca la buscan.</span>
          <ButtonLink to="/vender" variant="dark" size="sm" className={styles.sell}>Vender</ButtonLink>
        </div>
      )}
    </div>
  );
}
