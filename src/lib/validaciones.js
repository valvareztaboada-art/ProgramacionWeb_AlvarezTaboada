// Funciones de validación. Devuelven un objeto con los errores:
// { email: 'Ingresá un email válido.' }. Si el objeto está vacío, no hay errores.
// Son funciones puras (no dependen de React), así que tienen tests en tests/validaciones.test.js.
// La base de datos vuelve a controlar lo importante: nunca hay que confiar solo en el navegador.

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const TIENE_LETRAS = /\p{L}/u
const TELEFONO_VALIDO = /^[+\d\s()-]+$/

function validarEmail(email) {
  const limpio = email.trim()
  if (limpio === '') return 'Ingresá tu email.'
  if (!EMAIL_VALIDO.test(limpio)) return 'Ingresá un email válido (ej: nombre@mail.com).'
  return null
}

// Guarda en "errores" solo los mensajes que no son null
function sinVacios(errores) {
  return Object.fromEntries(Object.entries(errores).filter(([, mensaje]) => mensaje))
}

export function validarLogin({ email, password }) {
  return sinVacios({
    email: validarEmail(email),
    password: password === '' ? 'Ingresá tu contraseña.' : null,
  })
}

export function validarRegistro({ nombre, email, telefono = '', password, confirmar }) {
  const nombreLimpio = nombre.trim()
  const digitosTelefono = telefono.replace(/\D/g, '')

  return sinVacios({
    nombre:
      nombreLimpio.length < 2 || !TIENE_LETRAS.test(nombreLimpio) ? 'Ingresá tu nombre y apellido.'
      : nombreLimpio.length > 80 ? 'El nombre puede tener hasta 80 caracteres.'
      : null,
    email: validarEmail(email),
    telefono:
      telefono.trim() === '' ? null
      : !TELEFONO_VALIDO.test(telefono) || digitosTelefono.length < 8 || digitosTelefono.length > 15
        ? 'Ingresá un teléfono válido (solo números, ej: 11 2345-6789).'
        : null,
    password:
      password.length < 8 ? 'La contraseña tiene que tener al menos 8 caracteres.'
      : password.length > 72 ? 'La contraseña puede tener hasta 72 caracteres.'
      : null,
    confirmar:
      confirmar === '' ? 'Repetí la contraseña.'
      : confirmar !== password ? 'Las contraseñas no coinciden.'
      : null,
  })
}

export function validarPaciente({ nombre, especie, edad, emailDuenio }) {
  const nombreLimpio = nombre.trim()
  const edadNumero = Number(edad)

  return sinVacios({
    nombre:
      nombreLimpio === '' ? 'Ingresá el nombre de la mascota.'
      : nombreLimpio.length > 40 ? 'El nombre puede tener hasta 40 caracteres.'
      : null,
    especie: especie === '' ? 'Elegí la especie.' : null,
    edad:
      edad === '' ? null
      : !Number.isInteger(edadNumero) || edadNumero < 0 || edadNumero > 40
        ? 'Ingresá una edad en años enteros, entre 0 y 40.'
        : null,
    emailDuenio: validarEmail(emailDuenio),
  })
}

// "hoy" se recibe como parámetro para poder testear la función con cualquier fecha
export function validarTurno({ mascotaId, especialidad, fecha, hora, comentario = '' }, hoy) {
  return sinVacios({
    mascotaId: mascotaId === '' ? 'Elegí para qué mascota es el turno.' : null,
    especialidad: especialidad === '' ? 'Elegí el tipo de turno.' : null,
    fecha:
      fecha === '' ? 'Elegí un día.'
      : hoy && fecha < hoy ? 'Elegí un día de hoy en adelante.'
      : null,
    hora: fecha !== '' && hora === '' ? 'Elegí un horario.' : null,
    comentario: comentario.length > 300 ? 'El comentario puede tener hasta 300 caracteres.' : null,
  })
}

export function validarCobro({ mascotaId, concepto, monto }) {
  const conceptoLimpio = concepto.trim()
  const montoNumero = Number(String(monto).replace(',', '.'))

  return sinVacios({
    mascotaId: mascotaId === '' ? 'Elegí el paciente.' : null,
    concepto:
      conceptoLimpio.length < 3 ? 'Escribí el concepto (ej: Consulta de control).'
      : conceptoLimpio.length > 80 ? 'El concepto puede tener hasta 80 caracteres.'
      : null,
    monto:
      String(monto).trim() === '' ? 'Ingresá el monto.'
      : !Number.isFinite(montoNumero) || montoNumero <= 0 ? 'El monto tiene que ser mayor a 0.'
      : montoNumero > 10000000 ? 'El monto es demasiado alto.'
      : !/^\d+([.,]\d{1,2})?$/.test(String(monto).trim()) ? 'Usá hasta 2 decimales (ej: 15000 o 15000,50).'
      : null,
  })
}
