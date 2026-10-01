-- =====================================================================
-- MICAN · Datos de ejemplo
-- Se cargan con:  npx supabase db push --include-seed
--
-- Las mascotas están a nombre de emails de prueba. Para ver una mascota
-- desde la interfaz del cliente, cargá una (como veterinaria) con el email
-- de tu cuenta de cliente, o cambiá acá un email por el tuyo.
--
-- Las fechas son relativas a hoy, así los turnos siempre quedan a futuro.
-- =====================================================================

-- Próximo lunes (si hoy es lunes, el de la semana que viene)
create temporary table fechas as
select (current_date + (8 - extract(isodow from current_date))::int) as lunes;

insert into public.mascotas (nombre, especie, raza, edad, email_duenio) values
  ('Luna',  'Perro', 'Golden Retriever', 4, 'ana.gomez@mail.com'),
  ('Michi', 'Gato',  'Siamés',           2, 'ana.gomez@mail.com'),
  ('Rocco', 'Perro', 'Bulldog Francés',  6, 'juan.perez@mail.com'),
  ('Kiwi',  'Ave',   'Cotorra',          1, 'sofia.diaz@mail.com');

insert into public.turnos (mascota_id, especialidad_id, fecha, hora, motivo, estado)
select m.id, t.especialidad_id, f.lunes + t.dias, t.hora::time, t.motivo, t.estado
from fechas f
cross join (values
  ('Luna',  'consulta',   0,  '10:00', 'Control anual',    'confirmado'),
  ('Rocco', 'consulta',   0,  '11:30', 'Dermatitis',       'pendiente'),
  ('Michi', 'vacunacion', 2,  '16:00', 'Triple felina',    'confirmado'),
  ('Kiwi',  'consulta',   4,  '09:00', 'Revisión de pico', 'pendiente'),
  ('Luna',  'peluqueria', -7, '15:00', 'Baño y corte',     'atendido'),
  ('Rocco', 'consulta',   -5, '10:30', 'Control',          'ausente')
) as t (mascota, especialidad_id, dias, hora, motivo, estado)
join public.mascotas m on m.nombre = t.mascota;

insert into public.vacunas (mascota_id, vacuna, fecha, aplicada)
select m.id, v.vacuna, f.lunes + v.dias, v.aplicada
from fechas f
cross join (values
  ('Luna',  'Antirrábica',   15,   false),
  ('Michi', 'Triple felina', 2,    false),
  ('Luna',  'Séxtuple',      -200, true),
  ('Rocco', 'Antirrábica',   30,   false)
) as v (mascota, vacuna, dias, aplicada)
join public.mascotas m on m.nombre = v.mascota;

insert into public.estudios (mascota_id, tipo, fecha)
select m.id, e.tipo, f.lunes + e.dias
from fechas f
cross join (values
  ('Luna',  'Análisis de sangre',    -40),
  ('Rocco', 'Radiografía de cadera', -25),
  ('Michi', 'Ecografía abdominal',   -18)
) as e (mascota, tipo, dias)
join public.mascotas m on m.nombre = e.mascota;

insert into public.pagos (mascota_id, concepto, monto, estado)
select m.id, p.concepto, p.monto, p.estado
from (values
  ('Luna',  'Consulta Luna',     25000, 'pendiente'),
  ('Rocco', 'Radiografía Rocco', 40000, 'pagado'),
  ('Michi', 'Ecografía Michi',   35000, 'pendiente')
) as p (mascota, concepto, monto, estado)
join public.mascotas m on m.nombre = p.mascota;

drop table fechas;
