// Acciones y consultas de Supabase que usan las pantallas (chat, reservas, perfil, publicar).
import { useCallback, useEffect, useState } from 'react';
import type { Tone } from './catalog';
import { invalidateListings, LISTING_SELECT, toProduct, type Row } from './listings';
import type { ListingStatus, Product } from './products';
import { photoUrl, supabase } from './supabase';

// ------------------------------------------------------------
// Chat
// ------------------------------------------------------------
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  kind: 'text' | 'meeting_proposal';
  payload: { place: string; at: string } | null;
  created_at: string;
  /** Si se eliminó «para todos», la fecha; el texto queda vacío. */
  deleted_at?: string | null;
}

export interface PersonLite { id: string; name: string; tone: Tone; verified: boolean }

export interface Conversation {
  id: string;
  listing_id: number;
  buyer: PersonLite;
  seller: PersonLite;
  /** Hasta cuándo ha vaciado cada persona la conversación («eliminar solo para mí»). */
  buyer_cleared_at?: string | null;
  seller_cleared_at?: string | null;
}

/** Fecha en la que esta persona eliminó la conversación para sí, si lo hizo. */
export const clearedAt = (c: Conversation, userId: string | null) =>
  (c.buyer.id === userId ? c.buyer_cleared_at : c.seller.id === userId ? c.seller_cleared_at : null) ?? null;

/** Mensajes que esta persona sigue viendo (los posteriores a eliminar la conversación). */
export const visibleMessages = (c: Conversation, userId: string | null, msgs: Message[]) => {
  const since = clearedAt(c, userId);
  return since ? msgs.filter((m) => m.created_at > since) : msgs;
};

export async function clearConversation(conversationId: string) {
  const { error } = await supabase.rpc('clear_conversation', { p_conversation: conversationId });
  if (error) throw error;
}

const CONV_SELECT = `id, listing_id, buyer_cleared_at, seller_cleared_at,
  buyer:profiles!conversations_buyer_id_fkey ( id, name, tone, verified ),
  seller:profiles!conversations_seller_id_fkey ( id, name, tone, verified )`;

/** Abre la conversación de un anuncio (o una concreta si se conoce su id) y escucha mensajes nuevos. */
export function useConversation(listingId: number, conversationId: string | null) {
  const [conv, setConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    setConv(null); setMessages([]); setError(null);

    (async () => {
      let cid = conversationId;
      if (!cid) {
        const { data, error: e } = await supabase.rpc('start_conversation', { p_listing: listingId });
        if (e) { if (alive) setError(e.message); return; }
        cid = data as string;
      }
      const [c, m] = await Promise.all([
        supabase.from('conversations').select(CONV_SELECT).eq('id', cid).single(),
        supabase.from('messages').select('*').eq('conversation_id', cid).order('created_at'),
      ]);
      if (!alive) return;
      if (c.error) { setError(c.error.message); return; }
      setConv(c.data as unknown as Conversation);
      setMessages((m.data as Message[]) ?? []);

      channel = supabase
        .channel(`messages:${cid}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${cid}` },
          (payload) => setMessages((prev) => prev.some((x) => x.id === (payload.new as Message).id) ? prev : [...prev, payload.new as Message]))
        // Mensajes eliminados por la otra persona (o por ti en otro dispositivo).
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `conversation_id=eq.${cid}` },
          (payload) => setMessages((prev) => prev.map((x) => x.id === (payload.new as Message).id ? { ...x, ...(payload.new as Message) } : x)))
        .subscribe();
    })();

    return () => { alive = false; if (channel) supabase.removeChannel(channel); };
  }, [listingId, conversationId]);

  const send = useCallback(async (senderId: string, body: string) => {
    if (!conv) return;
    const { data, error: e } = await supabase.from('messages')
      .insert({ conversation_id: conv.id, sender_id: senderId, body }).select('*').single();
    if (e) throw e;
    setMessages((prev) => prev.some((x) => x.id === data.id) ? prev : [...prev, data as Message]);
  }, [conv]);

  const remove = useCallback(async (messageId: string) => {
    const { error: e } = await supabase.rpc('delete_message', { p_message: messageId });
    if (e) throw e;
    const now = new Date().toISOString();
    setMessages((prev) => prev.map((x) => x.id === messageId ? { ...x, body: '', deleted_at: now } : x));
  }, []);

  return { conv, messages, error, send, remove };
}

export interface ConversationSummary extends Conversation {
  title: string;
  photo: string | null;
  last: Message | null;
}

