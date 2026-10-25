// DELETE /api/v1/vacunas/:id → la veterinaria elimina una dosis cargada por error.
// Si era la última dosis de esa vacuna, la "próxima" vuelve a calcularse con la anterior.
// Códigos: 200 · 400 id inválido · 401/403 · 404 no existe

import { conManejoDeErrores, validarCon, noEncontrado } from '@/lib/api/errores'
import { requerirVeterinaria } from '@/lib/api/sesion'
import { log } from '@/lib/api/log'
import { esquemaId } from '@/lib/esquemas'

export const DELETE = conManejoDeErrores(async (request, { params }) => {
  const { supabase, usuario } = await requerirVeterinaria()
  const { id } = await params
  const vacunaId = validarCon(esquemaId, id)

  const { data, error } = await supabase.from('vacunas').delete().eq('id', vacunaId).select('id, vacuna, mascota_id')
  if (error) throw new Error(error.message)
  if (data.length === 0) throw noEncontrado('No encontramos esa vacuna.')

  log.info('vacunas.eliminada', { id: vacunaId, mascotaId: data[0].mascota_id, por: usuario.id })
  return Response.json({ eliminada: { id: vacunaId, vacuna: data[0].vacuna } })
})
