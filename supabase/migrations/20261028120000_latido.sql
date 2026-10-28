-- =====================================================================
-- MICAN · Latido (mantener activo el proyecto gratuito de Supabase)
-- Supabase pausa los proyectos gratis que pasan 7 días sin "suficiente actividad".
-- Una lectura chiquita no alcanzó, así que el latido ESCRIBE en la base:
-- actualiza la fecha de la única fila de esta tabla.
--
-- Lo llaman, dos veces por día:
--   · GitHub Actions (.github/workflows/mantener-supabase-activo.yml)
--   · cron-job.org, a través de GET /api/v1/salud (el chequeo de salud del sitio)
--
-- Es seguro aunque cualquiera lo llame: solo cambia una fecha, no lee ni expone datos.
-- =====================================================================

create table public.latido (
  id integer primary key default 1 check (id = 1), -- una sola fila, siempre
  ultimo timestamptz not null default now(),
  veces bigint not null default 0
);

insert into public.latido (id) values (1);

-- Nadie lee ni escribe la tabla directo: solo a través de la función
alter table public.latido enable row level security;
revoke all on public.latido from anon, authenticated;

create function public.registrar_latido()
returns timestamptz
language sql
security definer
set search_path = ''
as $$
  update public.latido set ultimo = now(), veces = veces + 1 where id = 1
  returning ultimo;
$$;

revoke execute on function public.registrar_latido() from public;
grant execute on function public.registrar_latido() to anon, authenticated;
