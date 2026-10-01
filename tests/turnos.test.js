import { test } from 'node:test'
import assert from 'node:assert/strict'
import { clientePuedeCancelar, separarTurnos, turnosDeLaSemana, yaPaso } from '../src/lib/turnos.js'

// "Ahora" fijo: 1 de octubre de 2026, 10:00 en Argentina
const AHORA = new Date('2026-10-01T10:00:00-03:00')

test('el cliente puede cancelar con más de 24 h', () => {
  assert.equal(clientePuedeCancelar({ fecha: '2026-10-02', hora: '10:30', estado: 'pendiente' }, AHORA), true)
})

test('el cliente NO puede cancelar con 24 h o menos', () => {
  assert.equal(clientePuedeCancelar({ fecha: '2026-10-02', hora: '10:00', estado: 'pendiente' }, AHORA), false)
  assert.equal(clientePuedeCancelar({ fecha: '2026-10-01', hora: '18:00', estado: 'confirmado' }, AHORA), false)
})

test('no se puede cancelar un turno que ya no está activo', () => {
  assert.equal(clientePuedeCancelar({ fecha: '2026-10-10', hora: '10:00', estado: 'cancelado' }, AHORA), false)
  assert.equal(clientePuedeCancelar({ fecha: '2026-10-10', hora: '10:00', estado: 'atendido' }, AHORA), false)
})

test('yaPaso compara con la hora de Argentina', () => {
  assert.equal(yaPaso({ fecha: '2026-10-01', hora: '09:30' }, AHORA), true)
  assert.equal(yaPaso({ fecha: '2026-10-01', hora: '10:30' }, AHORA), false)
})

test('separa próximos (activos a futuro) e historial', () => {
  const turnos = [
    { id: 1, fecha: '2026-09-20', hora: '10:00', estado: 'atendido' },
    { id: 2, fecha: '2026-09-25', hora: '10:00', estado: 'ausente' },
    { id: 3, fecha: '2026-10-05', hora: '10:00', estado: 'pendiente' },
    { id: 4, fecha: '2026-10-06', hora: '10:00', estado: 'cancelado' },
  ]
  const { proximos, historial } = separarTurnos(turnos, AHORA)
  assert.deepEqual(proximos.map((t) => t.id), [3])
  assert.deepEqual(historial.map((t) => t.id), [4, 2, 1])
})

test('turnos de la semana: activos y dentro de los próximos 7 días', () => {
  const turnos = [
    { id: 1, fecha: '2026-10-03', hora: '10:00', estado: 'pendiente' },
    { id: 2, fecha: '2026-10-07', hora: '10:00', estado: 'confirmado' },
    { id: 3, fecha: '2026-10-09', hora: '10:00', estado: 'pendiente' },
    { id: 4, fecha: '2026-10-04', hora: '10:00', estado: 'cancelado' },
  ]
  assert.deepEqual(turnosDeLaSemana(turnos, AHORA).map((t) => t.id), [1, 2])
})
