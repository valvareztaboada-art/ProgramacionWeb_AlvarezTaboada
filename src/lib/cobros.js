// Ayudas para cobrar los turnos atendidos (funciones puras: tienen tests en tests/cobros.test.js).

import { sumarDias } from './vacunas.js'

// Hasta cuántos días atrás se muestran los atendidos sin cobrar (los más viejos ya no se reclaman)
export const DIAS_PARA_COBRAR = 60

// Concepto que se propone para el cobro de un turno: "Consulta · Luna"
export function conceptoDelTurno({ especialidad, mascota }) {
  return `${especialidad} · ${mascota}`
}

// Último monto cobrado por cada tipo de turno, para sugerirlo.
// filas: [{ monto, especialidadId }] ordenadas de la más nueva a la más vieja
export function montosSugeridos(filas) {
  const sugeridos = {}
  for (const { monto, especialidadId } of filas) {
    if (especialidadId && !(especialidadId in sugeridos)) sugeridos[especialidadId] = Number(monto)
  }
  return sugeridos
}

// Turnos atendidos que todavía no tienen cobro ni se marcaron "no se cobra",
// de los últimos DIAS_PARA_COBRAR días, del más nuevo al más viejo.
// turnos: [{ estado, fecha, sinCargo, cobros (cantidad) }]
export function atendidosSinCobrar(turnos, hoy) {
  const desde = sumarDias(hoy, -DIAS_PARA_COBRAR)
  return turnos
    .filter((t) => t.estado === 'atendido' && !t.sinCargo && t.cobros === 0 && t.fecha >= desde)
    .sort((a, b) => `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`))
}

// "15000,50" → 15000.5 (para mandarle un número a la API)
export function montoANumero(texto) {
  return Number(String(texto).trim().replace(',', '.'))
}
