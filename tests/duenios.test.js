import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizar, armarListaDeDuenios, filtrarDuenios, distancia, emailParecido } from '../src/lib/duenios.js'

const PERFILES = [
  { email: 'ana.gomez@mail.com', nombre: 'Ana Gómez' },
  { email: 'juan.perez@mail.com', nombre: 'Juan Pérez' },
]
const MASCOTAS = [
  { nombre: 'Luna', email_duenio: 'ana.gomez@mail.com' },
  { nombre: 'Michi', email_duenio: 'ana.gomez@mail.com' },
  { nombre: 'Kiwi', email_duenio: 'sofia.diaz@mail.com' }, // sin cuenta todavía
]
const DUENIOS = armarListaDeDuenios(PERFILES, MASCOTAS)

test('normalizar: sin mayúsculas ni acentos', () => {
  assert.equal(normalizar('  Gómez PÉREZ '), 'gomez perez')
})

test('lista: junta dueños con cuenta y sin cuenta, con sus mascotas', () => {
  assert.deepEqual(DUENIOS.map((d) => [d.email, d.registrado, d.mascotas.join(',')]), [
    ['ana.gomez@mail.com', true, 'Luna,Michi'],
    ['juan.perez@mail.com', true, ''],
    ['sofia.diaz@mail.com', false, 'Kiwi'],
  ])
})

test('filtrar: por nombre, aunque se escriba sin acento', () => {
  assert.deepEqual(filtrarDuenios(DUENIOS, 'gomez').map((d) => d.email), ['ana.gomez@mail.com'])
  assert.deepEqual(filtrarDuenios(DUENIOS, 'PER').map((d) => d.email), ['juan.perez@mail.com'])
})

test('filtrar: por email o por el nombre de una mascota', () => {
  assert.deepEqual(filtrarDuenios(DUENIOS, 'sofia').map((d) => d.email), ['sofia.diaz@mail.com'])
  assert.deepEqual(filtrarDuenios(DUENIOS, 'michi').map((d) => d.email), ['ana.gomez@mail.com'])
})

test('filtrar: primero los que empiezan con lo escrito', () => {
  // "an": Ana empieza con "an"; Juan solo lo contiene
  assert.deepEqual(filtrarDuenios(DUENIOS, 'an').map((d) => d.email), ['ana.gomez@mail.com', 'juan.perez@mail.com'])
})

test('filtrar: sin texto muestra todos; sin coincidencias, ninguno', () => {
  assert.equal(filtrarDuenios(DUENIOS, '').length, 3)
  assert.deepEqual(filtrarDuenios(DUENIOS, 'zzz'), [])
})

test('distancia entre textos', () => {
  assert.equal(distancia('gato', 'gato'), 0)
  assert.equal(distancia('gato', 'pato'), 1)
  assert.equal(distancia('ana@mail.com', 'ana@mial.com'), 2)
})

test('email parecido: detecta errores de tipeo', () => {
  assert.equal(emailParecido(DUENIOS, 'ana.gomez@mial.com')?.email, 'ana.gomez@mail.com')
  assert.equal(emailParecido(DUENIOS, 'ana.gomes@mail.com')?.email, 'ana.gomez@mail.com')
})

test('email parecido: no avisa si es exacto, muy distinto o todavía no es un email', () => {
  assert.equal(emailParecido(DUENIOS, 'ana.gomez@mail.com'), null)
  assert.equal(emailParecido(DUENIOS, 'marta.lopez@gmail.com'), null)
  assert.equal(emailParecido(DUENIOS, 'ana.gomez'), null)
})
