import { test } from 'node:test'
import assert from 'node:assert/strict'
import { puedeEliminarse, loQueSeBorra } from '../src/lib/pacientes.js'

test('se puede eliminar si no hay pagos o si solo hay cobros pendientes', () => {
  assert.equal(puedeEliminarse([]), true)
  assert.equal(puedeEliminarse(['pendiente', 'pendiente']), true)
})

test('NO se puede eliminar con pagos pagados, en proceso o reembolsados', () => {
  assert.equal(puedeEliminarse(['pendiente', 'pagado']), false)
  assert.equal(puedeEliminarse(['en_proceso']), false)
  assert.equal(puedeEliminarse(['reembolsado']), false)
})

test('describe lo que se borra, con singular y plural, y omite lo que no hay', () => {
  assert.deepEqual(
    loQueSeBorra({ turnos: 1, vacunas: 3, estudios: 2, pagos: ['pendiente'] }),
    ['1 turno', '3 vacunas registradas', '2 estudios (con sus archivos)', '1 cobro pendiente'],
  )
  assert.deepEqual(loQueSeBorra({ turnos: 0, vacunas: 0, estudios: 1, pagos: [] }), ['1 estudio (con su archivo)'])
  assert.deepEqual(loQueSeBorra({ turnos: 0, vacunas: 0, estudios: 0, pagos: [] }), [])
})
