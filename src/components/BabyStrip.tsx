import type { Baby } from '../app/Auth';
import { stageLabel } from '../data/catalog';
import { ageInMonths, previousStage, stageForMonths } from '../data/user';
import { ButtonLink } from './Button';
import { Icon } from './Icon';
import styles from './BabyStrip.module.css';

/** Franja del bebé en Inicio: edad, barra de etapa y aviso "ya no le vale". */
export function BabyStrip({ baby, onStage }: { baby: Baby | null; onStage: () => void }) {
  if (!baby) {
    return (
      <div className={styles.strip}>
        <div className={styles.top}>
          <div className={styles.av}><Icon name="baby" size={24} /></div>
          <span style={{ flex: 1, fontSize: 14 }}>Añade la fecha de tu bebé y te sugerimos lo que necesitará en cada etapa.</span>
        </div>
      </div>
    );
  }

  const months = ageInMonths(baby.birth_date);
  const born = new Date(baby.birth_date + 'T00:00:00') <= new Date();
  const stage = stageForMonths(months);
  const outgrown = born ? previousStage(stage) : null;
  // La barra muestra el primer año de vida.
  const progress = Math.min(100, Math.round((months / 12) * 100));
  const name = baby.name || 'Tu bebé';

  return (
    <div className={styles.strip}>
      <div className={styles.top}>
        <div className={styles.av}><Icon name="baby" size={24} /></div>
        <div style={{ flex: 1 }}>
          <strong className={styles.name}>
            {born ? `${name} · ${months} ${months === 1 ? 'mes' : 'meses'}` : `${name} · en camino`}
          </strong>
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
