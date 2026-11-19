-- Eliminar una conversación «solo para mí».
-- No se borra nada: se guarda hasta cuándo la ha vaciado cada persona. La app oculta los
-- mensajes anteriores a esa fecha y, si llega uno nuevo, la conversación vuelve a aparecer.
-- No se puede si hay una compra pagada pendiente de entrega: el chat es la prueba de la quedada.

alter table public.conversations add column if not exists buyer_cleared_at timestamptz;
alter table public.conversations add column if not exists seller_cleared_at timestamptz;

create or replace function public.clear_conversation(p_conversation uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  c public.conversations;
begin
  if me is null then raise exception 'Necesitas una sesión'; end if;
  select * into c from public.conversations where id = p_conversation for update;
  if c.id is null or me not in (c.buyer_id, c.seller_id) then raise exception 'Esta conversación no es tuya'; end if;
  if exists (
    select 1 from public.reservations r
    where r.listing_id = c.listing_id and r.buyer_id = c.buyer_id and r.status = 'paid'
  ) then
    raise exception 'No puedes eliminar este chat hasta que se confirme la entrega';
  end if;

  if me = c.buyer_id then
    update public.conversations set buyer_cleared_at = now() where id = c.id;
  else
    update public.conversations set seller_cleared_at = now() where id = c.id;
  end if;
end $$;

revoke all on function public.clear_conversation(uuid) from public, anon;
grant execute on function public.clear_conversation(uuid) to authenticated;
