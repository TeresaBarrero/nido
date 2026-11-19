-- Nido · aislamiento y limpieza de la demo
-- Regla: una cuenta de invitada (inicio de sesión anónimo) solo ve lo suyo y solo
-- interactúa con las familias de ejemplo. Nada de lo que escribe lo ve otro visitante.
-- Las cuentas de invitada se borran solas a las 48 horas (Edge Function cleanup-demo + pg_cron).

-- ============================================================
-- 1 · Marcar los perfiles de invitada
-- ============================================================
alter table public.profiles add column if not exists is_demo boolean not null default false;

update public.profiles p set is_demo = true
from auth.users u
where u.id = p.id and u.is_anonymous;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, is_demo)
  values (new.id, coalesce(
    nullif(new.raw_user_meta_data ->> 'name', ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Invitada'), coalesce(new.is_anonymous, false));
  return new;
end $$;

-- is_demo no lo cambia nadie desde la app, ni siquiera dentro de las funciones de Nido.
create or replace function public.protect_profile_fields() returns trigger
language plpgsql as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') in ('authenticated', 'anon') then
    new.is_demo := old.is_demo;
    if current_setting('nido.trusted', true) is distinct from 'on' then
      new.verified := old.verified;
      new.rating_avg := old.rating_avg;
      new.rating_count := old.rating_count;
    end if;
  end if;
  return new;
end $$;

-- Para las políticas: los perfiles de invitada quedan ocultos, así que hace falta security definer.
create or replace function public.is_demo_profile(p uuid) returns boolean
language sql security definer set search_path = public stable as $$
  select coalesce((select is_demo from public.profiles where id = p), false);
$$;

-- ============================================================
-- 2 · Lo que escribe una invitada solo lo ve ella
-- ============================================================
-- Anuncios (y con ellos sus fotos y conversaciones, cuyas políticas dependen de esta).
drop policy if exists "listings public" on public.listings;
create policy "listings public" on public.listings for select
  using ((select auth.uid()) = seller_id
    or (status in ('live','reserved','sold') and not public.is_demo_profile(seller_id)));

-- Perfiles: los de invitada solo los ve su dueña.
drop policy if exists "profiles readable" on public.profiles;
create policy "profiles readable" on public.profiles for select
  using (not is_demo or id = (select auth.uid()));

-- Reseñas escritas por una invitada: solo las ve ella.
drop policy if exists "reviews readable" on public.reviews;
create policy "reviews readable" on public.reviews for select
  using (not public.is_demo_profile(author_id) or author_id = (select auth.uid()));

-- La media solo se recalcula para personas reales y sin contar reseñas de invitadas.
-- Las familias de ejemplo conservan siempre sus valoraciones.
create or replace function public.refresh_rating() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if public.is_demo_profile(new.author_id) or not public.is_real_user(new.target_id) then
    return new;
  end if;
  perform set_config('nido.trusted', 'on', true);
  update public.profiles p set
    rating_avg = coalesce((select round(avg(r.stars)::numeric, 1) from public.reviews r
                           where r.target_id = new.target_id and not public.is_demo_profile(r.author_id)), 0),
    rating_count = (select count(*) from public.reviews r
                    where r.target_id = new.target_id and not public.is_demo_profile(r.author_id))
  where p.id = new.target_id;
  return new;
end $$;

-- Devuelve a las familias de ejemplo las valoraciones de seed.sql (las reseñas de la demo las cambiaban).
update public.profiles p set rating_avg = s.avg, rating_count = s.cnt
from (values
  ('00000000-0000-4000-8000-000000000001'::uuid, 5.0, 11),
  ('00000000-0000-4000-8000-000000000011'::uuid, 4.9, 32),
  ('00000000-0000-4000-8000-000000000012'::uuid, 4.8, 14),
  ('00000000-0000-4000-8000-000000000013'::uuid, 5.0,  9),
  ('00000000-0000-4000-8000-000000000014'::uuid, 4.7, 21),
  ('00000000-0000-4000-8000-000000000015'::uuid, 4.9, 40),
  ('00000000-0000-4000-8000-000000000016'::uuid, 4.6,  7),
  ('00000000-0000-4000-8000-000000000017'::uuid, 4.8, 12),
  ('00000000-0000-4000-8000-000000000018'::uuid, 4.7, 18),
  ('00000000-0000-4000-8000-000000000019'::uuid, 4.9,  6),
  ('00000000-0000-4000-8000-000000000020'::uuid, 4.8, 11),
  ('00000000-0000-4000-8000-000000000021'::uuid, 5.0,  4),
  ('00000000-0000-4000-8000-000000000022'::uuid, 4.9,  8),
  ('00000000-0000-4000-8000-000000000023'::uuid, 4.8,  5)
) as s(id, avg, cnt)
where p.id = s.id and not public.is_real_user(p.id);

-- Chat y reserva (security definer, se saltan RLS): mismas reglas que la política de anuncios.
-- Una invitada solo trata con familias de ejemplo; nadie trata con una invitada.
create or replace function public.check_demo_counterparty(me uuid, seller uuid) returns void
language plpgsql security definer set search_path = public stable as $$
begin
  if public.is_demo_profile(seller) then
    raise exception 'Este anuncio ya no está disponible';
  end if;
  if public.is_demo_profile(me) and public.is_real_user(seller) then
    raise exception 'En la demo puedes escribir y reservar a las familias de ejemplo';
  end if;
end $$;
revoke execute on function public.check_demo_counterparty(uuid, uuid) from public, anon, authenticated;

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
  perform public.check_demo_counterparty(me, seller);

  insert into public.conversations (listing_id, buyer_id, seller_id) values (p_listing, me, seller)
  returning id into cid;
  return cid;
end $$;

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
  perform public.check_demo_counterparty(me, l.seller_id);
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

-- Fotos: una invitada puede subir como mucho 30 archivos (se borran con su cuenta).
create or replace function public.can_upload_photo() returns boolean
language sql security definer set search_path = public, storage stable as $$
  select not public.is_demo_profile(auth.uid())
      or (select count(*) from storage.objects o
          where o.bucket_id = 'listing-photos' and (storage.foldername(o.name))[1] = auth.uid()::text) < 30;
$$;

drop policy if exists "photos upload own folder" on storage.objects;
create policy "photos upload own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and public.can_upload_photo());

-- ============================================================
-- 3 · Limpieza automática de las cuentas de invitada (más de 48 horas)
-- ============================================================
-- La Edge Function cleanup-demo: 1) pide la lista, 2) borra sus fotos con la API de Storage,
-- 3) llama a purge_demo_accounts. Solo la puede usar el servidor (service_role).
create or replace function public.expired_demo_accounts(p_limit int default 200) returns setof uuid
language sql security definer set search_path = public, auth stable as $$
  select id from auth.users
  where is_anonymous and created_at < now() - interval '48 hours'
  order by created_at
  limit p_limit;
