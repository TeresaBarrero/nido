-- Nido · modo prueba: respuestas del cuestionario de testers y página privada /resultados

create table if not exists public.admins (
  profile_id uuid primary key references public.profiles(id) on delete cascade
);
alter table public.admins enable row level security;
-- Cada persona solo puede comprobar si ella misma es administradora.
drop policy if exists "admins: ver la propia fila" on public.admins;
create policy "admins: ver la propia fila" on public.admins
  for select to authenticated using (profile_id = auth.uid());

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid default auth.uid() references public.profiles(id) on delete set null,
  ease smallint not null check (ease between 1 and 5),
  trust smallint not null check (trust between 1 and 5),
  comment text check (comment is null or char_length(comment) <= 2000),
  tasks_done text[] not null default '{}',
  is_demo boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.feedback enable row level security;

drop policy if exists "feedback: enviar la propia" on public.feedback;
create policy "feedback: enviar la propia" on public.feedback
  for insert to authenticated with check (profile_id = auth.uid());

drop policy if exists "feedback: solo administradoras leen" on public.feedback;
create policy "feedback: solo administradoras leen" on public.feedback
  for select to authenticated using (exists (select 1 from public.admins a where a.profile_id = auth.uid()));

-- Para darte acceso a /resultados (después de entrar una vez con tu correo):
-- insert into public.admins (profile_id) select id from auth.users where email = 'TU_CORREO';
