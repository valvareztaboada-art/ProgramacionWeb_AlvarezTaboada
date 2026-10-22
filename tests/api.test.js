// Tests de la capa de API: esquemas de validación (Zod), sanitización y manejo de errores.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  esquemaNuevoPaciente, esquemaCambiosPaciente, esquemaFiltroPacientes, esquemaId, sanitizar, aFilaDeMascota,
} from '../src/lib/esquemas.js'
import { conManejoDeErrores, validarCon, ErrorDeApi, sinPermiso } from '../src/lib/api/errores.js'

const PACIENTE = { nombre: 'Ramona', especie: 'Perro', raza: 'Mestiza', edad: 4, emailDuenio: 'valentina@mail.com' }

// ---------- Sanitización ----------

test('sanitizar saca etiquetas HTML, caracteres de control y espacios de más', () => {
  assert.equal(sanitizar('  <script>alert(1)</script>Ramona  '), 'alert(1)Ramona')
  assert.equal(sanitizar('<b>Luna</b>\u0000 de\n\n la casa'), 'Luna de la casa')
})

// ---------- Esquemas ----------

test('esquema de paciente nuevo: acepta datos válidos y los normaliza', () => {
  const r = esquemaNuevoPaciente.parse({ ...PACIENTE, nombre: ' <i>Ramona</i> ', emailDuenio: ' Valentina@Mail.COM ', raza: '' })
  assert.equal(r.nombre, 'Ramona')
  assert.equal(r.emailDuenio, 'valentina@mail.com')
  assert.equal(r.raza, null)
})

test('esquema de paciente nuevo: rechaza campos vacíos, de más o con tipo incorrecto', () => {
  const r = esquemaNuevoPaciente.safeParse({ nombre: '<b></b>', especie: 'Dragón', edad: 4.5, emailDuenio: 'no-es-email' })
  assert.equal(r.success, false)
  const campos = r.error.issues.map((i) => i.path[0])
  for (const campo of ['nombre', 'especie', 'edad', 'emailDuenio']) assert.ok(campos.includes(campo), campo)

  // Un campo que no existe (ej: intentar mandar el id o el rol) se rechaza
  assert.equal(esquemaNuevoPaciente.safeParse({ ...PACIENTE, rol: 'veterinaria' }).success, false)
  // La edad tiene que ser número, no texto
  assert.equal(esquemaNuevoPaciente.safeParse({ ...PACIENTE, edad: '4' }).success, false)
})

test('esquema de cambios (PATCH): cada campo es opcional, pero tiene que haber al menos uno', () => {
  assert.deepEqual(esquemaCambiosPaciente.parse({ edad: 5 }), { edad: 5 })
  assert.equal(esquemaCambiosPaciente.safeParse({}).success, false)
  assert.equal(esquemaCambiosPaciente.safeParse({ edad: 99 }).success, false)
})

test('filtros (query params) e id de la URL', () => {
  assert.deepEqual(esquemaFiltroPacientes.parse({ buscar: ' luna ', especie: 'Perro' }), { buscar: 'luna', especie: 'Perro' })
  assert.equal(esquemaFiltroPacientes.safeParse({ especie: 'Pez' }).success, false)
  assert.equal(esquemaId.parse('12'), 12)
  assert.equal(esquemaId.safeParse('12; drop table mascotas').success, false)
})

test('aFilaDeMascota pasa a nombres de columna y solo incluye lo que vino', () => {
  assert.deepEqual(aFilaDeMascota({ emailDuenio: 'a@b.com', edad: null }), { email_duenio: 'a@b.com', edad: null })
})

// ---------- Manejo de errores centralizado ----------

const pedido = (metodo = 'GET') => new Request('http://localhost/api/v1/prueba', { method: metodo })

test('validarCon devuelve los datos limpios o lanza un 400 con el error de cada campo', () => {
  assert.equal(validarCon(esquemaNuevoPaciente, PACIENTE).nombre, 'Ramona')
  assert.throws(() => validarCon(esquemaNuevoPaciente, { ...PACIENTE, nombre: '' }), (e) =>
    e instanceof ErrorDeApi && e.status === 400 && e.detalles.nombre === 'Ingresá el nombre de la mascota.')
})

test('los errores esperables responden su código y mensaje (y los detalles del 400)', async () => {
  const conDetalles = conManejoDeErrores(() => validarCon(esquemaNuevoPaciente, {}))
  const r400 = await conDetalles(pedido('POST'))
  assert.equal(r400.status, 400)
  assert.ok((await r400.json()).detalles.especie)

  const r403 = await conManejoDeErrores(() => { throw sinPermiso() })(pedido())
  assert.equal(r403.status, 403)
  assert.deepEqual(await r403.json(), { error: 'No tenés permiso para hacer esto.' })
})

test('un error inesperado responde 500 genérico, sin stack trace ni detalles internos', async (t) => {
  t.mock.method(console, 'error', () => {}) // el log interno sí lo registra (acá lo silenciamos)
  const handler = conManejoDeErrores(() => { throw new Error('relation "mascotas" does not exist at db.js:42') })
  const r = await handler(pedido())
  assert.equal(r.status, 500)
  const cuerpo = JSON.stringify(await r.json())
  assert.doesNotMatch(cuerpo, /mascotas|db\.js|stack|at /)
  assert.equal(console.error.mock.callCount(), 1)
})
