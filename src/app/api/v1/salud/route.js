// GET /api/v1/salud → chequeo de salud (health check) del sitio.
// Responde 200 si el sitio y la base de datos funcionan, 503 si la base no responde.
// Sirve para monitoreo (observabilidad) y, de paso, registra el "latido" que mantiene
// activo el proyecto gratuito de Supabase (ver la migración latido.sql).
// Lo llama cron-job.org dos veces por día. No necesita sesión y no devuelve datos privados.

import { createClient } from '@supabase/supabase-js'
import { conManejoDeErrores, ErrorDeApi } from '@/lib/api/errores'
import { log } from '@/lib/api/log'

export const GET = conManejoDeErrores(async () => {
  // Cliente sin sesión (clave pública): la función registrar_latido está permitida para "anon"
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false } },
  )

  const inicio = Date.now()
  const { data: latido, error } = await supabase.rpc('registrar_latido')
  const milisegundos = Date.now() - inicio

  if (error) {
    log.error('salud.base_caida', { mensaje: error.message, milisegundos })
    throw new ErrorDeApi(503, 'La base de datos no responde.')
  }

  log.info('salud.ok', { milisegundos })
  return Response.json(
    { estado: 'ok', base: 'ok', latido, milisegundos },
    { headers: { 'Cache-Control': 'no-store' } }, // que nunca responda una copia guardada
  )
})
