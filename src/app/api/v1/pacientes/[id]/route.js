// /api/v1/pacientes/:id  →  un paciente puntual (el id es un route param)
//
//   GET    /api/v1/pacientes/12   lo trae
//   PATCH  /api/v1/pacientes/12   modifica SOLO los campos que vienen en el body
//   DELETE /api/v1/pacientes/12   lo elimina con su historial (turnos, vacunas, estudios, cobros pendientes)
//
// Códigos: 200 ok · 400 datos inválidos · 401 sin sesión · 403 no es veterinaria
//          404 no existe · 409 no se puede eliminar (tiene pagos registrados)

import { conManejoDeErrores, leerJSON, validarCon, noEncontrado, conflicto } from '@/lib/api/errores'
import { requerirVeterinaria } from '@/lib/api/sesion'
import { log } from '@/lib/api/log'
import { esquemaId, esquemaCambiosPaciente, aFilaDeMascota, aPacienteDeLaApi } from '@/lib/esquemas'

const NO_EXISTE = 'No encontramos ese paciente.'

async function idDeLaRuta(params) {
  const { id } = await params
  return validarCon(esquemaId, id)
}

export const GET = conManejoDeErrores(async (request, { params }) => {
  const { supabase } = await requerirVeterinaria()
  const id = await idDeLaRuta(params)

  const { data, error } = await supabase.from('mascotas').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw noEncontrado(NO_EXISTE)
  return Response.json({ paciente: aPacienteDeLaApi(data) })
})

export const PATCH = conManejoDeErrores(async (request, { params }) => {
  const { supabase, usuario } = await requerirVeterinaria()
  const id = await idDeLaRuta(params)
  const cambios = validarCon(esquemaCambiosPaciente, await leerJSON(request))

  const { data, error } = await supabase.from('mascotas').update(aFilaDeMascota(cambios)).eq('id', id).select('*')
  if (error) throw new Error(error.message)
  if (data.length === 0) throw noEncontrado(NO_EXISTE)

  log.info('pacientes.modificado', { id, campos: Object.keys(cambios), por: usuario.id })
  return Response.json({ paciente: aPacienteDeLaApi(data[0]) })
})

export const DELETE = conManejoDeErrores(async (request, { params }) => {
  const { supabase, usuario } = await requerirVeterinaria()
  const id = await idDeLaRuta(params)

  // Los archivos de los estudios están en Storage: los anotamos antes de que se borren las filas
  const { data: estudios } = await supabase.from('estudios').select('archivo_path').eq('mascota_id', id)
  const archivos = (estudios ?? []).map((e) => e.archivo_path).filter(Boolean)

  const { data, error } = await supabase.from('mascotas').delete().eq('id', id).select('id, nombre')
  // P0001: la regla de la base (trigger) que no deja borrar si hay pagos registrados
  if (error?.code === 'P0001') throw conflicto(error.message)
  if (error) throw new Error(error.message)
  if (data.length === 0) throw noEncontrado(NO_EXISTE)

  if (archivos.length > 0) {
    const { error: errorArchivos } = await supabase.storage.from('estudios').remove(archivos)
    // La mascota ya no existe: si falla, solo quedan archivos sueltos. Lo dejamos en el log.
    if (errorArchivos) log.warn('pacientes.archivos_sin_borrar', { id, archivos, mensaje: errorArchivos.message })
  }

  log.info('pacientes.eliminado', { id, nombre: data[0].nombre, archivos: archivos.length, por: usuario.id })
  return Response.json({ eliminado: { id, nombre: data[0].nombre } })
})
