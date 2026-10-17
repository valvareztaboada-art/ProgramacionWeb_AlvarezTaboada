import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  opcionesDeVacuna, calcularProximaDosis, lineaDeVacuna, sumarDias, diasEntre,
  estadoDeProxima, proximasVacunas, hayVacunasParaAtender, vacunasAVencer, vacunasYaAvisadas, mensajeDeAviso,
} from '../src/lib/vacunas.js'
import { validarVacuna } from '../src/lib/validaciones.js'

const HOY = '2026-10-17'

test('calendario: perros y gatos tienen sus opciones; aves y otros, ninguna', () => {
  assert.ok(opcionesDeVacuna('Perro').some((v) => v.id === 'polivalente_1'))
  assert.ok(opcionesDeVacuna('Gato').some((v) => v.id === 'triple_felina_1'))
  assert.ok(!opcionesDeVacuna('Gato').some((v) => v.id === 'polivalente_1'))
  assert.deepEqual(opcionesDeVacuna('Ave'), [])
  assert.deepEqual(opcionesDeVacuna('Otro'), [])
})

test('fechas: sumar días y contar días entre fechas (también entre años)', () => {
  assert.equal(sumarDias('2026-12-20', 14), '2027-01-03')
  assert.equal(diasEntre('2026-10-17', '2026-11-16'), 30)
  assert.equal(diasEntre('2026-10-17', '2026-10-10'), -7)
})

test('próxima dosis: perro (6 → 8 → 12 semanas, rabia y refuerzos anuales)', () => {
  assert.equal(calcularProximaDosis('Perro', 'polivalente_1', '2026-01-01'), '2026-01-15')
  assert.equal(calcularProximaDosis('Perro', 'polivalente_2', '2026-01-15'), '2026-02-12')
  assert.equal(calcularProximaDosis('Perro', 'rabia_anual', '2026-10-17'), '2027-10-17')
  assert.equal(calcularProximaDosis('Perro', 'polivalente_anual', '2026-10-17'), '2027-10-17')
})

test('próxima dosis: gato (triple felina con refuerzo; rabia anual)', () => {
  assert.equal(calcularProximaDosis('Gato', 'triple_felina_1', '2026-03-01'), '2026-03-29')
  assert.equal(calcularProximaDosis('Gato', 'triple_felina_2', '2026-03-29'), null)
  assert.equal(calcularProximaDosis('Gato', 'rabia_gato_1', '2026-05-01'), '2027-05-01')
})

test('próxima dosis: "otra" o especies sin calendario no tienen sugerencia', () => {
  assert.equal(calcularProximaDosis('Perro', 'otra', HOY), null)
  assert.equal(calcularProximaDosis('Ave', 'otra', HOY), null)
})

test('línea: agrupa por la del calendario, o por el nombre escrito', () => {
  assert.equal(lineaDeVacuna('Perro', 'rabia_anual', ''), 'rabia')
  assert.equal(lineaDeVacuna('Gato', 'rabia_gato_1', ''), 'rabia')
  assert.equal(lineaDeVacuna('Ave', 'otra', '  Psitacosis '), 'psitacosis')
})

test('estado de la próxima: vencida, pronto (30 días o menos) y al día', () => {
  assert.equal(estadoDeProxima(-1), 'vencida')
  assert.equal(estadoDeProxima(0), 'pronto')
  assert.equal(estadoDeProxima(30), 'pronto')
  assert.equal(estadoDeProxima(31), 'al_dia')
})

const DOSIS = [
  { id: 1, mascotaId: 1, mascota: 'Keyla', vacuna: 'Rabia 1ª', linea: 'rabia', fecha_aplicacion: '2025-06-01', proxima_dosis: '2026-06-01' },
  { id: 2, mascotaId: 1, mascota: 'Keyla', vacuna: 'Rabia anual', linea: 'rabia', fecha_aplicacion: '2026-06-01', proxima_dosis: '2027-06-01' },
  { id: 3, mascotaId: 1, mascota: 'Keyla', vacuna: 'Polivalente anual', linea: 'polivalente', fecha_aplicacion: '2025-11-01', proxima_dosis: '2026-11-01' },
  { id: 4, mascotaId: 2, mascota: 'Tom', vacuna: 'Triple felina refuerzo', linea: 'triple_felina', fecha_aplicacion: '2026-03-29', proxima_dosis: null },
  { id: 5, mascotaId: 2, mascota: 'Tom', vacuna: 'Rabia anual', linea: 'rabia', fecha_aplicacion: '2025-10-01', proxima_dosis: '2026-10-01' },
]