$$;

-- Borra el perfil (en cascada: bebé, anuncios, fotos, favoritos, alertas, conversaciones, mensajes,
-- reservas, reseñas y notificaciones; el cuestionario se conserva sin autora) y el usuario de auth.
-- Vuelve a comprobar que son invitadas caducadas: nunca borra a una persona real.
create or replace function public.purge_demo_accounts(p_ids uuid[]) returns integer
language plpgsql security definer set search_path = public, auth as $$
declare
  ids uuid[];
  n integer;
begin
  select array_agg(id) into ids from auth.users
  where id = any(p_ids) and is_anonymous and created_at < now() - interval '48 hours';
  if ids is null then return 0; end if;

  delete from public.profiles where id = any(ids);
  delete from auth.users where id = any(ids);
  get diagnostics n = row_count;
  return n;
end $$;

revoke execute on function public.expired_demo_accounts(int) from public, anon, authenticated;
revoke execute on function public.purge_demo_accounts(uuid[]) from public, anon, authenticated;
grant execute on function public.expired_demo_accounts(int) to service_role;
grant execute on function public.purge_demo_accounts(uuid[]) to service_role;

-- Tarea diaria (04:00 UTC). La URL del proyecto y la clave de la tarea se guardan en el Vault
-- de Supabase (ver README), nunca en el repositorio.
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule('nido-cleanup-demo', '0 4 * * *', $job$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'nido_project_url') || '/functions/v1/cleanup-demo',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cleanup-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'nido_cleanup_secret')),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
$job$);
