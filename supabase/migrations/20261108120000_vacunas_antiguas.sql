-- =====================================================================
-- MICAN · Vacunas antiguas (antecedentes)
-- Cuando llega un paciente nuevo que ya tiene vacunas (ej: las de la infancia), la
-- veterinaria las carga como ANTECEDENTE: quedan en el historial, pero no generan
-- "próxima dosis" ni avisos de vencimiento (si no, saldrían en rojo como atrasadas).
--
-- Los avisos salen de la última dosis de cada vacuna, y solo si tiene próxima fecha:
-- por eso alcanza con que una vacuna antigua no tenga próxima dosis. La base lo asegura.
-- =====================================================================

alter table public.vacunas
  add column antigua boolean not null default false;

alter table public.vacunas
  add constraint vacunas_antigua_sin_proxima_check
  check (not antigua or proxima_dosis is null);

comment on column public.vacunas.antigua is
  'Antecedente cargado después (ej: vacunas de la infancia de un paciente nuevo): sin próxima dosis ni avisos.';
