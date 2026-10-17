-- =====================================================================
-- MICAN · Vacunas con calendario y "vacunas a vencer"
--
-- Cada fila de "vacunas" es una DOSIS APLICADA: qué vacuna, cuándo se dio y
-- cuándo toca la próxima (si corresponde). La "línea" agrupa las dosis de una
-- misma vacuna (ej: todas las de rabia), así la próxima pendiente es la de la
-- última dosis de cada línea.
--
-- Cuando una próxima dosis se acerca, la veterinaria le avisa al dueño/a por su
-- cuenta (email, WhatsApp…) y lo marca con "avisado_en": así sale de su lista
-- de pendientes.
-- =====================================================================

alter table public.vacunas rename column fecha to fecha_aplicacion;
alter table public.vacunas drop column aplicada;

alter table public.vacunas
  add column tipo text,              -- id del calendario (ej: 'rabia_anual') o null si es "otra"
  add column linea text,             -- agrupa dosis de la misma vacuna (ej: 'rabia')
  add column proxima_dosis date,     -- cuándo toca la siguiente (null = no se repite)
  add column notas text,
  add column avisado_en timestamptz, -- cuándo la veterinaria marcó que ya le avisó al dueño/a
  add column creado_en timestamptz not null default now();

-- Las filas que ya existían (si hay) quedan agrupadas por su nombre
update public.vacunas set linea = lower(trim(vacuna)) where linea is null;

alter table public.vacunas
  alter column linea set not null,
  add constraint vacunas_nombre_check check (length(trim(vacuna)) between 2 and 80),
  add constraint vacunas_notas_check check (notas is null or length(notas) <= 500),
  add constraint vacunas_proxima_check check (proxima_dosis is null or proxima_dosis > fecha_aplicacion);

create index vacunas_por_linea_idx on public.vacunas (mascota_id, linea, fecha_aplicacion desc);

-- Permisos: no cambian. Por el RLS que ya existe, solo la veterinaria puede
-- cargar, modificar (incluido marcar "avisado") o borrar vacunas; el dueño/a solo las ve.
