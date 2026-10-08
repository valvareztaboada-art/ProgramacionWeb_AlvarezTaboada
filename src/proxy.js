// Proxy (en Next.js 16 reemplaza a "middleware"): se ejecuta ANTES de cada página.
// 1. Renueva la sesión de Supabase si está por vencer (actualiza las cookies).
// 2. Si alguien sin sesión entra a /cliente o /veterinaria, lo manda al login.
// El control de ROL (cliente o veterinaria) lo hacen los layouts de cada sección,
// y lo que cada uno puede ver o modificar lo controla el RLS de la base de datos.

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request) {
  let respuesta = NextResponse.next({ request })

  // Sin las variables de Supabase (ej: falta el .env.local) no hay sesión que revisar.
  // Dejamos pasar para que al menos las páginas públicas funcionen.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    console.warn('Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (ver .env.example)')
    return respuesta
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesAGuardar, encabezados) {
          cookiesAGuardar.forEach(({ name, value }) => request.cookies.set(name, value))
          respuesta = NextResponse.next({ request })
          cookiesAGuardar.forEach(({ name, value, options }) => respuesta.cookies.set(name, value, options))
          // Evita que una página con la sesión de alguien quede guardada en caché
          Object.entries(encabezados ?? {}).forEach(([clave, valor]) => respuesta.headers.set(clave, valor))
        },
      },
    },
  )

  // getClaims() verifica la sesión (y la renueva si hace falta)
  const { data } = await supabase.auth.getClaims()
  const haySesion = Boolean(data?.claims)

  const ruta = request.nextUrl.pathname
  const esPrivada = ruta.startsWith('/cliente') || ruta.startsWith('/veterinaria')

  if (esPrivada && !haySesion) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return respuesta
}

export const config = {
  // No hace falta correr el proxy para archivos estáticos (JS, CSS, imágenes)
  // ni para el webhook de Mercado Pago (no tiene sesión: se protege con la firma)
  matcher: ['/((?!api/webhooks|_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
