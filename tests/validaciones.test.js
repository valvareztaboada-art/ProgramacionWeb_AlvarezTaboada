import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validarRegistro, validarPaciente, validarTurno } from '../src/lib/validaciones.js'

const HOY = '2026-09-24'

test('registro: datos correctos no dan errores', () => {
  const errores = validarRegistro({
    nombre: 'Ana Gómez', email: 'ana@mail.com', password: '12345678', confirmar: '12345678',
  })
  assert.deepEqual(errores, {})
})

test('registro: detecta email inválido, contraseña corta y contraseñas distintas', () => {
  const errores = validarRegistro({ nombre: 'Ana', email: 'ana@', password: '123', confirmar: '456' })
  assert.ok(errores.email)
  assert.ok(errores.password)
  assert.ok(errores.confirmar)
})

test('paciente: pide nombre, especie y email del dueño/a', () => {
  const errores = validarPaciente({ nombre: '', especie: '', edad: '', emailDuenio: '' })
  assert.deepEqual(Object.keys(errores).sort(), ['emailDuenio', 'especie', 'nombre'])
})

test('paciente: la edad tiene que estar entre 0 y 40', () => {
  const errores = validarPaciente({ nombre: 'Toby', especie: 'Perro', edad: '50', emailDuenio: 'a@b.com' })
  assert.ok(errores.edad)
})

test('turno: completo y en fecha futura no da errores', () => {
  const errores = validarTurno({ mascotaId: '1', especialidad: 'Consulta', fecha: '2026-09-28', hora: '10:00' }, HOY)
  assert.deepEqual(errores, {})
})

test('turno: no permite días pasados', () => {
  const errores = validarTurno({ mascotaId: '1', especialidad: 'Consulta', fecha: '2026-09-20', hora: '10:00' }, HOY)
  assert.ok(errores.fecha)
})

test('turno: si eligió día, pide horario', () => {
  const errores = validarTurno({ mascotaId: '1', especialidad: 'Consulta', fecha: '2026-09-28', hora: '' }, HOY)
  assert.deepEqual(Object.keys(errores), ['hora'])
})
