-- =====================================================================
-- MICAN · Editar y eliminar pacientes
-- La veterinaria ya podía modificar y borrar mascotas (RLS del esquema inicial).
-- Al borrar una mascota se borran en cascada sus turnos, vacunas, estudios y cobros.
--
-- Regla nueva: NO se puede borrar una mascota que tenga pagos con movimiento de plata
-- (pagado, en proceso o reembolsado). Esos registros son el comprobante del pago y,
-- además, Mercado Pago puede seguir mandando avisos sobre ellos.
-- Los cobros todavía pendientes sí se borran con la mascota.
--
-- Se controla en la base (no solo en la pantalla): aunque alguien llame a la API
-- directamente, el borrado se rechaza.
-- =====================================================================

create function public.impedir_borrar_mascota_con_pagos()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.pagos
    where mascota_id = old.id and estado in ('pagado', 'en_proceso', 'reembolsado')
  ) then
    -- SQLSTATE P0001: la app muestra este mensaje tal cual
    raise exception 'No se puede eliminar a % porque tiene pagos registrados. Los pagos se guardan como comprobante.', old.nombre;
  end if;
  return old;
end;
$$;

create trigger mascotas_sin_pagos_al_borrar
  before delete on public.mascotas
  for each row execute function public.impedir_borrar_mascota_con_pagos();
