import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mensajeDeError } from '../src/lib/supabase/mensajes.js'

test('traduce los errores conocidos de Supabase', () => {
  assert.match(mensajeDeError({ code: 'invalid_credentials', message: 'Invalid login credentials' }), /contraseña no son correctos/)
  assert.match(mensajeDeError({ code: '23505', message: 'duplicate key' }), /horario se acaba de ocupar/)
})

test('detecta errores de conexión', () => {
  assert.match(mensajeDeError(new TypeError('Failed to fetch')), /conexión a internet/)
  assert.match(mensajeDeError({ name: 'AuthRetryableFetchError', message: '' }), /conexión a internet/)
})

test('muestra tal cual los mensajes de nuestras funciones SQL (ya están en castellano)', () => {
  const error = { code: 'P0001', message: 'Los turnos se pueden cancelar hasta 24 horas antes.' }
  assert.equal(mensajeDeError(error), error.message)
})

test('nunca muestra un error técnico en inglés', () => {
  assert.match(mensajeDeError({ code: 'XX000', message: 'internal server error' }), /error inesperado/)
})
