import { test } from 'node:test'
import assert from 'node:assert/strict'
import { esperaTrasFallos, formatearEspera } from '../src/lib/intentos.js'

test('rate limiting: los primeros intentos fallidos no bloquean', () => {
  assert.equal(esperaTrasFallos(0), 0)
  assert.equal(esperaTrasFallos(2), 0)
})

test('rate limiting: el bloqueo es progresivo (cada fallo duplica la espera)', () => {
  assert.deepEqual([3, 4, 5, 6].map(esperaTrasFallos), [15, 30, 60, 120])
})

test('rate limiting: la espera nunca supera los 5 minutos', () => {
  assert.equal(esperaTrasFallos(20), 300)
})

test('rate limiting: muestra la espera como minutos y segundos', () => {
  assert.equal(formatearEspera(15), '0:15')
  assert.equal(formatearEspera(75), '1:15')
})
