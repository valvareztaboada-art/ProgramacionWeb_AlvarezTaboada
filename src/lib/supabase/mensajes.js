// Traduce los errores de Supabase a mensajes en castellano para mostrar en pantalla.

const MENSAJES = {
  invalid_credentials: 'El email o la contraseña no son correctos.',
  email_not_confirmed: 'Todavía no confirmaste tu email. Revisá tu casilla (y la carpeta de spam).',
  user_already_exists: 'Ya existe una cuenta con ese email. Probá ingresar.',
  weak_password: 'La contraseña es muy débil. Usá al menos 8 caracteres.',
  over_email_send_rate_limit: 'Se enviaron demasiados emails. Esperá unos minutos y probá de nuevo.',
  over_request_rate_limit: 'Demasiados intentos. Esperá un momento y probá de nuevo.',
  '23505': 'Ese horario se acaba de ocupar. Elegí otro.',
  '42501': 'No tenés permiso para hacer esto.',
}

export function mensajeDeError(error) {
  if (!error) return ''
  return MENSAJES[error.code] ?? error.message ?? 'Ocurrió un error. Probá de nuevo.'
}
