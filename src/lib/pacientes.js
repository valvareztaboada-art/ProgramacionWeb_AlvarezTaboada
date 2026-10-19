// Reglas para eliminar un paciente (funciones puras: se pueden testear sin base de datos).
// La misma regla la aplica la base con un trigger (ver migración eliminar_pacientes):
// acá sirve para avisarle a la veterinaria ANTES de que lo intente.

// Pagos con movimiento de plata: son comprobantes y no se borran
export const ESTADOS_QUE_IMPIDEN_BORRAR = ['pagado', 'en_proceso', 'reembolsado']

export function puedeEliminarse(estadosDePagos) {
  return !estadosDePagos.some((e) => ESTADOS_QUE_IMPIDEN_BORRAR.includes(e))
}

function cantidad(n, singular, plural) {
  return `${n} ${n === 1 ? singular : plural}`
}

// Lista de lo que se borra junto con la mascota, para mostrar en la confirmación.
// resumen: { turnos, vacunas, estudios, pagos: ['pendiente', ...] }
export function loQueSeBorra({ turnos, vacunas, estudios, pagos }) {
  const pendientes = pagos.filter((e) => e === 'pendiente').length
  return [
    turnos > 0 && cantidad(turnos, 'turno', 'turnos'),
    vacunas > 0 && cantidad(vacunas, 'vacuna registrada', 'vacunas registradas'),
    estudios > 0 && cantidad(estudios, 'estudio (con su archivo)', 'estudios (con sus archivos)'),
    pendientes > 0 && cantidad(pendientes, 'cobro pendiente', 'cobros pendientes'),
  ].filter(Boolean)
}
