// Lectura de anuncios desde Supabase, convertidos al formato `Product` que usan las pantallas.
import { useEffect, useState } from 'react';
import { sectionByName, type Condition, type SectionName, type StageKey, type Tone } from './catalog';
import type { Product } from './products';
import { photoUrl, supabase } from './supabase';

/** Punto desde el que se mide la distancia: el de tu perfil, o el centro de Chamberí por defecto. */
let homePoint = { lat: 40.434, lng: -3.704 };

export function setHomePoint(p: { lat: number; lng: number }) {
  if (p.lat === homePoint.lat && p.lng === homePoint.lng) return;
  homePoint = p;
  cache = null; // las distancias cambian
}

/** Olvida los anuncios guardados (tras publicar, reservar o pausar). */
export function invalidateListings() {
  cache = null;
}

/** Distancia en km entre dos coordenadas (fórmula de Haversine), con un decimal. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10;
}

/** Imagen de reserva cuando un anuncio no tiene fotos. */
export const NO_PHOTO = '/favicon.svg';

export const LISTING_SELECT = `
  id, title, description, section, subcategory, spec_value, stages, condition, usage, includes,
  is_complete, hygiene, price, new_price, lot_count, meeting_point, lat, lng, status,
  seller:profiles!listings_seller_id_fkey ( id, name, tone, verified, rating_avg, rating_count ),
  listing_photos ( path, position )
`;

export interface Row {
  id: number;
  title: string;
  description: string;
  section: SectionName;
  subcategory: string;
  spec_value: string | null;
  stages: StageKey[];
  condition: Condition;
  usage: string | null;
  includes: string | null;
  is_complete: boolean;
  hygiene: string[];
  price: number;
  new_price: number | null;
  lot_count: number | null;
  meeting_point: string | null;
  lat: number | null;
  lng: number | null;
  status: Product['status'];
  seller: { id: string; name: string; tone: Tone; verified: boolean; rating_avg: number; rating_count: number } | null;
  listing_photos: { path: string; position: number }[];
}

export function toProduct(r: Row): Product {
  const photos = [...r.listing_photos].sort((a, b) => a.position - b.position);
  return {
    id: r.id,
    sellerId: r.seller?.id,
    status: r.status,
    photo: photos[0] ? photoUrl(photos[0].path) : NO_PHOTO,
    title: r.title,
    price: Number(r.price),
    newPrice: r.new_price == null ? null : Number(r.new_price),
    art: sectionByName(r.section).art,
    section: r.section,
    subcategory: r.subcategory,
    specValue: r.spec_value ?? undefined,
    stages: r.stages,
    distanceKm: r.lat != null && r.lng != null ? distanceKm(homePoint, { lat: r.lat, lng: r.lng }) : 0,
    condition: r.condition,
    usage: r.usage ?? '',
    includes: r.includes ?? '',
    hygiene: r.hygiene,
    seller: {
      name: r.seller?.name ?? 'Familia de Nido',
      tone: r.seller?.tone ?? 'sky',
      rating: Number(r.seller?.rating_avg ?? 0),
      sales: r.seller?.rating_count ?? 0,
      verified: r.seller?.verified ?? false,
    },
    description: r.description,
    meetingPoint: r.meeting_point ?? 'Punto de encuentro por acordar',
    isNew: r.condition === 'Nuevo precintado',
    lotCount: r.lot_count ?? undefined,
    complete: r.is_complete,
  };
}

// Caché compartida: Inicio, Buscar y la Ficha usan la misma petición.
let cache: Product[] | null = null;
let inflight: Promise<Product[]> | null = null;

export function loadListings(force = false): Promise<Product[]> {
  if (cache && !force) return Promise.resolve(cache);
  if (inflight && !force) return inflight;
  inflight = (async () => {
    const { data, error } = await supabase.from('listings').select(LISTING_SELECT).eq('status', 'live').eq('is_demo_copy', false);
    inflight = null;
    if (error) throw error;
    cache = (data as unknown as Row[]).map(toProduct);
    return cache;
  })();
  return inflight;
}

async function loadListing(id: number): Promise<Product | null> {
  const hit = cache?.find((p) => p.id === id);
  if (hit) return hit;
  const { data, error } = await supabase.from('listings').select(LISTING_SELECT).eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? toProduct(data as unknown as Row) : null;
}

type State<T> = { data: T; loading: boolean; error: boolean };

/** Anuncios activos. `reload` vuelve a pedirlos (por ejemplo, tras un error). */
export function useListings() {
  const [state, setState] = useState<State<Product[]>>({ data: cache ?? [], loading: !cache, error: false });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    loadListings(attempt > 0)
      .then((data) => alive && setState({ data, loading: false, error: false }))
      .catch(() => alive && setState((s) => ({ ...s, loading: false, error: true })));
    return () => { alive = false; };
  }, [attempt]);

  return { ...state, reload: () => { setState((s) => ({ ...s, loading: true, error: false })); setAttempt((n) => n + 1); } };
}

/** Un anuncio por id (también los reservados o vendidos que se puedan ver). */
export function useListing(id: number) {
  const [state, setState] = useState<State<Product | null>>(() => {
    const hit = cache?.find((p) => p.id === id) ?? null;
    return { data: hit, loading: !hit, error: false };
  });

  useEffect(() => {
    let alive = true;
    loadListing(id)
      .then((data) => alive && setState({ data, loading: false, error: false }))
      .catch(() => alive && setState({ data: null, loading: false, error: true }));
    return () => { alive = false; };
  }, [id]);

  return state;
}
