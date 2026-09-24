// Horarios de atención de la veterinaria y cálculo de turnos disponibles.
// Son funciones puras (no dependen de React), así que se pueden testear fácil.

// Día de la semana (0 = domingo … 6 = sábado) → horario de atención
const ATENCION = {
  0: null, // domingo cerrado
  1: { desde: '09:00', hasta: '18:00' },
  2: { desde: '09:00', hasta: '18:00' },
  3: { desde: '09:00', hasta: '18:00' },
  4: { desde: '09:00', hasta: '18:00' },
  5: { desde: '09:00', hasta: '18:00' },
  6: { desde: '09:00', hasta: '13:00' },
}

const MINUTOS_POR_TURNO = 30

// "09:30" → 570
function aMinutos(hora) {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

// 570 → "09:30"
function aHora(minutos) {
  const h = String(Math.floor(minutos / 60)).padStart(2, '0')
  const m = String(minutos % 60).padStart(2, '0')
  return `${h}:${m}`
}

// Fecha de hoy en formato "2026-09-24" (el formato que usa <input type="date">)
export function hoyISO() {
  const hoy = new Date()
  hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset())
  return hoy.toISOString().slice(0, 10)
}

// Devuelve los horarios de un día: [{ hora: '09:00', ocupado: false }, ...]
// Si ese día no se atiende, devuelve una lista vacía.
export function horariosDelDia(fechaISO, ocupados = []) {
  const diaSemana = new Date(`${fechaISO}T00:00`).getDay()
  const atencion = ATENCION[diaSemana]
  if (!atencion) return []

  const horarios = []
  for (let min = aMinutos(atencion.desde); min < aMinutos(atencion.hasta); min += MINUTOS_POR_TURNO) {
    const hora = aHora(min)
    const ocupado = ocupados.some((t) => t.fecha === fechaISO && t.hora === hora)
    horarios.push({ hora, ocupado })
  }
  return horarios
}
