import { test } from 'node:test'
import assert from 'node:assert/strict'
import { armarServicio, filtrarServicios } from '../src/lib/servicios.js'
import { validarPerfil, validarNuevaContrasena, validarRecuperar } from '../src/lib/validaciones.js'
import { esquemaPerfil, esquemaCambiosCobro } from '../src/lib/esquemas.js'

const consulta = { id: 'consulta', nombre: 'Consulta', icono: 'estetoscopio', descripcion: 'Control general' }

test('catálogo: une la especialidad de la base con su detalle', () => {
  const s = armarServicio(consulta)
  assert.equal(s.nombre, 'Consulta')
  assert.ok(s.incluye.length > 0)
  assert.ok(s.especies.includes('Aves'))
})

test('catálogo: un servicio nuevo en la base (sin detalle) igual se muestra', () => {
  const s = armarServicio({ id: 'cirugia', nombre: 'Cirugía', icono: 'tijera', descripcion: 'Programada' })
  assert.equal(s.resumen, 'Programada')
  assert.deepEqual(s.incluye, [])
})

test('catálogo: filtro por especie', () => {
  const servicios = ['consulta', 'vacunacion', 'peluqueria'].map((id) => armarServicio({ ...consulta, id }))
  assert.deepEqual(filtrarServicios(servicios, 'Aves').map((s) => s.id), ['consulta'])
  assert.equal(filtrarServicios(servicios, undefined).length, 3)
})

test('mi perfil: nombre obligatorio y teléfono opcional pero válido', () => {
  assert.deepEqual(validarPerfil({ nombre: 'Valentina Ríos', telefono: '' }), {})
  assert.ok(validarPerfil({ nombre: '1', telefono: '' }).nombre)
  assert.ok(validarPerfil({ nombre: 'Vale', telefono: 'abc' }).telefono)
})

test('contraseña nueva: exige una fuerte y que coincidan', () => {
  assert.ok(validarNuevaContrasena({ password: '123', confirmar: '123' }).password)
  assert.ok(validarNuevaContrasena({ password: 'Perro-Feliz-2026', confirmar: 'otra' }).confirmar)
  assert.deepEqual(validarNuevaContrasena({ password: 'Perro-Feliz-2026', confirmar: 'Perro-Feliz-2026' }), {})
  assert.ok(validarRecuperar({ email: 'no-es-email' }).email)
})

test('esquema de perfil (servidor): limpia, valida y no deja cambiar email ni rol', () => {
  assert.deepEqual(esquemaPerfil.parse({ nombre: ' <b>Vale</b> Ríos ', telefono: '' }), { nombre: 'Vale Ríos', telefono: null })
  assert.equal(esquemaPerfil.safeParse({ nombre: 'Vale', telefono: '', rol: 'veterinaria' }).success, false)
  assert.equal(esquemaPerfil.safeParse({ nombre: 'Vale', telefono: '', email: 'otro@mail.com' }).success, false)
})

test('esquema de cobro (PATCH): solo se puede anular', () => {
  assert.deepEqual(esquemaCambiosCobro.parse({ estado: 'anulado' }), { estado: 'anulado' })
  assert.equal(esquemaCambiosCobro.safeParse({ estado: 'pagado' }).success, false)
  assert.equal(esquemaCambiosCobro.safeParse({ estado: 'anulado', monto: 1 }).success, false)
})
