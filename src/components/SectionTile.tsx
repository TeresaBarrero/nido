import { TONES, type Section } from '../data/catalog';
import { Art } from './Art';
import styles from './SectionTile.module.css';

/** Acceso a una sección (Inicio) con su ilustración sobre pastel. */
export function SectionTile({ section, onClick }: { section: Section; onClick: () => void }) {
  const tone = TONES[section.tone];
  return (
    <button type="button" className={styles.tile} onClick={onClick}>
      <span className={styles.ic} style={{ background: tone.bg }}>
        <Art name={section.art} color={tone.ink} />
      </span>
      {section.name}
    </button>
  );
}

/** Cabecera de sección en Buscar (icono + nombre). */
export function SectionBadge({ section, size = 48 }: { section: Section; size?: number }) {
  const tone = TONES[section.tone];
  return (
    <span className={styles.badge} style={{ background: tone.bg, width: size, height: size }}>
      <Art name={section.art} color={tone.ink} />
    </span>
  );
}
