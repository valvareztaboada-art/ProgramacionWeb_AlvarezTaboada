// Traduce los errores de Supabase (y de la conexión) a mensajes en castellano.

const MENSAJES = {
  invalid_credentials: 'El email o la contraseña no son correctos.',
  email_not_confirmed: 'Todavía no confirmaste tu email. Revisá tu casilla (y la carpeta de spam).',
  user_already_exists: 'Ya existe una cuenta con ese email. Probá ingresar.',
  weak_password: 'La contraseña es muy débil. Usá al menos 8 caracteres.',
  over_email_send_rate_limit: 'Se enviaron demasiados emails. Esperá unos minutos y probá de nuevo.',
  over_request_rate_limit: 'Demasiados intentos. Esperá un momento y probá de nuevo.',
  // Errores de la base de datos (Postgres / PostgREST)
  '23505': 'Ese horario se acaba de ocupar. Elegí otro.',
  '23514': 'Algún dato no es válido. Revisá el formulario.',
  '42501': 'No tenés permiso para hacer esto. Si estuviste mucho tiempo sin usar el sitio, volvé a ingresar.',
  PGRST301: 'Tu sesión venció. Volvé a ingresar.',
  PGRST303: 'Tu sesión venció. Volvé a ingresar.',
}

export const SESION_VENCIDA = 'Tu sesión venció. Volvé a ingresar para continuar.'
const SIN_CONEXION = 'No pudimos conectarnos. Revisá tu conexión a internet y probá de nuevo.'

function esErrorDeConexion(error) {
  const texto = `${error.name ?? ''} ${error.message ?? ''}`
  return /Failed to fetch|NetworkError|fetch failed|Load failed|AuthRetryableFetchError/i.test(texto)
}

export function mensajeDeError(error) {
  if (!error) return ''
  if (MENSAJES[error.code]) return MENSAJES[error.code]
  if (esErrorDeConexion(error)) return SIN_CONEXION
  // Los errores que lanzan nuestras funciones SQL (ej: la regla de las 24 h) ya vienen en castellano
  if (error.code === 'P0001' && error.message) return error.message
  return 'Ocurrió un error inesperado. Probá de nuevo en unos minutos.'
}
