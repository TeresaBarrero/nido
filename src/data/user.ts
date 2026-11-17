// Usuaria de ejemplo y utilidades de la etapa del bebé.
import { STAGES, type StageKey } from './catalog';

export const DEMO_USER = {
  name: 'Laura',
  neighborhood: 'Chamberí',
  verified: true,
  rating: 5.0,
  ratingCount: 11,
  stats: { sold: 6, bought: 4, recovered: 312 },
  baby: { name: 'Lucía', birthDate: '2026-06-12' },
};

/** Meses cumplidos entre la fecha de nacimiento y hoy. */
export function ageInMonths(birthDate: string, today = new Date()): number {
  const b = new Date(birthDate + 'T00:00:00');
  let m = (today.getFullYear() - b.getFullYear()) * 12 + (today.getMonth() - b.getMonth());
  if (today.getDate() < b.getDate()) m -= 1;
  return Math.max(0, m);
}

export function stageForMonths(months: number): StageKey {
  return (STAGES.find((s) => months < s.toMonths) ?? STAGES[STAGES.length - 1]).key;
}

export function nextStage(key: StageKey): StageKey {
  const i = STAGES.findIndex((s) => s.key === key);
  return STAGES[Math.min(i + 1, STAGES.length - 1)].key;
}

export function previousStage(key: StageKey): StageKey | null {
  const i = STAGES.findIndex((s) => s.key === key);
  return i > 0 ? STAGES[i - 1].key : null;
}

/** "12 jun 2026" */
export const formatDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '');
