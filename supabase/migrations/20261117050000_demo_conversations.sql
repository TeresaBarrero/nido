-- Nido · conversaciones de ejemplo en la demo
-- La cuenta de invitada empieza con chats como compradora y como vendedora.

-- Respuestas automáticas: no responder mientras se crean los chats de ejemplo,
-- y las compradoras de ejemplo también contestan cuando la vendedora es real.
create or replace function public.demo_seller_reply() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  c public.conversations;
  l public.listings;
  buyer_msgs int;
  reply text;
begin
  if current_setting('nido.seeding', true) = 'on' then return new; end if;
  select * into c from public.conversations where id = new.conversation_id;

  -- Una compradora de ejemplo contesta a una vendedora real.
  if new.sender_id = c.seller_id and not public.is_real_user(c.buyer_id) then
    insert into public.messages (conversation_id, sender_id, body, created_at)
    values (c.id, c.buyer_id,
            case when new.kind = 'meeting_proposal' then '¡Perfecto! Allí nos vemos.'
                 else '¡Genial, muchas gracias! Te digo algo en un rato.' end,
            now() + interval '1 second');
    return new;
  end if;

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

-- Crea los chats de ejemplo de una cuenta de demo.
create or replace function public.seed_demo_conversations(me uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  c uuid;
  mp text;
  my_bath bigint;
  my_lot bigint;
  marta constant uuid := '00000000-0000-4000-8000-000000000011';
  carlos constant uuid := '00000000-0000-4000-8000-000000000012';
  javier constant uuid := '00000000-0000-4000-8000-000000000014';
  carmen constant uuid := '00000000-0000-4000-8000-000000000022';
  inigo constant uuid := '00000000-0000-4000-8000-000000000023';
begin
  if exists (select 1 from public.conversations where buyer_id = me or seller_id = me) then return; end if;
  perform set_config('nido.seeding', 'on', true);

  -- 1 · Bañera de Marta: propuesta de quedada lista para aceptar y pagar
  select meeting_point into mp from public.listings where id = 1;
  insert into public.conversations (listing_id, buyer_id, seller_id, created_at)
    values (1, me, marta, now() - interval '50 minutes') returning id into c;
  insert into public.messages (conversation_id, sender_id, kind, body, payload, created_at) values
    (c, me, 'text', '¡Hola! ¿Sigue disponible? Me vendría genial para mi bebé de 5 meses.', null, now() - interval '50 minutes'),
    (c, marta, 'text', format('¡Hola! Sí, está como nueva. Vivo al lado de %s, ¿te viene bien quedar allí?', mp), null, now() - interval '46 minutes'),
    (c, marta, 'meeting_proposal', '', jsonb_build_object('place', mp, 'at', public.next_saturday_morning()), now() - interval '45 minutes');

  -- 2 · Minicuna de Carlos: negociando el precio
  insert into public.conversations (listing_id, buyer_id, seller_id, created_at)
    values (2, me, carlos, now() - interval '1 day 3 hours') returning id into c;
  insert into public.messages (conversation_id, sender_id, body, created_at) values
    (c, me, 'Hola, ¿el colchón de la minicuna es nuevo?', now() - interval '1 day 3 hours'),
    (c, carlos, 'Sí, lo compramos nuevo hace dos meses y lleva funda lavable.', now() - interval '1 day 2 hours'),
    (c, me, '¡Genial! ¿Hay algo de margen en el precio?', now() - interval '1 day 1 hour'),
    (c, carlos, 'Te la puedo dejar en 80 € si vienes esta semana.', now() - interval '1 day');

  -- 3 · Trona de Javier: pregunta resuelta
  insert into public.conversations (listing_id, buyer_id, seller_id, created_at)
    values (4, me, javier, now() - interval '3 days') returning id into c;
  insert into public.messages (conversation_id, sender_id, body, created_at) values
    (c, me, '¿Incluye el baby set?', now() - interval '3 days'),
    (c, javier, 'Sí, el baby set y el cojín. Todo lavado y sin roces.', now() - interval '3 days' + interval '20 minutes'),
    (c, me, '¡Perfecto, gracias! Me lo pienso y te digo.', now() - interval '3 days' + interval '35 minutes');

  -- 4 · Tu bañera: Carmen está interesada
  select id into my_bath from public.listings where seller_id = me and status = 'live' order by created_at limit 1;
  if my_bath is not null then
    insert into public.conversations (listing_id, buyer_id, seller_id, created_at)
      values (my_bath, carmen, me, now() - interval '25 minutes') returning id into c;
    insert into public.messages (conversation_id, sender_id, body, created_at) values
      (c, carmen, '¡Hola Laura! ¿Sigue disponible la bañera?', now() - interval '25 minutes'),
      (c, carmen, 'Vivo cerca de la plaza, podría pasarme el sábado por la mañana.', now() - interval '24 minutes');
  end if;

  -- 5 · Tu lote de ropa: reservado por Íñigo
  select id into my_lot from public.listings where seller_id = me and status = 'reserved' order by created_at limit 1;
  if my_lot is not null then
    insert into public.conversations (listing_id, buyer_id, seller_id, created_at)
      values (my_lot, inigo, me, now() - interval '4 days') returning id into c;
    insert into public.messages (conversation_id, sender_id, kind, body, payload, created_at) values
      (c, inigo, 'text', 'Hola, ¿el lote tiene bodies de manga larga?', null, now() - interval '4 days'),
      (c, me, 'text', 'Sí, más o menos la mitad son de manga larga.', null, now() - interval '4 days' + interval '30 minutes'),
      (c, me, 'meeting_proposal', '', jsonb_build_object('place', 'Plaza de Chamberí', 'at', public.next_saturday_morning()), now() - interval '4 days' + interval '31 minutes'),
      (c, inigo, 'text', '¡Reservado! Nos vemos el sábado.', null, now() - interval '3 days');
  end if;

  perform set_config('nido.seeding', 'off', true);
end $$;

revoke execute on function public.seed_demo_conversations(uuid) from public, anon, authenticated;

-- setup_demo crea también los chats de ejemplo (al final, cuando ya existen tus anuncios).
create or replace function public.setup_demo() returns void
language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  new_id bigint;
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
      (me, 'message', 'Nuevo mensaje de Carmen',
       'Vivo cerca de la plaza, podría pasarme el sábado por la mañana.', '/mensajes', false, now() - interval '24 minutes'),
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

  if not exists (select 1 from public.listings where seller_id = me) then
    insert into public.listings (seller_id, title, description, section, subcategory, spec_value, stages, condition,
                                 usage, includes, hygiene, price, new_price, meeting_point, lat, lng, status, is_demo_copy, created_at)
    values (me, 'Bañera plegable con hamaca', 'Bañera plegable con su hamaca. Muy cómoda para los primeros meses.',
            'Baño y cambio', 'Bañeras', 'Plegable', array['0-3','3-6','6-12'], 'Como nuevo',
            'Usada 6 meses', 'Hamaca de baño', array['Lavada y desinfectada','Casa sin humo'], 25, 45,
            'Plaza de Chamberí', 40.4340, -3.7040, 'live', true, now() - interval '2 days')
    returning id into new_id;
    insert into public.listing_photos (listing_id, path, position) values (new_id, 'seed/banera.jpg', 0);

    insert into public.listings (seller_id, title, section, subcategory, spec_value, stages, condition, usage,
                                 price, lot_count, meeting_point, lat, lng, status, is_demo_copy, created_at)
    values (me, 'Lote 18 prendas niña 0-3 meses', 'Ropa y calzado', 'Bodies y pijamas', '56', array['0-3'],
            'Como nuevo', 'Lote', 28, 18, 'Plaza de Chamberí', 40.4340, -3.7040, 'reserved', true, now() - interval '5 days')
    returning id into new_id;
    insert into public.listing_photos (listing_id, path, position) values (new_id, 'seed/lote-ropa.jpg', 0);

    insert into public.listings (seller_id, title, section, subcategory, stages, condition, usage,
                                 price, meeting_point, lat, lng, status, is_demo_copy, created_at)
    values
      (me, 'Capazo Joolz Day+', 'Paseo y viaje', 'Capazos', array['0-3','3-6'], 'Buen estado', 'Usado 6 meses',
       120, 'Plaza de Chamberí', 40.4340, -3.7040, 'sold', true, now() - interval '1 month'),
      (me, 'Cojín de lactancia', 'Dormir', 'Sacos y ropa de cuna', array['0-3'], 'Buen estado', 'Usado 4 meses',
       15, 'Plaza de Chamberí', 40.4340, -3.7040, 'sold', true, now() - interval '6 weeks');
  end if;

  if not exists (select 1 from public.reviews where target_id = me) then
    insert into public.reviews (author_id, target_id, stars, text, created_at) values
      ('00000000-0000-4000-8000-000000000022', me, 5,
       'La cuna estaba impecable y Laura fue puntualísima. Repetiría.', now() - interval '14 days'),
      ('00000000-0000-4000-8000-000000000023', me, 5,
       'Todo tal cual en las fotos. Muy fácil quedar en la plaza.', now() - interval '1 month');
  end if;

  perform public.seed_demo_conversations(me);
end $$;
