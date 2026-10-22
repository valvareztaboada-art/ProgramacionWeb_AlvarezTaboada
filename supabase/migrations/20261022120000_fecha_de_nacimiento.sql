-- =====================================================================
-- MICAN · Fecha de nacimiento de las mascotas
-- En lugar de guardar la edad (que queda vieja al año siguiente), se guarda la
-- fecha de nacimiento y la edad se CALCULA cada vez que se muestra.
--
-- La columna "edad" queda para los pacientes cargados antes de este cambio:
-- se sigue mostrando (como dato aproximado) hasta que la veterinaria cargue la fecha.
-- Al cargar la fecha, la app pone "edad" en null.
-- =====================================================================

alter table public.mascotas
  add column fecha_nacimiento date;

-- No puede ser futura ni absurdamente vieja (ningún paciente tiene más de 40 años).
-- current_date se evalúa al guardar: un nacimiento cargado hoy sigue siendo válido mañana.
alter table public.mascotas
  add constraint mascotas_fecha_nacimiento_check
  check (fecha_nacimiento between date '1985-01-01' and current_date);

comment on column public.mascotas.edad is
  'Edad en años cargada antes de existir fecha_nacimiento. Solo para pacientes viejos.';
