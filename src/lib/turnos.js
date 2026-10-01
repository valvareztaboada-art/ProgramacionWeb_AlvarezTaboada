// Reglas de los turnos para MOSTRAR en pantalla (qué botones aparecen).
// Ojo: la regla de verdad la controla la base de datos (función cancelar_turno),
// esto solo evita mostrar un botón que después daría error.

export const ESTADOS_ACTIVOS = ['pendiente', 'confirmado']

const HORAS_MINIMAS_PARA_CANCELAR = 24

// "2026-10-05" + "10:00" → Date (la veterinaria está en Argentina, UTC-3)
export function inicioDelTurno(fecha, hora) {
  return new Date(`${fecha}T${hora}:00-03:00`)
}

export function esActivo(turno) {
  return ESTADOS_ACTIVOS.includes(turno.estado)
}

// ¿El turno ya pasó?
export function yaPaso(turno, ahora = new Date()) {
  return inicioDelTurno(turno.fecha, turno.hora) <= ahora
}

// El cliente puede cancelar si el turno está activo y faltan MÁS de 24 h
export function clientePuedeCancelar(turno, ahora = new Date()) {
  const horasQueFaltan = (inicioDelTurno(turno.fecha, turno.hora) - ahora) / (1000 * 60 * 60)
  return esActivo(turno) && horasQueFaltan > HORAS_MINIMAS_PARA_CANCELAR
}

// Separa los turnos en próximos (activos y a futuro) e historial (todo lo demás)
export function separarTurnos(turnos, ahora = new Date()) {
  const proximos = turnos.filter((t) => esActivo(t) && !yaPaso(t, ahora))
  const historial = turnos.filter((t) => !proximos.includes(t)).reverse()
  return { proximos, historial }
}

// Turnos activos de los próximos 7 días
export function turnosDeLaSemana(turnos, ahora = new Date()) {
  const enUnaSemana = new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000)
  return turnos.filter((t) => esActivo(t) && !yaPaso(t, ahora) && inicioDelTurno(t.fecha, t.hora) < enUnaSemana)
}
