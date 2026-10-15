import { test } from 'node:test'
import assert from 'node:assert/strict'
import { evaluarContrasena, errorDeContrasena } from '../src/lib/contrasena.js'

test('contraseña: pide largo, minúscula, mayúscula, número y símbolo', () => {
  assert.match(errorDeContrasena('Ab1!'), /8 caracteres/)
  assert.match(errorDeContrasena('ABCDEFG1!'), /minúscula/)
  assert.match(errorDeContrasena('abcdefg1!'), /mayúscula/)
  assert.match(errorDeContrasena('Abcdefgh!'), /número/)
  assert.match(errorDeContrasena('Abcdefgh1'), /símbolo/)
  assert.equal(errorDeContrasena('Huellita#2026'), null)
})

test('contraseña: acepta letras con acento y ñ', () => {
  assert.equal(errorDeContrasena('Ñandú#2026'), null)
})

test('contraseña: rechaza las demasiado comunes aunque cumplan las reglas', () => {
  assert.match(errorDeContrasena('Password#1'), /demasiado común/)
  assert.match(errorDeContrasena('Mican2026!'), /demasiado común/)
})

test('contraseña: no puede superar 72 caracteres (límite de bcrypt)', () => {
  assert.match(errorDeContrasena('Aa1!' + 'x'.repeat(70)), /hasta 72/)
})

test('indicador: vacía, débil, media y fuerte', () => {
  assert.equal(evaluarContrasena('').nivel, 'vacia')
  assert.equal(evaluarContrasena('abc').nivel, 'debil')
  assert.equal(evaluarContrasena('Huella#26').nivel, 'media')
  assert.equal(evaluarContrasena('Huellita#Feliz26').nivel, 'fuerte')
})

test('indicador: cuenta cuántos requisitos se cumplen', () => {
  const r = evaluarContrasena('abc1')
  assert.equal(r.total, 5)
  assert.equal(r.cumplidos, 2) // minúscula y número
  assert.deepEqual(r.requisitos.filter((x) => x.cumple).map((x) => x.id), ['minuscula', 'numero'])
})
