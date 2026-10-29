// DELETE /api/v1/estudios/:id → la veterinaria elimina un estudio (y su archivo en Storage).
// Códigos: 200 · 400 id inválido · 401/403 · 404 no existe

import { conManejoDeErrores, validarCon, noEncontrado } from '@/lib/api/errores'
import { requerirVeterinaria } from '@/lib/api/sesion'
import { log } from '@/lib/api/log'
import { esquemaId } from '@/lib/esquemas'

export const DELETE = conManejoDeErrores(async (request, { params }) => {
  const { supabase, usuario } = await requerirVeterinaria()
  const { id } = await params
  const estudioId = validarCon(esquemaId, id)

  const { data, error } = await supabase.from('estudios').delete().eq('id', estudioId).select('id, titulo, archivo_path')
  if (error) throw new Error(error.message)
  if (data.length === 0) throw noEncontrado('No encontramos ese estudio.')

  const { archivo_path: archivo } = data[0]
  if (archivo) {
    const { error: errorArchivo } = await supabase.storage.from('estudios').remove([archivo])
    // El estudio ya no existe: si falla, solo queda un archivo suelto. Lo dejamos en el log.
    if (errorArchivo) log.warn('estudios.archivo_sin_borrar', { id: estudioId, archivo, mensaje: errorArchivo.message })
  }

  log.info('estudios.eliminado', { id: estudioId, conArchivo: Boolean(archivo), por: usuario.id })
  return Response.json({ eliminado: { id: estudioId, titulo: data[0].titulo } })
})
