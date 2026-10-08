// Cliente de Supabase con la clave SECRETA (rol service_role).
// Lo usa SOLO el webhook de Mercado Pago, que no tiene un usuario logueado.
//
// ⚠️ Esta clave saltea el RLS: nunca puede llegar al navegador.
//    · La variable NO empieza con NEXT_PUBLIC_ (Next.js no la incluye en el JS del cliente)
//    · 'server-only' hace fallar el build si alguien importa este archivo en un Client Component
//    · Igual, lo único que hacemos con ella es llamar a registrar_pago_mp()

import 'server-only'
import { createClient } from '@supabase/supabase-js'

export function crearClienteAdmin() {
  const clave = process.env.SUPABASE_SECRET_KEY
  if (!clave) throw new Error('Falta la variable de entorno SUPABASE_SECRET_KEY')

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, clave, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
