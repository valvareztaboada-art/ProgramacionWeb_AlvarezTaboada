// PATCH /api/v1/turnos/:id → la veterinaria cambia el estado de un turno
// (confirmado, atendido, ausente, cancelado) o marca que no se cobra (sinCargo).
//
// Body JSON: { estado?, sinCargo? } (al menos uno)
// Códigos: 200 · 400 datos inválidos · 401/403 · 404 no existe · 409 el turno ya está cerrado

import { conManejoDeErrores, leerJSON, validarCon, noEncontrado, conflicto } from '@/lib/api/errores'
import { requerirVeterinaria } from '@/lib/api/sesion'
import { log } from '@/lib/api/log'
import { esquemaId, esquemaCambiosTurno } from '@/lib/esquemas'

// Solo los turnos activos cambian de estado. Un turno ya cerrado no se "reabre" desde acá.
const ACTIVOS = ['pendiente', 'confirmado']

export const PATCH = conManejoDeErrores(async (request, { params }) => {
  const { supabase, usuario } = await requerirVeterinaria()
  const { id } = await params
  const turnoId = validarCon(esquemaId, id)
  const { estado, sinCargo } = validarCon(esquemaCambiosTurno, await leerJSON(request))

  const { data: turno } = await supabase.from('turnos').select('id, estado').eq('id', turnoId).maybeSingle()
  if (!turno) throw noEncontrado('No encontramos ese turno.')
  if (estado && !ACTIVOS.includes(turno.estado)) throw conflicto('Este turno ya está cerrado.')
  if (sinCargo !== undefined && (estado ?? turno.estado) !== 'atendido') {
    throw conflicto('Solo un turno atendido puede marcarse como "no se cobra".')
  }

  const cambios = {}
  if (estado) cambios.estado = estado
  if (sinCargo !== undefined) cambios.sin_cargo = sinCargo

  const { data, error } = await supabase.from('turnos').update(cambios).eq('id', turnoId)
    .select('id, estado, sin_cargo').single()
  if (error) throw new Error(error.message)

  log.info('turnos.modificado', { id: turnoId, ...cambios, por: usuario.id })
  return Response.json({ turno: { id: data.id, estado: data.estado, sinCargo: data.sin_cargo } })
})
