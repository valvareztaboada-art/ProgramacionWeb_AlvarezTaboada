-- =====================================================================
-- MICAN · Cobrar al marcar un turno como atendido
-- Cuando la veterinaria marca "Atendido", puede crear el cobro en el momento.
-- El cobro queda vinculado al turno: así sabemos qué turnos atendidos
-- todavía no se cobraron ("Atendidos sin cobrar").
-- =====================================================================

-- 1. De qué turno sale cada cobro (opcional: hay cobros sueltos, ej. un alimento)
--    Si se borra el turno, el cobro queda igual (es un registro de plata)
alter table public.pagos
  add column turno_id bigint references public.turnos (id) on delete set null;

create index pagos_turno_id_idx on public.pagos (turno_id) where turno_id is not null;

-- 2. Turnos atendidos que NO se cobran (ej: un control de cortesía).
--    Así no quedan para siempre en la lista de "sin cobrar".
alter table public.turnos
  add column sin_cargo boolean not null default false;

-- 3. El cobro de un turno tiene que ser de la MISMA mascota del turno
create function public.revisar_turno_del_cobro()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.turno_id is not null and not exists (
    select 1 from public.turnos where id = new.turno_id and mascota_id = new.mascota_id
  ) then
    raise exception 'Ese turno no es de la misma mascota del cobro.';
  end if;
  return new;
end;
$$;

create trigger pagos_turno_de_la_misma_mascota
  before insert or update of turno_id, mascota_id on public.pagos
  for each row execute function public.revisar_turno_del_cobro();

-- 4. Los turnos atendidos ANTES de este cambio ya se cobraron (o no) a mano, desde Cobros.
--    Los sacamos de "Atendidos sin cobrar" para que la lista arranque vacía y solo
--    muestre lo que se atienda de ahora en adelante.
update public.turnos set sin_cargo = true where estado = 'atendido';
