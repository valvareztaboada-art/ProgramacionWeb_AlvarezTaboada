// Funciones para mostrar datos con buen formato.

// 0 → "Menos de 1 año" · 1 → "1 año" · 4 → "4 años" · sin dato → ""
export function formatearEdad(edad) {
  if (edad === null || edad === undefined || edad === '') return ''
  if (edad < 1) return 'Menos de 1 año'
  return edad === 1 ? '1 año' : `${edad} años`
}

// Años y meses cumplidos entre la fecha de nacimiento y hoy (las dos en "AAAA-MM-DD").
// Se trabaja con los números de la fecha, sin horas: así no hay problemas de zona horaria.
// "hoy" se recibe como parámetro para poder testearla con cualquier fecha.
export function calcularEdad(fechaNacimiento, hoy) {
  const [an, mn, dn] = fechaNacimiento.split('-').map(Number)
  const [ah, mh, dh] = hoy.split('-').map(Number)
  let meses = (ah - an) * 12 + (mh - mn)
  if (dh < dn) meses -= 1 // todavía no llegó el día del mes en que nació
  meses = Math.max(meses, 0)
  return { anios: Math.floor(meses / 12), meses }
}

// Texto de la edad de una mascota: la calcula si tiene fecha de nacimiento;
// si no (pacientes cargados antes), usa la edad que se guardó en ese momento.
// "4 años" · "1 año" · "8 meses" · "1 mes" · "Menos de 1 mes"
export function textoDeEdad({ fechaNacimiento, edad }, hoy) {
  if (!fechaNacimiento) return formatearEdad(edad)
  const { anios, meses } = calcularEdad(fechaNacimiento, hoy)
  if (anios >= 1) return anios === 1 ? '1 año' : `${anios} años`
  if (meses >= 1) return meses === 1 ? '1 mes' : `${meses} meses`
  return 'Menos de 1 mes'
}

// "2022-03-14" → "14/03/2022"
export function formatearFechaCorta(fechaISO) {
  const [a, m, d] = fechaISO.split('-')
  return `${d}/${m}/${a}`
}

// "2026-09-28" → "lunes, 28 de septiembre"
export function formatearFecha(fechaISO) {
  // Se agrega la hora para que la fecha se lea en la zona horaria local
  const fecha = new Date(`${fechaISO}T00:00`)
  return fecha.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}
