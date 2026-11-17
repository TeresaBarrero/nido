// Catálogo fijo de Nido: etapas, tonos pastel y las 8 secciones con su filtro propio.
import type { ArtKey } from '../components/Art';

export type Tone = 'sky' | 'mint' | 'peach' | 'butter' | 'lavender' | 'pink';

/** Fondo pastel y color de trazo de cada tono. */
export const TONES: Record<Tone, { bg: string; ink: string }> = {
  sky: { bg: '#DCEBF8', ink: '#3F6A9A' },
  mint: { bg: '#DDF1E8', ink: '#2F7A5E' },
  peach: { bg: '#FDE4D8', ink: '#B4613E' },
  butter: { bg: '#FFF2CB', ink: '#9A7413' },
  lavender: { bg: '#ECE7F8', ink: '#6A55A3' },
  pink: { bg: '#FBE3EA', ink: '#A84866' },
};

export type StageKey = '0-3' | '3-6' | '6-12' | '12-24' | '24-48';

export const STAGES: { key: StageKey; label: string; fromMonths: number; toMonths: number }[] = [
  { key: '0-3', label: '0-3 m', fromMonths: 0, toMonths: 3 },
  { key: '3-6', label: '3-6 m', fromMonths: 3, toMonths: 6 },
  { key: '6-12', label: '6-12 m', fromMonths: 6, toMonths: 12 },
  { key: '12-24', label: '1-2 años', fromMonths: 12, toMonths: 24 },
  { key: '24-48', label: '2-4 años', fromMonths: 24, toMonths: 48 },
];

export const stageLabel = (key: StageKey) => STAGES.find((s) => s.key === key)?.label ?? key;

export type SectionName =
  | 'Ropa y calzado'
  | 'Paseo y viaje'
  | 'Dormir'
  | 'Habitación'
  | 'Baño y cambio'
  | 'Comida'
  | 'Juego'
  | 'Seguridad en casa';

export interface Section {
  name: SectionName;
  art: ArtKey;
  tone: Tone;
  subcategories: string[];
  /** Filtro propio de la sección (talla, plegado, colchón…). */
  spec: { label: string; options: { value: string; label: string }[] };
}

export const CAR_SEAT_SUBCATEGORY = 'Sillas de coche (solo nuevas)';

const opts = (...pairs: [string, string?][]) => pairs.map(([value, label]) => ({ value, label: label ?? value }));

export const SECTIONS: Section[] = [
  {
    name: 'Ropa y calzado', art: 'clothes', tone: 'pink',
    subcategories: ['Bodies y pijamas', 'Conjuntos', 'Abrigos', 'Calzado', 'Accesorios'],
    spec: { label: 'Talla', options: opts(['56', '56 cm · 0-1 m'], ['62', '62 cm · 1-3 m'], ['68', '68 cm · 3-6 m'], ['74', '74 cm · 6-9 m'], ['80', '80 cm · 9-12 m']) },
  },
  {
    name: 'Paseo y viaje', art: 'stroller', tone: 'lavender',
    subcategories: ['Carritos y sillas de paseo', 'Capazos', 'Portabebés y fulares', 'Accesorios de paseo', CAR_SEAT_SUBCATEGORY],
    spec: { label: 'Plegado', options: opts(['Una mano'], ['Cabe en cabina']) },
  },
  {
    name: 'Dormir', art: 'crib', tone: 'sky',
    subcategories: ['Cunas y minicunas', 'Moisés y colecho', 'Sacos y ropa de cuna', 'Vigilabebés'],
    spec: { label: 'Colchón', options: opts(['Colchón nuevo', 'Con colchón nuevo'], ['Sin colchón']) },
  },
  {
    name: 'Habitación', art: 'dresser', tone: 'butter',
    subcategories: ['Cómodas y cambiadores', 'Armarios y estanterías', 'Lámparas y decoración'],
    spec: { label: 'Acabado', options: opts(['Madera'], ['Blanco lacado']) },
  },
  {
    name: 'Baño y cambio', art: 'bath', tone: 'mint',
    subcategories: ['Bañeras', 'Hamacas de baño', 'Cambiadores portátiles', 'Orinales y reductores', 'Higiene nueva'],
    spec: { label: 'Formato', options: opts(['Plegable'], ['Precintado', 'Nuevo precintado']) },
  },
  {
    name: 'Comida', art: 'highchair', tone: 'peach',
    subcategories: ['Tronas', 'Biberones y esterilizadores', 'Sacaleches', 'Vajilla infantil'],
    spec: { label: 'Tipo de trona', options: opts(['Evolutiva'], ['Portátil']) },
  },
  {
    name: 'Juego', art: 'gym', tone: 'pink',
    subcategories: ['Hamacas y balancines', 'Gimnasios y alfombras', 'Correpasillos y andadores', 'Juguetes', 'Libros'],
    spec: { label: 'Edad recomendada', options: opts(['0-6 m'], ['6-12 m'], ['1-3 años']) },
  },
  {
    name: 'Seguridad en casa', art: 'gate', tone: 'mint',
    subcategories: ['Barreras', 'Protectores', 'Cierres'],
    spec: { label: 'Ancho de paso', options: opts(['60-75 cm'], ['76-90 cm'], ['91 cm o más']) },
  },
];

export const sectionByName = (name: SectionName) => SECTIONS.find((s) => s.name === name)!;

export const CONDITIONS = ['Nuevo precintado', 'Nuevo sin etiqueta', 'Como nuevo', 'Buen estado', 'Con señales de uso'] as const;
export type Condition = (typeof CONDITIONS)[number];

export const DISTANCES = [2, 5, 10, 20] as const;
