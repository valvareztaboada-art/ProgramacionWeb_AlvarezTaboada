import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatearEdad, calcularEdad, textoDeEdad, formatearFechaCorta } from '../src/lib/formato.js'

test('edad: usa singular para 1 año y plural para el resto', () => {
  assert.equal(formatearEdad(0), 'Menos de 1 año')
  assert.equal(formatearEdad(1), '1 año')
  assert.equal(formatearEdad(4), '4 años')
})

test('calcularEdad: cumple años recién el día del cumpleaños', () => {
  assert.deepEqual(calcularEdad('2022-03-14', '2026-03-13'), { anios: 3, meses: 47 })
  assert.deepEqual(calcularEdad('2022-03-14', '2026-03-14'), { anios: 4, meses: 48 })
  assert.deepEqual(calcularEdad('2022-03-14', '2026-10-22'), { anios: 4, meses: 55 })
})

test('calcularEdad: casos borde (fin de mes, 29 de febrero, nacido hoy)', () => {
  // Nació un 31: el 30 del mes siguiente todavía no cumplió el mes
  assert.equal(calcularEdad('2026-01-31', '2026-02-28').meses, 0)
  assert.equal(calcularEdad('2026-01-31', '2026-03-01').meses, 1)
  // Nacido el 29/2: en años no bisiestos cumple el 1/3
  assert.equal(calcularEdad('2024-02-29', '2025-02-28').anios, 0)
  assert.equal(calcularEdad('2024-02-29', '2025-03-01').anios, 1)
  assert.deepEqual(calcularEdad('2026-10-22', '2026-10-22'), { anios: 0, meses: 0 })
})

test('textoDeEdad: años, meses o "menos de 1 mes", y se actualiza sola con el tiempo', () => {
  const luna = { fechaNacimiento: '2022-03-14' }
  assert.equal(textoDeEdad(luna, '2026-10-22'), '4 años')
  assert.equal(textoDeEdad(luna, '2027-03-14'), '5 años')
  assert.equal(textoDeEdad({ fechaNacimiento: '2025-10-01' }, '2026-10-22'), '1 año')
  assert.equal(textoDeEdad({ fechaNacimiento: '2026-02-10' }, '2026-10-22'), '8 meses')
  assert.equal(textoDeEdad({ fechaNacimiento: '2026-09-15' }, '2026-10-22'), '1 mes')
  assert.equal(textoDeEdad({ fechaNacimiento: '2026-10-10' }, '2026-10-22'), 'Menos de 1 mes')
})

test('textoDeEdad: sin fecha usa la edad cargada antes; sin nada, vacío', () => {
  assert.equal(textoDeEdad({ fechaNacimiento: null, edad: 3 }, '2026-10-22'), '3 años')
  assert.equal(textoDeEdad({ fechaNacimiento: null, edad: null }, '2026-10-22'), '')
})

test('formatearFechaCorta', () => {
  assert.equal(formatearFechaCorta('2022-03-14'), '14/03/2022')
})