test('próximas: solo la última dosis de cada línea, ordenadas por cercanía', () => {
  const r = proximasVacunas(DOSIS, HOY)
  assert.deepEqual(r.map((v) => [v.id, v.dias, v.estado]), [
    [5, -16, 'vencida'], // rabia de Tom: venció hace 16 días
    [3, 15, 'pronto'],   // polivalente de Keyla: en 15 días
    [2, 227, 'al_dia'],  // rabia de Keyla: la dosis 1 quedó reemplazada por la 2
  ])
})

test('alerta: aparece si hay alguna próxima vencida o en 30 días', () => {
  assert.equal(hayVacunasParaAtender(DOSIS, HOY), true)
  assert.equal(hayVacunasParaAtender([DOSIS[1]], HOY), false)
  assert.equal(hayVacunasParaAtender([], HOY), false)
})

test('validar vacuna: pide la vacuna, el nombre si es "otra", y fechas coherentes', () => {
  assert.deepEqual(Object.keys(validarVacuna({ tipo: '', fecha: '' }, HOY)).sort(), ['fecha', 'tipo'])
  assert.ok(validarVacuna({ tipo: 'otra', nombre: '', fecha: HOY }, HOY).nombre)
  assert.deepEqual(validarVacuna({ tipo: 'rabia_anual', fecha: HOY, proxima: '2027-10-17' }, HOY), {})
  assert.ok(validarVacuna({ tipo: 'rabia_anual', fecha: '2026-12-01' }, HOY).fecha)
  assert.ok(validarVacuna({ tipo: 'rabia_anual', fecha: HOY, proxima: HOY }, HOY).proxima)
})


test('a vencer: las que vencen en 30 días o menos (o vencidas) y todavía sin avisar', () => {
  const conAviso = DOSIS.map((d) => (d.id === 5 ? { ...d, avisado_en: '2026-10-10T12:00:00Z' } : d))
  assert.deepEqual(vacunasAVencer(conAviso, HOY).map((v) => v.id), [3]) // la 5 ya está avisada; la 2 es "al día"
  assert.deepEqual(vacunasYaAvisadas(conAviso, HOY).map((v) => v.id), [5])
})

test('a vencer: al registrar una dosis nueva de la misma vacuna, la vieja sale de la lista', () => {
  const conNueva = [...DOSIS, { id: 9, mascotaId: 1, mascota: 'Keyla', vacuna: 'Polivalente anual', linea: 'polivalente', fecha_aplicacion: HOY, proxima_dosis: '2027-10-17' }]
  assert.ok(!vacunasAVencer(conNueva, HOY).some((v) => v.id === 3))
})

test('mensaje de aviso: saluda por el nombre y dice la vacuna y la fecha', () => {
  const m = mensajeDeAviso({ nombreDuenio: 'Victoria Álvarez', mascota: 'Keyla', vacuna: 'Antirrábica · refuerzo anual', fechaTexto: 'lunes, 16 de noviembre' })
  assert.equal(m.asunto, 'Se acerca la vacuna de Keyla')
  assert.match(m.texto, /^¡Hola, Victoria!/)
  assert.match(m.texto, /Antirrábica · refuerzo anual el lunes, 16 de noviembre/)
})

test('mensaje de aviso: si no hay nombre (solo el email), saluda igual', () => {
  assert.match(mensajeDeAviso({ nombreDuenio: 'ana@mail.com', mascota: 'Luna', vacuna: 'X', fechaTexto: 'hoy' }).texto, /^¡Hola! /)
})
