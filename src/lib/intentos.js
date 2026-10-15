// Bloqueo temporal PROGRESIVO después de varios intentos de login fallidos.
//
// Ojo: esto es la parte visible (avisa y frena al usuario en la pantalla).
// La defensa real contra fuerza bruta es el rate limiting de Supabase Auth,
// que limita los intentos por IP en el servidor aunque alguien saltee esta pantalla.

const INTENTOS_LIBRES = 3
const ESPERA_INICIAL = 15 // segundos
const ESPERA_MAXIMA = 5 * 60

// 0, 1 o 2 fallos → 0 s · 3 → 15 s · 4 → 30 s · 5 → 60 s · ... hasta 5 minutos
export function esperaTrasFallos(fallos) {
  if (fallos < INTENTOS_LIBRES) return 0
  return Math.min(ESPERA_INICIAL * 2 ** (fallos - INTENTOS_LIBRES), ESPERA_MAXIMA)
}

// 75 → "1:15"
export function formatearEspera(segundos) {
  const minutos = Math.floor(segundos / 60)
  const resto = String(segundos % 60).padStart(2, '0')
  return `${minutos}:${resto}`
}
