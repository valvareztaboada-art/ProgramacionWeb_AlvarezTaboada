// POST /api/v1/cobros → crea un cobro (solo la veterinaria)
//
// Body JSON: { mascotaId, concepto, monto, turnoId?, enEfectivo? }
//   · turnoId: el turno atendido del que sale el cobro (tiene que ser de esa mascota y estar atendido)
//   · enEfectivo: true si ya lo pagó en el mostrador → queda pagado en el mismo paso
//
// Códigos: 201 creado · 400 datos inválidos · 401/403 · 404 paciente o turno inexistente
//          409 el turno no está atendido

import { conManejoDeErrores, leerJSON, validarCon, noEncontrado, conflicto } from '@/lib/api/errores'
import { requerirVeterinaria } from '@/lib/api/sesion'
import { log } from '@/lib/api/log'
import { esquemaNuevoCobro } from '@/lib/esquemas'

export const POST = conManejoDeErrores(async (request) => {
  const { supabase, usuario } = await requerirVeterinaria()
  const { mascotaId, concepto, monto, turnoId, enEfectivo } = validarCon(esquemaNuevoCobro, await leerJSON(request))

  const { data: mascota } = await supabase.from('mascotas').select('id').eq('id', mascotaId).maybeSingle()
  if (!mascota) throw noEncontrado('No encontramos ese paciente.')

  if (turnoId) {
    const { data: turno } = await supabase.from('turnos').select('mascota_id, estado').eq('id', turnoId).maybeSingle()
    if (!turno || turno.mascota_id !== mascotaId) throw noEncontrado('No encontramos ese turno para este paciente.')
    if (turno.estado !== 'atendido') throw conflicto('Solo se cobran turnos marcados como atendidos.')
  }

  const { data: cobro, error } = await supabase
    .from('pagos')
    .insert({ mascota_id: mascotaId, concepto, monto, turno_id: turnoId ?? null })
    .select('id, concepto, monto, estado')
    .single()
  if (error) throw new Error(error.message)

  if (enEfectivo) {
    const { error: errorEfectivo } = await supabase.rpc('registrar_pago_efectivo', { p_pago_id: cobro.id })
    // El cobro ya quedó creado (pendiente): se puede marcar en efectivo después desde Cobros
    if (errorEfectivo) {
      log.warn('cobros.efectivo_fallido', { id: cobro.id, mensaje: errorEfectivo.message })
    } else {
      cobro.estado = 'pagado'
    }
  }

  log.info('cobros.creado', { id: cobro.id, turnoId: turnoId ?? null, estado: cobro.estado, por: usuario.id })
  return Response.json({ cobro }, { status: 201 })
})
