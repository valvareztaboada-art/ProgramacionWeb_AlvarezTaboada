import { test } from 'node:test'
import assert from 'node:assert/strict'
import { horariosDelDia } from '../src/lib/horarios.js'

test('los domingos no hay horarios', () => {
  assert.deepEqual(horariosDelDia('2026-09-27'), [])
})

test('de lunes a viernes se atiende de 9 a 18 h, cada 30 minutos', () => {
  const horarios = horariosDelDia('2026-09-28') // lunes
  assert.equal(horarios.length, 18)
  assert.equal(horarios[0].hora, '09:00')
  assert.equal(horarios.at(-1).hora, '17:30')
})

test('los sábados se atiende de 9 a 13 h', () => {
  const horarios = horariosDelDia('2026-10-03') // sábado
  assert.equal(horarios.length, 8)
  assert.equal(horarios.at(-1).hora, '12:30')
})

test('marca como ocupados solo los horarios tomados ese día', () => {
  const ocupados = [
    { fecha: '2026-09-28', hora: '10:00' },
    { fecha: '2026-09-29', hora: '11:00' }, // otro día: no tiene que afectar
  ]
  const horarios = horariosDelDia('2026-09-28', ocupados)
  const tomados = horarios.filter((h) => h.ocupado).map((h) => h.hora)
  assert.deepEqual(tomados, ['10:00'])
})
