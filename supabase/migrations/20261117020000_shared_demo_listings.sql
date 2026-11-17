-- Nido · los anuncios de ejemplo no se agotan
-- Muchas personas prueban la demo a la vez sobre los mismos anuncios de ejemplo.
-- Si alguien reserva uno de una familia de ejemplo (sin cuenta), la reserva es solo suya
-- y el anuncio sigue disponible para las demás. Los anuncios de personas reales sí se bloquean.

create or replace function public.reserve_listing(p_listing bigint)
returns table (reservation_id uuid, delivery_code text)
language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  l public.listings;
  prop jsonb;
  r public.reservations;
  shared boolean;
begin
  if me is null then raise exception 'Necesitas una sesión'; end if;
  select * into l from public.listings where id = p_listing for update;
  if l.id is null or l.status <> 'live' then raise exception 'Este anuncio ya no está disponible'; end if;
  if l.seller_id = me then raise exception 'No puedes reservar tu propio anuncio'; end if;
  shared := not public.is_real_user(l.seller_id);

  -- Si ya lo habías reservado, devuelve esa reserva.
  select * into r from public.reservations
    where listing_id = p_listing and buyer_id = me and status in ('paid', 'delivered')
    order by created_at desc limit 1;
  if r.id is not null then
    return query select r.id, r.delivery_code::text;
    return;
  end if;

  select m.payload into prop
  from public.messages m join public.conversations c on c.id = m.conversation_id
  where c.listing_id = p_listing and c.buyer_id = me and m.kind = 'meeting_proposal'
  order by m.created_at desc limit 1;

  insert into public.reservations (listing_id, buyer_id, meeting_place, meeting_at, amount, fee)
  values (p_listing, me,
          coalesce(prop ->> 'place', l.meeting_point, 'Por acordar'),
          coalesce((prop ->> 'at')::timestamptz, public.next_saturday_morning()),
          l.price, greatest(0.50, round(l.price * 0.05, 2)))
  returning * into r;

  if not shared then
    update public.listings set status = 'reserved' where id = p_listing;
    insert into public.notifications (profile_id, kind, title, body, link)
    values (l.seller_id, 'reserved', 'Han reservado tu anuncio', l.title || ' · pago protegido recibido', '/perfil');
  end if;

  return query select r.id, r.delivery_code::text;
end $$;

create or replace function public.confirm_delivery(p_reservation uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  r public.reservations;
  seller uuid;
begin
  select * into r from public.reservations where id = p_reservation for update;
  if r.id is null then raise exception 'Reserva no encontrada'; end if;
  select seller_id into seller from public.listings where id = r.listing_id;
  if me is distinct from r.buyer_id and me is distinct from seller then raise exception 'No es tu reserva'; end if;
  if r.status <> 'paid' then return; end if;

  update public.reservations set status = 'delivered' where id = p_reservation;
  if public.is_real_user(seller) then
    update public.listings set status = 'sold' where id = r.listing_id;
  end if;
end $$;

-- Deja disponibles los anuncios de ejemplo que se hubieran reservado en pruebas.
update public.listings l set status = 'live'
where status in ('reserved', 'sold') and not public.is_real_user(l.seller_id) and l.id between 1 and 12;
