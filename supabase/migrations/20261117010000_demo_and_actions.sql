-- Nido · modo demo, acciones (RPC), respuestas automáticas y notificaciones (fase 2)

-- ============================================================
-- Perfil: bienvenida completada y campos protegidos
-- ============================================================
alter table public.profiles add column if not exists onboarded boolean not null default false;
update public.profiles set onboarded = true;  -- perfiles de ejemplo

-- Las cuentas de invitado (modo demo) no tienen correo.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(
    nullif(new.raw_user_meta_data ->> 'name', ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Invitada'));
  return new;
end $$;

-- Nadie puede marcarse como verificada ni cambiar su valoración desde la app.
-- Las funciones de Nido activan 'nido.trusted' para poder hacerlo.
create or replace function public.protect_profile_fields() returns trigger
language plpgsql as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') = 'authenticated'
     and current_setting('nido.trusted', true) is distinct from 'on' then
    new.verified := old.verified;
    new.rating_avg := old.rating_avg;
    new.rating_count := old.rating_count;
  end if;
  return new;
end $$;

drop trigger if exists profiles_protect_fields on public.profiles;
create trigger profiles_protect_fields
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

create or replace function public.refresh_rating() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform set_config('nido.trusted', 'on', true);
  update public.profiles p set
    rating_avg = coalesce((select round(avg(stars)::numeric, 1) from public.reviews where target_id = new.target_id), 0),
    rating_count = (select count(*) from public.reviews where target_id = new.target_id)
  where p.id = new.target_id;
  return new;
end $$;

-- ¿Es una persona real (con cuenta) o un perfil de ejemplo?
create or replace function public.is_real_user(p uuid) returns boolean
language sql security definer set search_path = public, auth stable as $$
  select exists (select 1 from auth.users where id = p);
$$;

-- ============================================================
-- Modo demo: deja la cuenta de invitada lista para explorar
-- ============================================================
create or replace function public.setup_demo() returns void
language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
begin
  if me is null then raise exception 'Necesitas una sesión'; end if;
  perform set_config('nido.trusted', 'on', true);

  update public.profiles
    set name = 'Laura', neighborhood = 'Chamberí', lat = 40.4340, lng = -3.7040,
        verified = true, tone = 'sky', onboarded = true
    where id = me;

  if not exists (select 1 from public.babies where profile_id = me) then
    insert into public.babies (profile_id, name, birth_date) values (me, 'Lucía', '2026-06-12');
  end if;

  insert into public.favorites (profile_id, listing_id) values (me, 4) on conflict do nothing;

  if not exists (select 1 from public.notifications where profile_id = me) then
    insert into public.notifications (profile_id, kind, title, body, link, read, created_at) values
      (me, 'demand', '38 familias cerca buscan ropa de 0-3 m',
       'Lucía ya ha pasado esa etapa: publícala en 30 segundos.', '/vender', false, now() - interval '5 minutes'),
      (me, 'price_drop', 'La trona que guardaste ha bajado a 130 €',
       'Trona evolutiva de madera · 3 km', '/producto/4', false, now() - interval '1 hour'),
      (me, 'stage', 'Lucía cumple 6 meses muy pronto',
       'Mira lo que necesitará: tronas, ropa de 6-12 m y juegos.', '/buscar', true, now() - interval '2 days'),
      (me, 'welcome', 'Bienvenida a la demo de Nido',
       'Los datos son de ejemplo y los pagos, simulados. Las familias de ejemplo te responden solas en el chat.',
       '/mensajes', true, now() - interval '3 days');
  end if;
end $$;

-- ============================================================
-- Chat
-- ============================================================
-- Abre (o recupera) la conversación de quien compra con quien vende.
create or replace function public.start_conversation(p_listing bigint) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  seller uuid;
  cid uuid;
begin
  if me is null then raise exception 'Necesitas una sesión'; end if;
  select id into cid from public.conversations where listing_id = p_listing and buyer_id = me;
  if cid is not null then return cid; end if;

  select seller_id into seller from public.listings where id = p_listing and status = 'live';
  if seller is null then raise exception 'Este anuncio ya no está disponible'; end if;
  if seller = me then raise exception 'Es tu propio anuncio'; end if;

  insert into public.conversations (listing_id, buyer_id, seller_id) values (p_listing, me, seller)
  returning id into cid;
  return cid;
end $$;

-- Próximo sábado a las 10:30 (hora de Madrid), para la propuesta de quedada.
create or replace function public.next_saturday_morning() returns timestamptz
language plpgsql stable as $$
declare d int := (6 - extract(dow from current_date)::int + 7) % 7;
begin
  if d = 0 then d := 7; end if;
  return ((current_date + d) + time '10:30') at time zone 'Europe/Madrid';
end $$;

-- Las familias de ejemplo (sin cuenta) contestan solas, para que la demo se pueda recorrer entera.
create or replace function public.demo_seller_reply() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  c public.conversations;
  l public.listings;
  buyer_msgs int;
  reply text;
begin
  select * into c from public.conversations where id = new.conversation_id;
  if new.sender_id <> c.buyer_id or public.is_real_user(c.seller_id) then
    return new;
  end if;
  select * into l from public.listings where id = c.listing_id;
  select count(*) into buyer_msgs from public.messages
    where conversation_id = c.id and sender_id = c.buyer_id;

  if buyer_msgs = 1 then
    insert into public.messages (conversation_id, sender_id, body, created_at) values
      (c.id, c.seller_id,
       format('¡Hola! Sí, sigue disponible. Vivo al lado de %s, ¿te viene bien quedar allí?', coalesce(l.meeting_point, 'mi casa')),
       now() + interval '1 second');
    insert into public.messages (conversation_id, sender_id, kind, payload, created_at) values
      (c.id, c.seller_id, 'meeting_proposal',
       jsonb_build_object('place', coalesce(l.meeting_point, 'Punto por acordar'), 'at', public.next_saturday_morning()),
       now() + interval '2 seconds');
  else
    reply := case
      when new.body ilike '%defecto%' then 'Ninguno importante: está tal cual se ve en las fotos.'
      when new.body ilike '%manual%' then 'Sí, incluye el manual de instrucciones.'
      when new.body ilike '%otro d_a%' then 'Claro, dime qué día te viene mejor y lo cambiamos.'
      else '¡Perfecto! Cualquier cosa me dices por aquí.'
    end;
    insert into public.messages (conversation_id, sender_id, body, created_at)
      values (c.id, c.seller_id, reply, now() + interval '1 second');
  end if;
  return new;
end $$;

drop trigger if exists messages_demo_reply on public.messages;
create trigger messages_demo_reply
  after insert on public.messages
  for each row execute function public.demo_seller_reply();

-- Aviso a la otra persona cuando le llega un mensaje (solo personas reales).
create or replace function public.notify_message() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  c public.conversations;
  recipient uuid;
  sender_name text;
begin
  select * into c from public.conversations where id = new.conversation_id;
  recipient := case when new.sender_id = c.buyer_id then c.seller_id else c.buyer_id end;
  if not public.is_real_user(recipient) then return new; end if;
  -- Sin avisos de mensajes de familias de ejemplo: la persona ya está en el chat.
  if not public.is_real_user(new.sender_id) then return new; end if;
  select name into sender_name from public.profiles where id = new.sender_id;
  insert into public.notifications (profile_id, kind, title, body, link)
  values (recipient, 'message', 'Nuevo mensaje de ' || coalesce(sender_name, 'una familia'),
          case when new.kind = 'meeting_proposal' then 'Te ha propuesto un punto de entrega' else left(new.body, 120) end,
          '/chat/' || c.listing_id);
  return new;
end $$;

drop trigger if exists messages_notify on public.messages;
create trigger messages_notify
  after insert on public.messages
  for each row execute function public.notify_message();

-- ============================================================
-- Reserva con pago protegido (simulado) y entrega
-- ============================================================
create or replace function public.reserve_listing(p_listing bigint)
returns table (reservation_id uuid, delivery_code text)
language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  l public.listings;
  prop jsonb;
  r public.reservations;
begin
  if me is null then raise exception 'Necesitas una sesión'; end if;
  select * into l from public.listings where id = p_listing for update;
  if l.id is null or l.status <> 'live' then raise exception 'Este anuncio ya no está disponible'; end if;
  if l.seller_id = me then raise exception 'No puedes reservar tu propio anuncio'; end if;

  -- Usa la última propuesta de quedada del chat, si la hay.
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

  update public.listings set status = 'reserved' where id = p_listing;

  if public.is_real_user(l.seller_id) then
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
  update public.listings set status = 'sold' where id = r.listing_id;
end $$;

-- ============================================================
-- Permisos de las funciones
-- ============================================================
revoke execute on function public.setup_demo() from public, anon;
revoke execute on function public.start_conversation(bigint) from public, anon;
revoke execute on function public.reserve_listing(bigint) from public, anon;
revoke execute on function public.confirm_delivery(uuid) from public, anon;
revoke execute on function public.is_real_user(uuid) from public, anon, authenticated;
grant execute on function public.setup_demo() to authenticated;
grant execute on function public.start_conversation(bigint) to authenticated;
grant execute on function public.reserve_listing(bigint) to authenticated;
grant execute on function public.confirm_delivery(uuid) to authenticated;

-- Las notificaciones nuevas llegan en tiempo real.
alter publication supabase_realtime add table public.notifications;
