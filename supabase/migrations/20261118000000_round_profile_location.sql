-- Privacidad: los perfiles son públicos (se leen desde los anuncios), así que nunca
-- guardamos la posición exacta. Redondea a 3 decimales (unos 100 m) lo que ya hay
-- y lo que se guarde a partir de ahora.
update public.profiles
  set lat = round(lat::numeric, 3), lng = round(lng::numeric, 3)
  where lat is not null or lng is not null;

create or replace function public.round_profile_location()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.lat is not null then new.lat := round(new.lat::numeric, 3); end if;
  if new.lng is not null then new.lng := round(new.lng::numeric, 3); end if;
  return new;
end;
$$;

drop trigger if exists round_profile_location on public.profiles;
create trigger round_profile_location
  before insert or update of lat, lng on public.profiles
  for each row execute function public.round_profile_location();
