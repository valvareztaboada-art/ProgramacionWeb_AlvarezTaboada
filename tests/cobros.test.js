import { test } from 'node:test'
import assert from 'node:assert/strict'
import { conceptoDelTurno, montosSugeridos, atendidosSinCobrar, montoANumero } from '../src/lib/cobros.js'
import { esquemaNuevoCobro, esquemaCambiosTurno } from '../src/lib/esquemas.js'

const HOY = '2026-10-25'

test('concepto propuesto para el cobro de un turno', () => {
  assert.equal(conceptoDelTurno({ especialidad: 'Consulta', mascota: 'Luna' }), 'Consulta · Luna')
})

test('monto sugerido: el último cobrado por cada tipo de turno', () => {
  const filas = [
    { monto: '18000', especialidadId: 'consulta' }, // el más nuevo
    { monto: '25000', especialidadId: 'peluqueria' },
    { monto: '15000', especialidadId: 'consulta' }, // más viejo: no cuenta
    { monto: '9000', especialidadId: null },
  ]
  assert.deepEqual(montosSugeridos(filas), { consulta: 18000, peluqueria: 25000 })
})

test('atendidos sin cobrar: solo atendidos, sin cobro, sin "no se cobra" y de los últimos 60 días', () => {
  const turnos = [
    { id: 1, estado: 'atendido', fecha: '2026-10-24', hora: '10:00', sinCargo: false, cobros: 0 },
    { id: 2, estado: 'atendido', fecha: '2026-10-24', hora: '11:00', sinCargo: false, cobros: 1 }, // ya cobrado
    { id: 3, estado: 'atendido', fecha: '2026-10-20', hora: '09:00', sinCargo: true, cobros: 0 }, // no se cobra
    { id: 4, estado: 'ausente', fecha: '2026-10-23', hora: '09:00', sinCargo: false, cobros: 0 },
    { id: 5, estado: 'atendido', fecha: '2026-07-01', hora: '09:00', sinCargo: false, cobros: 0 }, // muy viejo
    { id: 6, estado: 'atendido', fecha: '2026-10-24', hora: '16:30', sinCargo: false, cobros: 0 },
  ]
  assert.deepEqual(atendidosSinCobrar(turnos, HOY).map((t) => t.id), [6, 1])
})

test('montoANumero acepta coma o punto', () => {
  assert.equal(montoANumero('15000,50'), 15000.5)
  assert.equal(montoANumero(' 2000 '), 2000)
})

test('esquema de cobro: valida monto, concepto y que no se cuelen campos', () => {
  const ok = esquemaNuevoCobro.parse({ mascotaId: 3, concepto: ' <b>Consulta</b> · Luna ', monto: 15000.5, turnoId: 8, enEfectivo: true })
  assert.equal(ok.concepto, 'Consulta · Luna')
  const mal = esquemaNuevoCobro.safeParse({ mascotaId: 3, concepto: 'ab', monto: 10.123 })
  assert.deepEqual(mal.error.issues.map((i) => i.path[0]).sort(), ['concepto', 'monto'])
  assert.equal(esquemaNuevoCobro.safeParse({ mascotaId: 3, concepto: 'Consulta', monto: -5 }).success, false)
  assert.equal(esquemaNuevoCobro.safeParse({ mascotaId: 3, concepto: 'Consulta', monto: 100, estado: 'pagado' }).success, false)
})

test('esquema de cambios de turno: estado válido o sinCargo, al menos uno', () => {
  assert.deepEqual(esquemaCambiosTurno.parse({ estado: 'atendido' }), { estado: 'atendido' })
  assert.deepEqual(esquemaCambiosTurno.parse({ sinCargo: true }), { sinCargo: true })
  assert.equal(esquemaCambiosTurno.safeParse({ estado: 'pendiente' }).success, false)
  assert.equal(esquemaCambiosTurno.safeParse({}).success, false)
})
