// Funciones para mostrar datos con buen formato.

// 0 → "Menos de 1 año" · 1 → "1 año" · 4 → "4 años"
export function formatearEdad(edad) {
  if (edad < 1) return 'Menos de 1 año'
  return edad === 1 ? '1 año' : `${edad} años`
}

// "2026-09-28" → "lunes, 28 de septiembre"
export function formatearFecha(fechaISO) {
  // Se agrega la hora para que la fecha se lea en la zona horaria local
  const fecha = new Date(`${fechaISO}T00:00`)
  return fecha.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}
