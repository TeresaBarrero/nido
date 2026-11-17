// Los 12 productos de ejemplo del prototipo (fase 1, sin base de datos).
import type { ArtKey } from '../components/Art';
import type { Condition, SectionName, StageKey, Tone } from './catalog';

export interface Seller {
  name: string;
  tone: Tone;
  rating: number;
  sales: number;
  verified: boolean;
}

export interface Product {
  id: number;
  /** Nombre de la foto en public/img, sin extensión. */
  img: string;
  title: string;
  price: number;
  /** Precio de compra nuevo, para calcular el ahorro. */
  newPrice: number | null;
  art: ArtKey;
  section: SectionName;
  subcategory: string;
  /** Valor del filtro propio de la sección (talla, plegado, colchón…). */
  specValue?: string;
  stages: StageKey[];
  distanceKm: number;
  condition: Condition;
  usage: string;
  includes: string;
  hygiene: string[];
  seller: Seller;
  description: string;
  meetingPoint: string;
  isNew: boolean;
  lotCount?: number;
  complete: boolean;
}

const sellers = {
  marta: { name: 'Marta R.', tone: 'peach', rating: 4.9, sales: 32, verified: true },
  carlos: { name: 'Carlos M.', tone: 'sky', rating: 4.8, sales: 14, verified: true },
  ana: { name: 'Ana G.', tone: 'mint', rating: 5.0, sales: 9, verified: false },
  javier: { name: 'Javier L.', tone: 'lavender', rating: 4.7, sales: 21, verified: true },
  lucia: { name: 'Lucía P.', tone: 'butter', rating: 4.9, sales: 40, verified: true },
  irene: { name: 'Irene S.', tone: 'pink', rating: 4.6, sales: 7, verified: false },
  sara: { name: 'Sara V.', tone: 'sky', rating: 4.8, sales: 12, verified: true },
  pablo: { name: 'Pablo N.', tone: 'mint', rating: 4.7, sales: 18, verified: true },
  elena: { name: 'Elena F.', tone: 'lavender', rating: 4.9, sales: 6, verified: true },
  diego: { name: 'Diego A.', tone: 'peach', rating: 4.8, sales: 11, verified: true },
  nuria: { name: 'Nuria B.', tone: 'butter', rating: 5.0, sales: 4, verified: false },
} satisfies Record<string, Seller>;

