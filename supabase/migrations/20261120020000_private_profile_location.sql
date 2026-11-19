-- La ubicación aproximada de un perfil (lat, lng) solo la puede leer su dueña.
-- El resto de personas, con o sin cuenta, solo ven el barrio. Las distancias de los anuncios
-- se calculan con la ubicación del anuncio, que ya se desplaza al publicarlo.
--
-- OJO: al añadir columnas nuevas a profiles hay que darles permiso de lectura aquí abajo.

revoke select on public.profiles from anon, authenticated;
grant select (id, name, neighborhood, verified, rating_avg, rating_count, tone, created_at, onboarded, is_demo)
  on public.profiles to anon, authenticated;

-- Tu propia ubicación, para calcular las distancias desde tu casa.
create or replace function public.my_location()
returns table (lat double precision, lng double precision)
language sql security definer set search_path = public stable as $$
  select p.lat::double precision, p.lng::double precision from public.profiles p where p.id = auth.uid();
$$;

revoke all on function public.my_location() from public, anon;
grant execute on function public.my_location() to authenticated;
