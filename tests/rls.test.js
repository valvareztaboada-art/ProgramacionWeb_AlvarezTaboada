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
  const vacuna = await como(ANA, `insert into vacunas (mascota_id, vacuna, fecha) values (${await idDe('Luna')}, 'X', current_date)`)
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
  assert.match(repetido.filas[0].resultado, /ya estaba acreditado/)
  const viejo = await registrar(SERVIDOR, id, '102', 'pending', 25000)
  assert.match(viejo.filas[0].resultado, /ya estaba acreditado/)
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