export const PRODUCTS: Product[] = [
  {
    id: 1, img: 'banera', title: 'Bañera plegable con hamaca', price: 25, newPrice: 45, art: 'bath',
    section: 'Baño y cambio', subcategory: 'Bañeras', specValue: 'Plegable', stages: ['0-3', '3-6', '6-12'],
    distanceKm: 0.8, condition: 'Como nuevo', usage: 'Usada 1 mes', includes: 'Hamaca de baño, tapón y manual',
    hygiene: ['Lavada y desinfectada', 'Casa sin humo'], seller: sellers.marta,
    description: 'La usamos solo el primer mes porque pasamos a la bañera grande. Plegada cabe detrás de una puerta. Incluye la hamaca de baño para recién nacido.',
    meetingPoint: 'Plaza de Olavide', isNew: false, complete: true,
  },
  {
    id: 2, img: 'minicuna', title: 'Minicuna colecho de madera', price: 90, newPrice: 189, art: 'crib',
    section: 'Dormir', subcategory: 'Cunas y minicunas', specValue: 'Colchón nuevo', stages: ['0-3', '3-6'],
    distanceKm: 1.5, condition: 'Buen estado', usage: 'Usada 5 meses', includes: 'Kit de colecho, bolsa y manual. Colchón nuevo',
    hygiene: ['Funda lavada', 'Colchón nuevo'], seller: sellers.carlos,
    description: 'De haya, con laterales de malla transpirable y correa de sujeción a la cama. Por higiene, la vendo con un colchón nuevo sin estrenar.',
    meetingPoint: 'Metro Iglesia', isNew: false, complete: true,
  },
  {
    id: 3, img: 'lote-ropa', title: 'Lote 22 prendas recién nacido', price: 30, newPrice: null, art: 'clothes',
    section: 'Ropa y calzado', subcategory: 'Bodies y pijamas', specValue: '56', stages: ['0-3'],
    distanceKm: 2.1, condition: 'Como nuevo', usage: 'Lote',
    includes: 'Bodies, pijamas, chaquetas de punto, gorro, patucos y albornoz · talla 56 cm',
    hygiene: ['Lavada', 'Casa sin mascotas'], seller: sellers.ana,
    description: 'Colores neutros, varias prendas con etiqueta. Todo de la misma talla.',
    meetingPoint: 'Mercado de Chamberí', isNew: false, lotCount: 22, complete: true,
  },
  {
    id: 4, img: 'trona', title: 'Trona evolutiva de madera con baby set', price: 140, newPrice: 259, art: 'highchair',
    section: 'Comida', subcategory: 'Tronas', specValue: 'Evolutiva', stages: ['6-12', '12-24', '24-48'],
    distanceKm: 3.0, condition: 'Buen estado', usage: 'Usada 2 años', includes: 'Baby set, bandeja y manual',
    hygiene: ['Desinfectada'], seller: sellers.javier,
    description: 'Algún arañazo leve en la base, todo funciona perfecto.',
    meetingPoint: 'Glorieta de Quevedo', isNew: false, complete: true,
  },
  {
    id: 5, img: 'mochila', title: 'Mochila portabebés ergonómica', price: 70, newPrice: 179, art: 'carrier',
    section: 'Paseo y viaje', subcategory: 'Portabebés y fulares', specValue: 'Una mano', stages: ['0-3', '3-6', '6-12', '12-24'],
    distanceKm: 1.1, condition: 'Como nuevo', usage: 'Usada 3 meses', includes: 'Completa, con manual',
    hygiene: ['Lavada', 'Casa sin humo'], seller: sellers.lucia,
    description: 'Ergonómica desde recién nacido sin cojín reductor.',
    meetingPoint: 'Plaza de Chamberí', isNew: false, complete: true,
  },
  {
    id: 6, img: 'hamaca', title: 'Hamaca balancín con base de madera', price: 75, newPrice: 189, art: 'bouncer',
    section: 'Juego', subcategory: 'Hamacas y balancines', specValue: '0-6 m', stages: ['0-3', '3-6', '6-12'],
    distanceKm: 4.2, condition: 'Buen estado', usage: 'Usada 8 meses', includes: 'Completa, sin manual',
    hygiene: ['Funda lavada'], seller: sellers.irene,
    description: 'Se mece con el movimiento del bebé, sin pilas. Funda de algodón desenfundable.',
    meetingPoint: 'Metro Bilbao', isNew: false, complete: false,
  },
  {
    id: 7, img: 'toallitas', title: '8 packs de toallitas Huggies Natural Care', price: 25, newPrice: 40, art: 'wipes',
    section: 'Baño y cambio', subcategory: 'Higiene nueva', specValue: 'Precintado', stages: ['0-3', '3-6', '6-12', '12-24'],
    distanceKm: 0.6, condition: 'Nuevo precintado', usage: 'Sin abrir',
    includes: '8 packs ahorro precintados (4 × 128 toallitas cada uno)',
    hygiene: ['Precintado'], seller: sellers.marta,
    description: 'Compramos de más antes de nacer y nos han sobrado. Todos sin abrir.',
    meetingPoint: 'Plaza de Olavide', isNew: true, complete: true,
  },
  {
    id: 8, img: 'bodies', title: '5 bodies estampados 3-6 meses', price: 10, newPrice: null, art: 'bodies',
    section: 'Ropa y calzado', subcategory: 'Bodies y pijamas', specValue: '68', stages: ['3-6'],
    distanceKm: 1.9, condition: 'Como nuevo', usage: 'Lote', includes: '5 bodies · talla 68 cm',
    hygiene: ['Lavada'], seller: sellers.sara,
    description: 'Algodón, dos de manga larga y tres de manga corta. Estampados de bosque, flores y rayas.',
    meetingPoint: 'Calle Fuencarral', isNew: false, lotCount: 5, complete: true,
  },
  {
    id: 9, img: 'silla-paseo', title: 'Silla de paseo ligera plegable', price: 180, newPrice: 349, art: 'stroller',
    section: 'Paseo y viaje', subcategory: 'Carritos y sillas de paseo', specValue: 'Cabe en cabina', stages: ['6-12', '12-24', '24-48'],
    distanceKm: 6.8, condition: 'Buen estado', usage: 'Usada 1 año', includes: 'Burbuja de lluvia y manual',
    hygiene: ['Tapicería lavada'], seller: sellers.pablo,
    description: 'Se pliega con una mano y cabe en cabina de avión.',
    meetingPoint: 'Nuevos Ministerios', isNew: false, complete: true,
  },
  {
    id: 10, img: 'comoda', title: 'Cómoda blanca con cambiador', price: 45, newPrice: 129, art: 'dresser',
    section: 'Habitación', subcategory: 'Cómodas y cambiadores', specValue: 'Blanco lacado', stages: ['0-3', '3-6', '6-12', '12-24', '24-48'],
    distanceKm: 2.6, condition: 'Buen estado', usage: 'Usada 2 años', includes: 'Tablero cambiador y manual de montaje',
    hygiene: ['Limpia'], seller: sellers.elena,
    description: 'Seis cajones amplios y bandeja cambiador desmontable. Se entrega montada; cabe en un coche grande con los asientos bajados.',
    meetingPoint: 'Plaza de Olavide', isNew: false, complete: true,
  },
  {
    id: 11, img: 'barrera', title: 'Barrera de seguridad extensible', price: 20, newPrice: 49, art: 'gate',
    section: 'Seguridad en casa', subcategory: 'Barreras', specValue: '76-90 cm', stages: ['6-12', '12-24', '24-48'],
    distanceKm: 1.4, condition: 'Como nuevo', usage: 'Usada 6 meses', includes: '2 extensiones de 7 cm y anclajes',
    hygiene: ['Limpia'], seller: sellers.diego,
    description: 'De 76 a 82 cm, ampliable hasta 89 cm con las extensiones. Sin taladrar.',
    meetingPoint: 'Metro Quevedo', isNew: false, complete: true,
  },
  {
    id: 12, img: 'gimnasio', title: 'Gimnasio de madera con alfombra', price: 22, newPrice: 60, art: 'gym',
    section: 'Juego', subcategory: 'Gimnasios y alfombras', specValue: '0-6 m', stages: ['0-3', '3-6'],
    distanceKm: 2.3, condition: 'Como nuevo', usage: 'Usado 4 meses',
    includes: 'Arco de madera, alfombra acolchada, 3 colgantes y libro de tela',
    hygiene: ['Alfombra lavada', 'Casa sin humo'], seller: sellers.nuria,
    description: 'Alfombra acolchada lavable a máquina. Juguetes desmontables.',
    meetingPoint: 'Calle Fuencarral', isNew: false, complete: true,
  },
];

export const getProduct = (id: number) => PRODUCTS.find((p) => p.id === id);
export const productImage = (p: Pick<Product, 'img'>) => `/img/${p.img}.jpg`;
