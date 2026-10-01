// Cliente de Supabase para el SERVIDOR (Server Components y Route Handlers).
// Lee la sesión del usuario desde las cookies del pedido.
// Hay que crear uno nuevo en cada pedido (no reutilizarlo entre usuarios).

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function crearClienteServidor() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesAGuardar) {
          try {
            cookiesAGuardar.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Un Server Component no puede escribir cookies.
            // No pasa nada: el proxy (src/proxy.js) es el que renueva la sesión.
          }
        },
      },
    },
  )
}