export async function fetchConversations(userId: string | null): Promise<ConversationSummary[]> {
  const { data, error } = await supabase.from('conversations').select(`${CONV_SELECT},
    listing:listings ( title, listing_photos ( path, position ) ),
    messages ( id, conversation_id, sender_id, body, kind, payload, created_at, deleted_at )`);
  if (error) throw error;
  type R = Conversation & { listing: { title: string; listing_photos: { path: string; position: number }[] } | null; messages: Message[] };
  return (data as unknown as R[]).map((r) => {
    const msgs = visibleMessages(r, userId, [...r.messages].sort((a, b) => a.created_at.localeCompare(b.created_at)));
    const ph = [...(r.listing?.listing_photos ?? [])].sort((a, b) => a.position - b.position)[0];
    return {
      id: r.id, listing_id: r.listing_id, buyer: r.buyer, seller: r.seller,
      buyer_cleared_at: r.buyer_cleared_at, seller_cleared_at: r.seller_cleared_at,
      title: r.listing?.title ?? 'Anuncio', photo: ph ? photoUrl(ph.path) : null, last: msgs[msgs.length - 1] ?? null,
    };
  })
    // Las que has eliminado no aparecen hasta que llegue un mensaje nuevo.
    .filter((c) => !clearedAt(c, userId) || c.last)
    .sort((a, b) => (b.last?.created_at ?? '').localeCompare(a.last?.created_at ?? ''));
}

// ------------------------------------------------------------
// Reservas
// ------------------------------------------------------------
export interface Reservation {
  id: string;
  listing_id: number;
  meeting_place: string;
  meeting_at: string;
  amount: number;
  fee: number;
  status: 'paid' | 'delivered' | 'cancelled';
  delivery_code: string;
}

/** Última propuesta de quedada del chat de este anuncio (si la hay). */
export async function fetchLatestProposal(listingId: number, buyerId: string) {
  const { data } = await supabase.from('messages')
    .select('payload, conversations!inner ( listing_id, buyer_id )')
    .eq('kind', 'meeting_proposal').eq('conversations.listing_id', listingId).eq('conversations.buyer_id', buyerId)
    .order('created_at', { ascending: false }).limit(1).maybeSingle();
  return (data?.payload as { place: string; at: string } | undefined) ?? null;
}

export async function reserveListing(listingId: number) {
  const { data, error } = await supabase.rpc('reserve_listing', { p_listing: listingId });
  if (error) throw error;
  invalidateListings();
  return (data as { reservation_id: string; delivery_code: string }[])[0];
}

export async function fetchMyReservation(listingId: number, buyerId: string): Promise<Reservation | null> {
  const { data, error } = await supabase.from('reservations').select('*')
    .eq('listing_id', listingId).eq('buyer_id', buyerId).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data as Reservation | null;
}

/** Tu reserva de este anuncio, si la tienes (undefined mientras carga). */
export function useMyReservation(listingId: number, buyerId: string | null) {
  const [res, setRes] = useState<Reservation | null | undefined>(undefined);
  useEffect(() => {
    if (!buyerId) { setRes(null); return; }
    let alive = true;
    fetchMyReservation(listingId, buyerId).then((r) => alive && setRes(r)).catch(() => alive && setRes(null));
    return () => { alive = false; };
  }, [listingId, buyerId]);
  return res;
}

export interface ActiveReservation {
  id: string;
  listing_id: number;
  meeting_place: string;
  meeting_at: string;
  title: string;
}

/** Tu reserva pendiente de entrega más reciente (para el aviso fijo de Inicio). */
export function useActiveReservation(buyerId: string | null) {
  const [res, setRes] = useState<ActiveReservation | null>(null);
  useEffect(() => {
    if (!buyerId) { setRes(null); return; }
    let alive = true;
    supabase.from('reservations')
      .select('id, listing_id, meeting_place, meeting_at, listings ( title )')
      .eq('buyer_id', buyerId).eq('status', 'paid')
      .order('created_at', { ascending: false }).limit(1).maybeSingle()
      .then(({ data }) => {
        if (!alive) return;
        if (!data) { setRes(null); return; }
        const l = data.listings as unknown as { title: string } | { title: string }[] | null;
        const title = (Array.isArray(l) ? l[0]?.title : l?.title) ?? 'Tu artículo';
        setRes({ id: data.id, listing_id: data.listing_id, meeting_place: data.meeting_place, meeting_at: data.meeting_at, title });
      });
    return () => { alive = false; };
  }, [buyerId]);
  return res;
}

export async function confirmDelivery(reservationId: string) {
  const { error } = await supabase.rpc('confirm_delivery', { p_reservation: reservationId });
  if (error) throw error;
  invalidateListings();
}

