import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validarLogin, validarRegistro, validarPaciente, validarTurno, validarCobro, validarEstudio } from '../src/lib/validaciones.js'
import { rutaDeArchivo, formatearTamanio } from '../src/lib/archivos.js'

const HOY = '2026-09-24'

test('registro: datos correctos no dan errores', () => {
  const errores = validarRegistro({
    nombre: 'Ana Gómez', email: 'ana@mail.com', password: 'Huellita#2026', confirmar: 'Huellita#2026',
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
  const errores = validarPaciente({ nombre: '', especie: '', fechaNacimiento: '', emailDuenio: '' }, HOY)
  assert.deepEqual(Object.keys(errores).sort(), ['emailDuenio', 'especie', 'nombre'])
})

test('paciente: la fecha de nacimiento no puede ser futura ni de hace más de 40 años', () => {
  const base = { nombre: 'Toby', especie: 'Perro', emailDuenio: 'a@b.com' }
  assert.equal(validarPaciente({ ...base, fechaNacimiento: '2099-01-01' }, HOY).fechaNacimiento, 'La fecha de nacimiento no puede ser futura.')
  assert.ok(validarPaciente({ ...base, fechaNacimiento: '1970-05-01' }, HOY).fechaNacimiento)
  assert.ok(validarPaciente({ ...base, fechaNacimiento: '2024-13-45' }, HOY).fechaNacimiento)
  assert.ok(validarPaciente({ ...base, fechaNacimiento: '2023-02-30' }, HOY).fechaNacimiento)
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
  const base = { nombre: 'Ana Gómez', email: 'ana@mail.com', password: 'Huellita#2026', confirmar: 'Huellita#2026' }
  assert.deepEqual(validarRegistro({ ...base, telefono: '' }), {})
  assert.deepEqual(validarRegistro({ ...base, telefono: '+54 11 2345-6789' }), {})
  assert.ok(validarRegistro({ ...base, telefono: 'abc' }).telefono)
  assert.ok(validarRegistro({ ...base, telefono: '123' }).telefono)
})

test('registro: el nombre tiene que tener letras', () => {
  const base = { email: 'ana@mail.com', password: 'Huellita#2026', confirmar: 'Huellita#2026' }
  assert.ok(validarRegistro({ ...base, nombre: '1234' }).nombre)
  assert.ok(validarRegistro({ ...base, nombre: '   ' }).nombre)
})

test('paciente: la fecha de nacimiento es opcional, y hoy mismo es válida', () => {
  const base = { nombre: 'Toby', especie: 'Perro', emailDuenio: 'a@b.com' }
  assert.deepEqual(validarPaciente({ ...base, fechaNacimiento: '' }, HOY), {})
  assert.deepEqual(validarPaciente({ ...base, fechaNacimiento: HOY }, HOY), {})
  assert.deepEqual(validarPaciente({ ...base, fechaNacimiento: '2021-05-10' }, HOY), {})
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

const ESTUDIO = { mascotaId: '1', titulo: 'Análisis de sangre', fecha: '2026-09-20', comentarios: '' }

test('estudio: datos completos y sin archivo (es opcional) no dan errores', () => {
  assert.deepEqual(validarEstudio(ESTUDIO, HOY), {})
})

test('estudio: pide paciente, título y fecha, y la fecha no puede ser futura', () => {
  assert.deepEqual(Object.keys(validarEstudio({ mascotaId: '', titulo: '', fecha: '' }, HOY)).sort(), ['fecha', 'mascotaId', 'titulo'])
  assert.ok(validarEstudio({ ...ESTUDIO, fecha: '2026-12-31' }, HOY).fecha)
})

test('estudio: acepta PDF e imágenes de hasta 10 MB', () => {
  assert.deepEqual(validarEstudio({ ...ESTUDIO, archivo: { tipo: 'application/pdf', tamanio: 500000 } }, HOY), {})
  assert.deepEqual(validarEstudio({ ...ESTUDIO, archivo: { tipo: 'image/jpeg', tamanio: 10 * 1024 * 1024 } }, HOY), {})
})

test('estudio: rechaza otros tipos, archivos muy pesados o vacíos', () => {
  assert.ok(validarEstudio({ ...ESTUDIO, archivo: { tipo: 'application/zip', tamanio: 100 } }, HOY).archivo)
  assert.ok(validarEstudio({ ...ESTUDIO, archivo: { tipo: 'application/pdf', tamanio: 11 * 1024 * 1024 } }, HOY).archivo)
  assert.ok(validarEstudio({ ...ESTUDIO, archivo: { tipo: 'application/pdf', tamanio: 0 } }, HOY).archivo)
})

test('archivos: la ruta empieza con la mascota y no usa el nombre original', () => {
  assert.equal(rutaDeArchivo(12, 'application/pdf', 'abc-123'), '12/abc-123.pdf')
  assert.equal(rutaDeArchivo(3, 'image/jpeg', 'x'), '3/x.jpg')
})

test('archivos: muestra el tamaño de forma legible', () => {
  assert.equal(formatearTamanio(512), '512 B')
  assert.equal(formatearTamanio(2048), '2 KB')
  assert.equal(formatearTamanio(2411724), '2,3 MB')
})
