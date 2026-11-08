import { test } from 'node:test'
import assert from 'node:assert/strict'
import { leerEnlaceDelHash } from '../src/lib/recuperacion.js'

test('enlace de recuperación válido: devuelve la sesión', () => {
  assert.deepEqual(leerEnlaceDelHash('#access_token=aaa&expires_in=3600&refresh_token=bbb&token_type=bearer&type=recovery'),
    { enlace: { accessToken: 'aaa', refreshToken: 'bbb' } })
})

test('enlace vencido o ya usado: lo avisa', () => {
  assert.deepEqual(leerEnlaceDelHash('#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid'), { vencido: true })
})

test('sin enlace, incompleto o de otro tipo: no hay nada que usar', () => {
  assert.equal(leerEnlaceDelHash(''), null)
  assert.equal(leerEnlaceDelHash(undefined), null)
  assert.equal(leerEnlaceDelHash('#access_token=aaa&type=recovery'), null) // falta el refresh_token
  assert.equal(leerEnlaceDelHash('#access_token=aaa&refresh_token=bbb&type=signup'), null)
})
