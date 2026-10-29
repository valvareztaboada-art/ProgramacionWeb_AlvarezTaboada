// Tests de la base de datos: ejecutan la migración y el seed en un Postgres en memoria (PGlite)
// e intentan hacer cosas como cada tipo de usuario, para comprobar que el RLS y las
// funciones dejan hacer SOLO lo que corresponde.

import { test, before } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'

const VET = '00000000-0000-0000-0000-000000000001'
const ANA = '00000000-0000-0000-0000-000000000002'
const JUAN_SIN_CONFIRMAR = '00000000-0000-0000-0000-000000000003'
// El "servidor" (Route Handlers con la clave secreta): rol service_role de Supabase
const SERVIDOR = 'servidor'

let db
let proximoLunes
let domingo

before(async () => {
  db = new PGlite()

  // Imitación mínima de lo que Supabase ya trae: esquema auth, auth.uid() y roles
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
    create schema auth;
    create table auth.users (
      id uuid primary key,
      email text,
      email_confirmed_at timestamptz,
      raw_user_meta_data jsonb default '{}'::jsonb
    );
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public, auth to anon, authenticated, service_role;
    grant execute on function auth.uid() to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
    alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
    alter default privileges in schema public grant execute on functions to anon, authenticated;

    -- Imitación mínima de Supabase Storage (carpetas = buckets, archivos = objects)
    create schema storage;
    create table storage.buckets (
      id text primary key, name text not null, public boolean default false,
      file_size_limit bigint, allowed_mime_types text[]
    );
    create table storage.objects (
      id uuid primary key default gen_random_uuid(),
      bucket_id text references storage.buckets (id), name text, owner uuid
    );
    alter table storage.objects enable row level security;
    grant usage on schema storage to anon, authenticated, service_role;
    grant all on storage.objects to anon, authenticated, service_role;
    grant select on storage.buckets to anon, authenticated, service_role;
  `)

  const migraciones = readdirSync('supabase/migrations').filter((f) => f.endsWith('.sql')).sort()
  for (const archivo of migraciones) {
    await db.exec(readFileSync(`supabase/migrations/${archivo}`, 'utf8'))
  }
  await db.exec(readFileSync('supabase/seed.sql', 'utf8'))

  await db.exec(`
    insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data) values
      ('${VET}', 'Laura@Mican.vet', now(), '{"nombre":"Laura Ríos"}'),
      ('${ANA}', 'ana.gomez@mail.com', now(), '{"nombre":"Ana Gómez","rol":"veterinaria"}'),
      ('${JUAN_SIN_CONFIRMAR}', 'juan.perez@mail.com', null, '{"nombre":"Juan Pérez"}');
    update public.perfiles set rol = 'veterinaria' where id = '${VET}';
  `)

  const fechas = (await db.query(`
    select (current_date + (8 - extract(isodow from current_date))::int + 7)::text as lunes,
           (current_date + (8 - extract(isodow from current_date))::int + 6)::text as domingo
  `)).rows[0]
  proximoLunes = fechas.lunes
  domingo = fechas.domingo
})

// Ejecuta una consulta "logueado" como un usuario (o como anónimo si es null)
async function como(usuario, sql, params = []) {
  await db.exec('reset role')
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [usuario && usuario !== SERVIDOR ? usuario : ''])
  await db.exec(usuario === SERVIDOR ? 'set role service_role' : usuario ? 'set role authenticated' : 'set role anon')
  try {
    return { filas: (await db.query(sql, params)).rows }
  } catch (e) {
    return { error: e.message }
  } finally {
    await db.exec('reset role')
  }
}

const idDe = async (nombre) => (await db.query('select id from mascotas where nombre = $1', [nombre])).rows[0].id

function pedirTurno(usuario, mascotaId, fecha, hora, estado = 'pendiente') {
  return como(usuario,
    `insert into turnos (mascota_id, especialidad_id, fecha, hora, estado, creado_por)
     values ($1, 'consulta', $2::date, $3::time, $4, '${usuario}') returning id`,
    [mascotaId, fecha, hora, estado])
}

// ---------- Perfiles y roles ----------

test('todos se registran como cliente, aunque manden "rol" en los datos', async () => {
  const r = await como(ANA, `select rol from perfiles where id = '${ANA}'`)
  assert.equal(r.filas[0].rol, 'cliente')
})

test('el cliente NO puede cambiarse el rol', async () => {
  const r = await como(ANA, `update perfiles set rol = 'veterinaria' where id = '${ANA}'`)
  assert.match(r.error, /permission denied/)
})

test('el cliente puede editar su nombre y solo ve su perfil', async () => {
  const r = await como(ANA, `update perfiles set nombre = 'Ana G.' where id = '${ANA}' returning nombre`)
  assert.equal(r.filas[0].nombre, 'Ana G.')
  const todos = await como(ANA, 'select count(*)::int as n from perfiles')
  assert.equal(todos.filas[0].n, 1)
})

// ---------- Lectura ----------

test('el cliente ve solo sus mascotas y sus turnos', async () => {
  const mascotas = await como(ANA, 'select nombre from mascotas order by nombre')
  assert.deepEqual(mascotas.filas.map((f) => f.nombre), ['Luna', 'Michi'])
  const ajenos = await como(ANA, `select count(*)::int as n from turnos t join mascotas m on m.id = t.mascota_id
                                  where m.nombre not in ('Luna', 'Michi')`)
  assert.equal(ajenos.filas[0].n, 0)
})

test('con el email sin confirmar o sin sesión no se ve ninguna mascota', async () => {
  assert.equal((await como(JUAN_SIN_CONFIRMAR, 'select count(*)::int as n from mascotas')).filas[0].n, 0)
  assert.equal((await como(null, 'select count(*)::int as n from mascotas')).filas[0].n, 0)
})

test('la veterinaria ve todas las mascotas', async () => {
  assert.equal((await como(VET, 'select count(*)::int as n from mascotas')).filas[0].n, 4)
})

// ---------- Escritura del cliente ----------

test('el cliente NO puede cargar mascotas ni vacunas', async () => {
  const mascota = await como(ANA, `insert into mascotas (nombre, especie, email_duenio) values ('X', 'Perro', 'ana.gomez@mail.com')`)
  assert.match(mascota.error, /row-level security/)
  const vacuna = await como(ANA, `insert into vacunas (mascota_id, vacuna, linea, fecha_aplicacion) values (${await idDe('Luna')}, 'Rabia', 'rabia', current_date)`)
  assert.match(vacuna.error, /row-level security/)
})

test('el cliente NO puede modificar turnos directamente', async () => {
  const r = await como(ANA, `update turnos set estado = 'atendido' returning id`)
  assert.equal(r.filas.length, 0)
})

test('el cliente pide turno para su mascota y no se puede repetir el horario', async () => {
  const ok = await pedirTurno(ANA, await idDe('Luna'), proximoLunes, '10:00')
  assert.equal(ok.filas.length, 1)
  const repetido = await pedirTurno(ANA, await idDe('Michi'), proximoLunes, '10:00')
  assert.match(repetido.error, /turnos_horario_unico/)
})

test('el cliente NO puede pedir turno para una mascota ajena, ya confirmado, en domingo, fuera de horario o en el pasado', async () => {
  const luna = await idDe('Luna')
  const casos = [
    await pedirTurno(ANA, await idDe('Rocco'), proximoLunes, '11:00'),
    await pedirTurno(ANA, luna, proximoLunes, '11:00', 'confirmado'),
    await pedirTurno(ANA, luna, domingo, '11:00'),
    await pedirTurno(ANA, luna, proximoLunes, '19:00'),
    await pedirTurno(ANA, luna, '2020-01-06', '10:00'),
  ]
  for (const r of casos) assert.match(r.error, /row-level security/)
})

test('horarios_ocupados funciona con sesión y no sin sesión', async () => {
  assert.ok((await como(ANA, 'select count(*)::int as n from horarios_ocupados()')).filas[0].n > 0)
  assert.match((await como(null, 'select * from horarios_ocupados()')).error, /permission denied/)
})

// ---------- Cancelar (regla de las 24 h) ----------

test('el cliente cancela con más de 24 h', async () => {
  const { filas } = await pedirTurno(ANA, await idDe('Luna'), proximoLunes, '15:00')
  const r = await como(ANA, `select cancelar_turno(${filas[0].id})`)
  assert.equal(r.error, undefined)
  const { rows } = await db.query(`select estado from turnos where id = ${filas[0].id}`)
  assert.equal(rows[0].estado, 'cancelado')
})

test('con menos de 24 h cancela solo la veterinaria, y una sola vez', async () => {
  const { rows: [enDosHoras] } = await db.query(`
    select (now() at time zone 'America/Argentina/Buenos_Aires' + interval '2 hours')::date::text as f,
           to_char(date_trunc('hour', now() at time zone 'America/Argentina/Buenos_Aires' + interval '2 hours'), 'HH24:MI') as h`)
  const { filas } = await como(VET,
    `insert into turnos (mascota_id, especialidad_id, fecha, hora) values ($1, 'consulta', $2::date, $3::time) returning id`,
    [await idDe('Michi'), enDosHoras.f, enDosHoras.h])
  const id = filas[0].id

  assert.match((await como(ANA, `select cancelar_turno(${id})`)).error, /24 horas/)
  assert.match((await como(JUAN_SIN_CONFIRMAR, `select cancelar_turno(${id})`)).error, /permiso/)
  assert.equal((await como(VET, `select cancelar_turno(${id})`)).error, undefined)
  assert.match((await como(VET, `select cancelar_turno(${id})`)).error, /ya no se puede cancelar/)
})

// ---------- Veterinaria ----------

test('la veterinaria marca un turno como ausente y carga pacientes', async () => {
  const ausente = await como(VET, `update turnos set estado = 'ausente' where motivo = 'Dermatitis' returning estado`)
  assert.equal(ausente.filas[0].estado, 'ausente')
  const nueva = await como(VET, `insert into mascotas (nombre, especie, edad, email_duenio) values ('Toby', 'Perro', 3, 'marta@mail.com') returning id`)
  assert.equal(nueva.filas.length, 1)
})

// ---------- Mercado Pago ----------

const idDePago = async (concepto) => (await db.query('select id from pagos where concepto = $1', [concepto])).rows[0].id
const estadoDePago = async (id) => (await db.query('select estado, mp_payment_id from pagos where id = $1', [id])).rows[0]

function registrar(usuario, pagoId, paymentId, estado, monto) {
  return como(usuario, 'select registrar_pago_mp($1, $2, $3, $4) as resultado', [pagoId, paymentId, estado, monto])
}

test('mercado pago: ni el cliente ni la veterinaria pueden marcar un pago como acreditado desde el navegador', async () => {
  const id = await idDePago('Consulta Luna')
  assert.match((await registrar(ANA, id, '111', 'approved', 25000)).error, /permission denied/)
  assert.match((await registrar(VET, id, '111', 'approved', 25000)).error, /permission denied/)
  const directo = await como(ANA, `update pagos set estado = 'pagado' where id = ${id} returning id`)
  assert.equal(directo.filas.length, 0)
  assert.equal((await estadoDePago(id)).estado, 'pendiente')
})

test('mercado pago: un pago rechazado deja el cobro pendiente (se puede volver a intentar)', async () => {
  const id = await idDePago('Consulta Luna')
  const r = await registrar(SERVIDOR, id, '100', 'rejected', 25000)
  assert.match(r.filas[0].resultado, /actualizado/)
  assert.equal((await estadoDePago(id)).estado, 'pendiente')
})

test('mercado pago: si el monto no coincide, NO se da por pagado', async () => {
  const id = await idDePago('Consulta Luna')
  const r = await registrar(SERVIDOR, id, '101', 'approved', 1)
  assert.match(r.filas[0].resultado, /rechazado: monto/)
  assert.equal((await estadoDePago(id)).estado, 'pendiente')
})

test('mercado pago: en proceso → aprobado, y los avisos repetidos o viejos no lo cambian', async () => {
  const id = await idDePago('Consulta Luna')
  await registrar(SERVIDOR, id, '102', 'in_process', 25000)
  assert.equal((await estadoDePago(id)).estado, 'en_proceso')

  const aprobado = await registrar(SERVIDOR, id, '102', 'approved', 25000)
  assert.match(aprobado.filas[0].resultado, /en_proceso → pagado/)
  assert.deepEqual(await estadoDePago(id), { estado: 'pagado', mp_payment_id: '102' })

  const repetido = await registrar(SERVIDOR, id, '102', 'approved', 25000)
  assert.match(repetido.filas[0].resultado, /notificación ya procesada/)
  const viejo = await registrar(SERVIDOR, id, '102', 'pending', 25000)
  assert.match(viejo.filas[0].resultado, /ya estaba acreditado/)

  // El cliente pagó OTRA vez el mismo cobro (otro pago de Mercado Pago): queda marcado como duplicado
  const duplicado = await registrar(SERVIDOR, id, '104', 'approved', 25000)
  assert.match(duplicado.filas[0].resultado, /PAGO DUPLICADO/)
  assert.deepEqual(await estadoDePago(id), { estado: 'pagado', mp_payment_id: '102' })
  assert.equal((await estadoDePago(id)).estado, 'pagado')
})

test('mercado pago: un reembolso cambia un pago acreditado a reembolsado', async () => {
  const id = await idDePago('Consulta Luna')
  await registrar(SERVIDOR, id, '102', 'refunded', 25000)
  assert.equal((await estadoDePago(id)).estado, 'reembolsado')
})

test('mercado pago: un pago que no existe se ignora sin romper', async () => {
  const r = await registrar(SERVIDOR, 999999, '103', 'approved', 100)
  assert.match(r.filas[0].resultado, /no existe/)
})

test('mercado pago: cada notificación queda registrada y solo la ve la veterinaria', async () => {
  const vet = await como(VET, 'select count(*)::int as n from pagos_eventos')
  assert.ok(vet.filas[0].n >= 6)
  const cliente = await como(ANA, 'select count(*)::int as n from pagos_eventos')
  assert.equal(cliente.filas[0].n, 0)
})

test('mercado pago: el cliente guarda la preferencia solo de SUS cobros pendientes', async () => {
  const michi = await idDePago('Ecografía Michi')
  assert.equal((await como(ANA, `select guardar_preferencia_mp(${michi}, 'pref-1')`)).error, undefined)

  const rocco = await idDePago('Radiografía Rocco') // de otro dueño (y ya pagado)
  assert.match((await como(ANA, `select guardar_preferencia_mp(${rocco}, 'pref-2')`)).error, /No se puede pagar/)
  const luna = await idDePago('Consulta Luna') // ya reembolsado
  assert.match((await como(ANA, `select guardar_preferencia_mp(${luna}, 'pref-3')`)).error, /No se puede pagar/)
  assert.match((await como(null, `select guardar_preferencia_mp(${michi}, 'pref-4')`)).error, /permission denied/)
})

// ---------- Pagos en efectivo ----------

test('efectivo: el cliente NO puede marcar un cobro como pagado en efectivo', async () => {
  const id = await idDePago('Ecografía Michi')
  assert.match((await como(ANA, `select registrar_pago_efectivo(${id})`)).error, /Solo la veterinaria/)
  assert.equal((await estadoDePago(id)).estado, 'pendiente')
})

test('efectivo: la veterinaria lo marca y queda pagado, con medio "efectivo" y fecha', async () => {
  const id = await idDePago('Ecografía Michi')
  assert.equal((await como(VET, `select registrar_pago_efectivo(${id})`)).error, undefined)
  const { rows: [pago] } = await db.query('select estado, metodo, pagado_en from pagos where id = $1', [id])
  assert.equal(pago.estado, 'pagado')
  assert.equal(pago.metodo, 'efectivo')
  assert.ok(pago.pagado_en)
  // El dueño/a lo ve pagado
  const visto = await como(ANA, `select estado from pagos where id = ${id}`)
  assert.equal(visto.filas[0].estado, 'pagado')
})

test('efectivo: no se puede marcar dos veces, y un pago por Mercado Pago posterior queda como DUPLICADO', async () => {
  const id = await idDePago('Ecografía Michi')
  assert.match((await como(VET, `select registrar_pago_efectivo(${id})`)).error, /ya no está pendiente/)
  const mp = await registrar(SERVIDOR, id, '200', 'approved', 35000)
  assert.match(mp.filas[0].resultado, /PAGO DUPLICADO/)
})

// ---------- Estudios y archivos (Storage) ----------

test('estudios: el bucket "estudios" es privado y limita tamaño y tipo de archivo', async () => {
  const { rows: [bucket] } = await db.query(`select public, file_size_limit, allowed_mime_types from storage.buckets where id = 'estudios'`)
  assert.equal(bucket.public, false)
  assert.equal(Number(bucket.file_size_limit), 10 * 1024 * 1024)
  assert.ok(bucket.allowed_mime_types.includes('application/pdf'))
})

test('estudios: solo la veterinaria sube archivos', async () => {
  const luna = await idDe('Luna')
  const rocco = await idDe('Rocco')
  const subir = (usuario, ruta) => como(usuario, `insert into storage.objects (bucket_id, name) values ('estudios', '${ruta}') returning name`)
  assert.equal((await subir(VET, `${luna}/analisis.pdf`)).filas.length, 1)
  assert.equal((await subir(VET, `${rocco}/radiografia.png`)).filas.length, 1)
  assert.match((await subir(ANA, `${luna}/trucho.pdf`)).error, /row-level security/)
})

test('estudios: el dueño/a solo puede abrir los archivos de SUS mascotas', async () => {
  const luna = await idDe('Luna')
  const visibles = await como(ANA, `select name from storage.objects where bucket_id = 'estudios'`)
  assert.deepEqual(visibles.filas.map((f) => f.name), [`${luna}/analisis.pdf`])
  assert.equal((await como(null, `select count(*)::int as n from storage.objects`)).filas[0].n, 0)
  assert.equal((await como(VET, `select count(*)::int as n from storage.objects`)).filas[0].n, 2)
})

test('estudios: el cliente no puede borrar ni editar estudios; la veterinaria sí edita', async () => {
  const borrar = await como(ANA, `delete from storage.objects returning name`)
  assert.equal(borrar.filas.length, 0)
  const editar = await como(ANA, `update estudios set comentarios = 'hackeado' returning id`)
  assert.equal(editar.filas.length, 0)
  const vet = await como(VET, `update estudios set comentarios = 'Control en 6 meses' where titulo = 'Análisis de sangre' returning comentarios`)
  assert.equal(vet.filas[0].comentarios, 'Control en 6 meses')
})

test('estudios: el título tiene que tener entre 3 y 100 caracteres', async () => {
  const r = await como(VET, `insert into estudios (mascota_id, titulo, fecha) values (${await idDe('Luna')}, 'ab', current_date)`)
  assert.match(r.error, /estudios_titulo_check/)
})

// ---------- Vacunas ----------

test('vacunas: la veterinaria registra una dosis con su próxima fecha; la próxima tiene que ser posterior', async () => {
  const ok = await como(VET, `insert into vacunas (mascota_id, vacuna, tipo, linea, fecha_aplicacion, proxima_dosis)
    values (${await idDe('Rocco')}, 'Polivalente · refuerzo anual', 'polivalente_anual', 'polivalente', current_date, current_date + 365) returning id`)
  assert.equal(ok.filas.length, 1)
  const mal = await como(VET, `insert into vacunas (mascota_id, vacuna, linea, fecha_aplicacion, proxima_dosis)
    values (${await idDe('Rocco')}, 'Rabia', 'rabia', current_date, current_date - 1)`)
  assert.match(mal.error, /vacunas_proxima_check/)
})

test('vacunas: la veterinaria marca que ya le avisó al dueño/a (y lo puede desmarcar)', async () => {
  const marcar = await como(VET, `update vacunas set avisado_en = now() where mascota_id = ${await idDe('Michi')} returning avisado_en`)
  assert.ok(marcar.filas.length > 0 && marcar.filas.every((f) => f.avisado_en))
  const desmarcar = await como(VET, `update vacunas set avisado_en = null where mascota_id = ${await idDe('Michi')} returning avisado_en`)
  assert.ok(desmarcar.filas.every((f) => f.avisado_en === null))
})

test('vacunas: el cliente ve las de sus mascotas pero no puede marcarlas ni modificarlas', async () => {
  const ve = await como(ANA, 'select count(*)::int as n from vacunas')
  assert.ok(ve.filas[0].n > 0)
  const marcar = await como(ANA, 'update vacunas set avisado_en = now() returning id')
  assert.equal(marcar.filas.length, 0)
})

// ---------- Editar y eliminar pacientes ----------

test('pacientes: la veterinaria corrige los datos; el cliente no puede modificar ni borrar', async () => {
  const vet = await como(VET, `update mascotas set raza = 'Golden', edad = 5 where nombre = 'Luna' returning raza, edad`)
  assert.deepEqual(vet.filas[0], { raza: 'Golden', edad: 5 })
  const editar = await como(ANA, `update mascotas set nombre = 'Hackeada' where nombre = 'Luna' returning id`)
  assert.equal(editar.filas.length, 0)
  const borrar = await como(ANA, `delete from mascotas where nombre = 'Michi' returning id`)
  assert.equal(borrar.filas.length, 0)
})

test('pacientes: el email del dueño/a se guarda en minúsculas (si no, se rechaza)', async () => {
  const r = await como(VET, `update mascotas set email_duenio = 'Ana.Gomez@Mail.com' where nombre = 'Luna'`)
  assert.match(r.error, /mascotas_email_duenio_check/)
})

test('pacientes: NO se puede eliminar una mascota con pagos registrados', async () => {
  const r = await como(VET, `delete from mascotas where nombre = 'Rocco' returning id`)
  assert.match(r.error, /No se puede eliminar a Rocco porque tiene pagos registrados/)
  const sigue = await como(VET, `select count(*)::int as n from mascotas where nombre = 'Rocco'`)
  assert.equal(sigue.filas[0].n, 1)
})

test('pacientes: al eliminar una mascota sin pagos se borra todo lo suyo (cobros pendientes incluidos)', async () => {
  const id = (await como(VET, `insert into mascotas (nombre, especie, email_duenio) values ('Error de carga', 'Gato', 'nadie@mail.com') returning id`)).filas[0].id
  await como(VET, `insert into turnos (mascota_id, especialidad_id, fecha, hora) values (${id}, 'consulta', '${proximoLunes}', '15:00')`)
  await como(VET, `insert into vacunas (mascota_id, vacuna, linea, fecha_aplicacion) values (${id}, 'Rabia', 'rabia', current_date)`)
  await como(VET, `insert into estudios (mascota_id, titulo, fecha) values (${id}, 'Análisis', current_date)`)
  await como(VET, `insert into pagos (mascota_id, concepto, monto) values (${id}, 'Consulta', 1000)`)

  const borrar = await como(VET, `delete from mascotas where id = ${id} returning id`)
  assert.equal(borrar.filas.length, 1)
  const quedan = await como(VET, `select
    (select count(*) from turnos where mascota_id = ${id}) + (select count(*) from vacunas where mascota_id = ${id}) +
    (select count(*) from estudios where mascota_id = ${id}) + (select count(*) from pagos where mascota_id = ${id}) as n`)
  assert.equal(Number(quedan.filas[0].n), 0)
})

// ---------- Fecha de nacimiento ----------

test('fecha de nacimiento: la base rechaza fechas futuras o de hace más de 40 años', async () => {
  const futura = await como(VET, `update mascotas set fecha_nacimiento = current_date + 1 where nombre = 'Luna'`)
  assert.match(futura.error, /mascotas_fecha_nacimiento_check/)
  const vieja = await como(VET, `update mascotas set fecha_nacimiento = '1970-01-01' where nombre = 'Luna'`)
  assert.match(vieja.error, /mascotas_fecha_nacimiento_check/)
  const hoy = await como(VET, `update mascotas set fecha_nacimiento = current_date where nombre = 'Kiwi' returning id`)
  assert.equal(hoy.filas.length, 1)
})

test('fecha de nacimiento: un paciente viejo pasa de "edad" fija a fecha de nacimiento', async () => {
  const r = await como(VET, `update mascotas set fecha_nacimiento = '2025-01-10', edad = null where nombre = 'Kiwi'
    returning fecha_nacimiento::text as fecha, edad`)
  assert.deepEqual(r.filas[0], { fecha: '2025-01-10', edad: null })
})

// ---------- Cobrar turnos atendidos ----------

test('cobro de un turno: tiene que ser de la misma mascota del turno', async () => {
  const luna = await idDe('Luna')
  const rocco = await idDe('Rocco')
  const turno = (await como(VET, `insert into turnos (mascota_id, especialidad_id, fecha, hora, estado)
    values (${luna}, 'consulta', current_date - 1, '17:30', 'atendido') returning id`)).filas[0].id

  const bien = await como(VET, `insert into pagos (mascota_id, concepto, monto, turno_id)
    values (${luna}, 'Consulta · Luna', 18000, ${turno}) returning turno_id`)
  assert.equal(Number(bien.filas[0].turno_id), Number(turno))

  const mal = await como(VET, `insert into pagos (mascota_id, concepto, monto, turno_id)
    values (${rocco}, 'Consulta · Rocco', 18000, ${turno})`)
  assert.match(mal.error, /no es de la misma mascota/)
})

test('cobro de un turno: el cliente no puede crear cobros; si se borra el turno, el cobro queda', async () => {
  const luna = await idDe('Luna')
  const cliente = await como(ANA, `insert into pagos (mascota_id, concepto, monto) values (${luna}, 'Trucho', 1)`)
  assert.ok(cliente.error)

  const turno = (await como(VET, `insert into turnos (mascota_id, especialidad_id, fecha, hora, estado)
    values (${luna}, 'peluqueria', current_date - 2, '17:00', 'atendido') returning id`)).filas[0].id
  const pago = (await como(VET, `insert into pagos (mascota_id, concepto, monto, turno_id)
    values (${luna}, 'Peluquería · Luna', 25000, ${turno}) returning id`)).filas[0].id
  await db.query(`delete from turnos where id = ${turno}`)
  const queda = await como(VET, `select turno_id from pagos where id = ${pago}`)
  assert.equal(queda.filas[0].turno_id, null)
})

test('turno "no se cobra": la veterinaria lo marca; el cliente no puede', async () => {
  const vet = await como(VET, `update turnos set sin_cargo = true where estado = 'atendido' returning sin_cargo`)
  assert.ok(vet.filas.length > 0 && vet.filas.every((f) => f.sin_cargo))
  const cliente = await como(ANA, `update turnos set sin_cargo = false returning id`)
  assert.equal(cliente.filas.length, 0)
})

// ---------- Latido (mantener activo Supabase) ----------

test('latido: cualquiera puede registrarlo, pero nadie lee ni modifica la tabla directo', async () => {
  const antes = Number((await db.query('select veces from latido')).rows[0].veces)
  const anonimo = await como(null, 'select public.registrar_latido() as ultimo')
  assert.ok(anonimo.filas[0].ultimo)
  assert.equal(Number((await db.query('select veces from latido')).rows[0].veces), antes + 1)

  const leer = await como(null, 'select * from latido')
  assert.match(leer.error, /permission denied/)
  const tocar = await como(ANA, `update latido set veces = 0`)
  assert.match(tocar.error, /permission denied/)
})

// ---------- Anular cobros ----------

test('anular cobro: solo la veterinaria, y solo si está pendiente', async () => {
  const luna = await idDe('Luna')
  const id = (await como(VET, `insert into pagos (mascota_id, concepto, monto) values (${luna}, 'Cargado por error', 999) returning id`)).filas[0].id

  const cliente = await como(ANA, `select public.anular_cobro(${id})`)
  assert.match(cliente.error, /Solo la veterinaria/)

  const vet = await como(VET, `select public.anular_cobro(${id})`)
  assert.equal(vet.error, undefined)
  const estado = await como(VET, `select estado from pagos where id = ${id}`)
  assert.equal(estado.filas[0].estado, 'anulado')

  const otraVez = await como(VET, `select public.anular_cobro(${id})`)
  assert.match(otraVez.error, /Solo se pueden anular cobros pendientes/)
})

test('anular cobro: si igual lo pagan por Mercado Pago, NO se acredita y queda para devolver', async () => {
  const luna = await idDe('Luna')
  const id = (await como(VET, `insert into pagos (mascota_id, concepto, monto) values (${luna}, 'Anulado y pagado', 1500) returning id`)).filas[0].id
  await como(VET, `select public.anular_cobro(${id})`)

  const r = await como(SERVIDOR, `select public.registrar_pago_mp(${id}, 'mp-anulado-1', 'approved', 1500) as resultado`)
  assert.match(r.filas[0].resultado, /PAGO DE UN COBRO ANULADO \(hay que devolverlo\)/)
  const estado = await como(VET, `select estado from pagos where id = ${id}`)
  assert.equal(estado.filas[0].estado, 'anulado')
})
