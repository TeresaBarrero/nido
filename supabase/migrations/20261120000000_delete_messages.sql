-- Eliminar mensajes propios («para todos»).
-- El mensaje no se borra de la tabla: se vacía su texto y se marca con deleted_at,
-- así la otra persona ve «Mensaje eliminado» en su sitio y la conversación conserva el orden.
-- Las propuestas de entrega no se pueden eliminar: son la base del pago protegido.

alter table public.messages add column if not exists deleted_at timestamptz;

create or replace function public.delete_message(p_message uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  m public.messages;
  c public.conversations;
  recipient uuid;
begin
  if me is null then raise exception 'Necesitas una sesión'; end if;
  select * into m from public.messages where id = p_message for update;
  if m.id is null or m.sender_id <> me then raise exception 'Solo puedes eliminar tus mensajes'; end if;
  if m.kind <> 'text' then raise exception 'Las propuestas de entrega no se pueden eliminar'; end if;
  if m.deleted_at is not null then return; end if;

  -- El aviso que recibió la otra persona tampoco debe seguir mostrando el texto.
  select * into c from public.conversations where id = m.conversation_id;
  recipient := case when m.sender_id = c.buyer_id then c.seller_id else c.buyer_id end;
  update public.notifications
     set body = 'Mensaje eliminado'
   where profile_id = recipient and kind = 'message'
     and link = '/chat/' || c.listing_id
     and body = left(m.body, 120)
     and created_at between m.created_at - interval '5 seconds' and m.created_at + interval '5 seconds';

  update public.messages set body = '', deleted_at = now() where id = m.id;
end $$;

revoke all on function public.delete_message(uuid) from public, anon;
grant execute on function public.delete_message(uuid) to authenticated;
