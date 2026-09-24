// Funciones de validación. Devuelven un objeto con los errores:
// { email: 'Ingresá un email válido' }. Si el objeto está vacío, no hay errores.
// Más adelante, cuando veamos Route Handlers, estas mismas funciones
// se usan también en el servidor (nunca hay que confiar solo en el navegador).

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validarRegistro({ nombre, email, password, confirmar }) {
  const errores = {}

  if (nombre.trim().length < 2) errores.nombre = 'Ingresá tu nombre y apellido.'
  if (!EMAIL_VALIDO.test(email)) errores.email = 'Ingresá un email válido.'
  if (password.length < 8) errores.password = 'La contraseña tiene que tener al menos 8 caracteres.'
  if (confirmar !== password) errores.confirmar = 'Las contraseñas no coinciden.'

  return errores
}

export function validarPaciente({ nombre, especie, edad, emailDuenio }) {
  const errores = {}

  if (nombre.trim() === '') errores.nombre = 'Ingresá el nombre de la mascota.'
  if (especie === '') errores.especie = 'Elegí la especie.'
  if (edad !== '' && (Number(edad) < 0 || Number(edad) > 40)) errores.edad = 'Ingresá una edad entre 0 y 40.'
  if (!EMAIL_VALIDO.test(emailDuenio)) errores.emailDuenio = 'Ingresá un email válido.'

  return errores
}

// "hoy" se recibe como parámetro para poder testear la función con cualquier fecha
export function validarTurno({ mascotaId, especialidad, fecha, hora }, hoy) {
  const errores = {}

  if (mascotaId === '') errores.mascotaId = 'Elegí para qué mascota es el turno.'
  if (especialidad === '') errores.especialidad = 'Elegí el tipo de turno.'
  if (fecha === '') errores.fecha = 'Elegí un día.'
  else if (fecha < hoy) errores.fecha = 'Elegí un día de hoy en adelante.'
  if (fecha !== '' && hora === '') errores.hora = 'Elegí un horario.'

  return errores
}
