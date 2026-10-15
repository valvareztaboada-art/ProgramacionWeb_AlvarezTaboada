// Reglas de fortaleza de la contraseña.
// Son las mismas que se configuran en Supabase (Authentication → Email → Password requirements),
// así el usuario ve en pantalla exactamente lo que el servidor le va a exigir.
// La contraseña NUNCA se guarda en MICAN: la recibe Supabase Auth, que la guarda
// hasheada con bcrypt y un salt único por usuario (ver docs/seguridad.md).

export const LARGO_MINIMO = 8
export const LARGO_MAXIMO = 72 // bcrypt solo usa los primeros 72 bytes

const REQUISITOS = [
  { id: 'largo', texto: `Al menos ${LARGO_MINIMO} caracteres`, cumple: (c) => c.length >= LARGO_MINIMO },
  { id: 'minuscula', texto: 'Una letra minúscula', cumple: (c) => /\p{Ll}/u.test(c) },
  { id: 'mayuscula', texto: 'Una letra mayúscula', cumple: (c) => /\p{Lu}/u.test(c) },
  { id: 'numero', texto: 'Un número', cumple: (c) => /\d/.test(c) },
  { id: 'simbolo', texto: 'Un símbolo (ej: ! ? # $ *)', cumple: (c) => /[^\p{L}\d\s]/u.test(c) },
]

// Contraseñas que aparecen primero en cualquier lista de ataques: aunque "cumplan", no sirven
const DEMASIADO_COMUNES = ['password', 'contraseña', 'contrasena', '12345678', 'qwerty', 'mican', 'veterinaria']

// Devuelve qué requisitos cumple y un nivel para el indicador visual:
// { requisitos: [{ id, texto, cumple }], cumplidos, nivel: 'vacia' | 'debil' | 'media' | 'fuerte', esComun }
export function evaluarContrasena(contrasena = '') {
  const requisitos = REQUISITOS.map((r) => ({ id: r.id, texto: r.texto, cumple: r.cumple(contrasena) }))
  const cumplidos = requisitos.filter((r) => r.cumple).length
  const minuscula = contrasena.toLowerCase()
  const esComun = DEMASIADO_COMUNES.some((palabra) => minuscula.includes(palabra))

  let nivel = 'debil'
  if (contrasena === '') nivel = 'vacia'
  else if (cumplidos === REQUISITOS.length && !esComun) nivel = contrasena.length >= 12 ? 'fuerte' : 'media'

  return { requisitos, cumplidos, total: REQUISITOS.length, nivel, esComun }
}

// Mensaje de error para el formulario (o null si la contraseña sirve)
export function errorDeContrasena(contrasena) {
  if (contrasena.length > LARGO_MAXIMO) return `La contraseña puede tener hasta ${LARGO_MAXIMO} caracteres.`
  const { requisitos, esComun } = evaluarContrasena(contrasena)
  const falta = requisitos.find((r) => !r.cumple)
  if (falta) return `A tu contraseña le falta: ${falta.texto.toLowerCase()}.`
  if (esComun) return 'Esa contraseña es demasiado común. Elegí otra que no incluya palabras obvias.'
  return null
}