export async function leaveReview(r: { reservationId: string; authorId: string; targetId: string; stars: number }) {
  const { error } = await supabase.from('reviews').upsert(
    { reservation_id: r.reservationId, author_id: r.authorId, target_id: r.targetId, stars: r.stars },
    { onConflict: 'reservation_id,author_id', ignoreDuplicates: true },
  );
  if (error) throw error;
}

/** "sábado 21 nov · 10:30" */
export const meetingLabel = (iso: string) => {
  const d = new Date(iso);
  const day = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' }).replace('.', '').replace(',', '');
  const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  return `${day.charAt(0).toUpperCase()}${day.slice(1)} · ${time}`;
};

// ------------------------------------------------------------
// Perfil
// ------------------------------------------------------------
export interface MyListing extends Product { status: ListingStatus }

export async function fetchMyListings(userId: string): Promise<MyListing[]> {
  const { data, error } = await supabase.from('listings').select(LISTING_SELECT)
    .eq('seller_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data as unknown as Row[]).map((r) => toProduct(r) as MyListing);
}

export async function updateMyListing(id: number, patch: { status?: ListingStatus; title?: string; price?: number }) {
  const { error } = await supabase.from('listings').update(patch).eq('id', id);
  if (error) throw error;
  invalidateListings();
}

export interface ProfileStats { sold: number; bought: number; recovered: number }

export async function fetchStats(userId: string): Promise<ProfileStats> {
  const [sold, bought] = await Promise.all([
    supabase.from('listings').select('price').eq('seller_id', userId).eq('status', 'sold'),
    supabase.from('reservations').select('id', { count: 'exact', head: true }).eq('buyer_id', userId).eq('status', 'delivered'),
  ]);
  const prices = (sold.data ?? []).map((r) => Number(r.price));
  return { sold: prices.length, bought: bought.count ?? 0, recovered: prices.reduce((a, b) => a + b, 0) };
}

export interface Review { id: string; stars: number; text: string | null; created_at: string; author: { name: string; tone: Tone } | null }

export async function fetchReviews(userId: string): Promise<Review[]> {
  const { data, error } = await supabase.from('reviews')
    .select('id, stars, text, created_at, author:profiles!reviews_author_id_fkey ( name, tone )')
    .eq('target_id', userId).order('created_at', { ascending: false }).limit(10);
  if (error) throw error;
  return data as unknown as Review[];
}

/** "hace 2 semanas" */
export function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
  if (s < 60) return 'ahora';
  if (s < 3600) return rtf.format(-Math.round(s / 60), 'minute');
  if (s < 86400) return rtf.format(-Math.round(s / 3600), 'hour');
  if (s < 604800) return rtf.format(-Math.round(s / 86400), 'day');
  if (s < 2592000) return rtf.format(-Math.round(s / 604800), 'week');
  return rtf.format(-Math.round(s / 2592000), 'month');
}

// ------------------------------------------------------------
// Publicar
// ------------------------------------------------------------
/** Reduce la foto a 1600 px como máximo y la convierte a JPEG (fotos de móvil más ligeras). */
async function shrink(file: Blob): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    return await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('foto'))), 'image/jpeg', 0.85));
  } catch {
    return file;
  }
}

export interface NewListing {
  title: string;
  description: string;
  section: string;
  subcategory: string;
  spec_value: string | null;
  stages: string[];
  condition: string;
  is_complete: boolean;
  hygiene: string[];
  price: number;
  new_price: number | null;
  delivery: 'hand' | 'hand_ship';
  meeting_point: string;
  lat: number | null;
  lng: number | null;
}

export async function publishListing(userId: string, listing: NewListing, photos: Blob[]) {
  const { data, error } = await supabase.from('listings')
    .insert({ ...listing, seller_id: userId, status: 'live' }).select('id, status').single();
  if (error) throw error;

  const paths: string[] = [];
  for (const [i, photo] of photos.entries()) {
    const path = `${userId}/${data.id}-${Date.now()}-${i}.jpg`;
    const up = await supabase.storage.from('listing-photos').upload(path, await shrink(photo), { contentType: 'image/jpeg' });
    if (up.error) throw up.error;
    paths.push(path);
  }
  if (paths.length) {
    const { error: e } = await supabase.from('listing_photos').insert(paths.map((path, position) => ({ listing_id: data.id, path, position })));
    if (e) throw e;
  }
  invalidateListings();
  return { id: data.id as number, status: data.status as ListingStatus, photo: paths[0] ? photoUrl(paths[0]) : null };
}
