// PATCH /api/v1/cobros/:id → la veterinaria anula un cobro pendiente cargado por error.
// Body JSON: { estado: "anulado" }
// No se borra (es un registro de plata). Si el dueño/a igual lo paga por Mercado Pago,
// el webhook no lo acredita y lo marca para devolver (ver la migración anular_cobros).
// Códigos: 200 · 400 datos inválidos · 401/403 · 409 ya no está pendiente

import { conManejoDeErrores, leerJSON, validarCon, conflicto } from '@/lib/api/errores'
import { requerirVeterinaria } from '@/lib/api/sesion'
import { log } from '@/lib/api/log'
import { esquemaId, esquemaCambiosCobro } from '@/lib/esquemas'

export const PATCH = conManejoDeErrores(async (request, { params }) => {
  const { supabase, usuario } = await requerirVeterinaria()
  const { id } = await params
  const cobroId = validarCon(esquemaId, id)
  validarCon(esquemaCambiosCobro, await leerJSON(request))

  // La función controla en la base que sea la veterinaria y que el cobro siga pendiente
  const { error } = await supabase.rpc('anular_cobro', { p_pago_id: cobroId })
  if (error?.code === 'P0001') throw conflicto(error.message)
  if (error) throw new Error(error.message)

  log.info('cobros.anulado', { id: cobroId, por: usuario.id })
  return Response.json({ cobro: { id: cobroId, estado: 'anulado' } })
})
