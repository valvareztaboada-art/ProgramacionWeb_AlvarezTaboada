// Cliente de Supabase para el NAVEGADOR (Client Components: formularios y botones).
// Usa la clave pública: lo que puede hacer cada usuario lo limita el RLS de la base de datos.

import { createBrowserClient } from '@supabase/ssr'
import { OPCIONES_DE_COOKIES } from './cookies'

export function crearClienteNavegador() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { cookieOptions: OPCIONES_DE_COOKIES },
  )
}
