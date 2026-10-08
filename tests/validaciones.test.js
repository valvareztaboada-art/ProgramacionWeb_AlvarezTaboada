import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validarLogin, validarRegistro, validarPaciente, validarTurno, validarCobro } from '../src/lib/validaciones.js'

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

test('login: pide email válido y contraseña', () => {
  assert.deepEqual(Object.keys(validarLogin({ email: '', password: '' })).sort(), ['email', 'password'])
  assert.ok(validarLogin({ email: 'ana@mail', password: 'x' }).email)
  assert.deepEqual(validarLogin({ email: 'ana@mail.com', password: 'x' }), {})
})

test('el email se acepta aunque tenga espacios al principio o al final', () => {
  assert.deepEqual(validarLogin({ email: '  ana@mail.com ', password: 'x' }), {})
})

test('registro: el teléfono es opcional, pero si se completa tiene que ser válido', () => {
  const base = { nombre: 'Ana Gómez', email: 'ana@mail.com', password: '12345678', confirmar: '12345678' }
  assert.deepEqual(validarRegistro({ ...base, telefono: '' }), {})
  assert.deepEqual(validarRegistro({ ...base, telefono: '+54 11 2345-6789' }), {})
  assert.ok(validarRegistro({ ...base, telefono: 'abc' }).telefono)
  assert.ok(validarRegistro({ ...base, telefono: '123' }).telefono)
})

test('registro: el nombre tiene que tener letras', () => {
  const base = { email: 'ana@mail.com', password: '12345678', confirmar: '12345678' }
  assert.ok(validarRegistro({ ...base, nombre: '1234' }).nombre)
  assert.ok(validarRegistro({ ...base, nombre: '   ' }).nombre)
})

test('paciente: la edad tiene que ser un número entero', () => {
  const base = { nombre: 'Toby', especie: 'Perro', emailDuenio: 'a@b.com' }
  assert.ok(validarPaciente({ ...base, edad: '2.5' }).edad)
  assert.deepEqual(validarPaciente({ ...base, edad: '' }), {})
  assert.deepEqual(validarPaciente({ ...base, edad: '0' }), {})
})

test('turno: el comentario no puede ser demasiado largo', () => {
  const datos = { mascotaId: '1', especialidad: 'consulta', fecha: '2026-09-28', hora: '10:00', comentario: 'x'.repeat(301) }
  assert.deepEqual(Object.keys(validarTurno(datos, HOY)), ['comentario'])
})

test('cobro: pide paciente, concepto y un monto válido', () => {
  assert.deepEqual(Object.keys(validarCobro({ mascotaId: '', concepto: '', monto: '' })).sort(), ['concepto', 'mascotaId', 'monto'])
  assert.deepEqual(validarCobro({ mascotaId: '1', concepto: 'Consulta', monto: '15000' }), {})
  assert.deepEqual(validarCobro({ mascotaId: '1', concepto: 'Consulta', monto: '15000,50' }), {})
  assert.ok(validarCobro({ mascotaId: '1', concepto: 'Consulta', monto: '0' }).monto)
  assert.ok(validarCobro({ mascotaId: '1', concepto: 'Consulta', monto: '-5' }).monto)
  assert.ok(validarCobro({ mascotaId: '1', concepto: 'Consulta', monto: '10.555' }).monto)
  assert.ok(validarCobro({ mascotaId: '1', concepto: 'Consulta', monto: 'mil' }).monto)
})
