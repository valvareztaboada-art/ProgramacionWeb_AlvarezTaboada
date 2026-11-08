// "Olvidé mi contraseña": lectura del enlace del email (función pura, con tests en tests/recuperacion.test.js).
// El email por defecto de Supabase vuelve a /nueva-contrasena con la sesión de recuperación en la parte
// "#…" del enlace: #access_token=…&refresh_token=…&type=recovery, o #error=…&error_code=otp_expired si venció.

// Devuelve { enlace } si sirve, { vencido: true } si Supabase avisó un error, o null si no hay nada
export function leerEnlaceDelHash(hash) {
  const p = new URLSearchParams(String(hash ?? '').replace(/^#/, ''))
  if (p.get('error') || p.get('error_code')) return { vencido: true }
  if (p.get('access_token') && p.get('refresh_token') && p.get('type') === 'recovery') {
    return { enlace: { accessToken: p.get('access_token'), refreshToken: p.get('refresh_token') } }
  }
  return null
}
