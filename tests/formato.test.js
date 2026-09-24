import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatearEdad } from '../src/lib/formato.js'

test('edad: usa singular para 1 año y plural para el resto', () => {
  assert.equal(formatearEdad(0), 'Menos de 1 año')
  assert.equal(formatearEdad(1), '1 año')
  assert.equal(formatearEdad(4), '4 años')
})
