-- Nido · la cuenta de la demo empieza con historial (como en el prototipo)
-- Anuncios propios (uno en venta, uno reservado, dos vendidos) y dos valoraciones,
-- para poder probar Pausar, Cambiar precio y ver el perfil completo.
-- Se marcan como copia de demo para que no aparezcan en Inicio ni en Buscar a otras personas.

alter table public.listings add column if not exists is_demo_copy boolean not null default false;

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
end $$;
