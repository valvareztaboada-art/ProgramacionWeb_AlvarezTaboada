// Route Handler: acá vuelve el usuario cuando toca el enlace del email de confirmación.
// Supabase manda un "code" en la URL; lo cambiamos por una sesión (se guardan las cookies)
// y lo mandamos a su panel.

import { NextResponse } from 'next/server'
import { crearClienteServidor } from '@/lib/supabase/servidor'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const tipo = searchParams.get('type')

  const supabase = await crearClienteServidor()
  let error = new Error('Enlace inválido')

  if (code) {
    // Flujo por defecto de Supabase (PKCE)
    ;({ error } = await supabase.auth.exchangeCodeForSession(code))
  } else if (tokenHash && tipo) {
    // Por si se personaliza la plantilla del email con {{ .TokenHash }}
    ;({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tipo }))
  }

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=confirmacion`)
  }
  return NextResponse.redirect(`${origin}/cliente`)
}
