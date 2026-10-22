// /api/v1/pacientes  →  la colección de pacientes (sustantivo en plural, versionada)
//
//   GET  /api/v1/pacientes?buscar=luna&especie=Perro   lista (filtros opcionales: query params)
//   POST /api/v1/pacientes                               crea uno (datos en el body, JSON)
//
// Solo para la veterinaria (401 sin sesión, 403 con otro rol). Además, el RLS de la base
// vuelve a controlar cada consulta.

import { conManejoDeErrores, leerJSON, validarCon } from '@/lib/api/errores'
import { requerirVeterinaria } from '@/lib/api/sesion'
import { log } from '@/lib/api/log'
import { esquemaFiltroPacientes, esquemaNuevoPaciente, aFilaDeMascota, aPacienteDeLaApi } from '@/lib/esquemas'

export const GET = conManejoDeErrores(async (request) => {
  const { supabase } = await requerirVeterinaria()
  const parametros = Object.fromEntries(new URL(request.url).searchParams)
  const { buscar, especie } = validarCon(esquemaFiltroPacientes, parametros)

  let consulta = supabase.from('mascotas').select('*').order('nombre')
  if (especie) consulta = consulta.eq('especie', especie)
  // ilike: "contiene", sin importar mayúsculas. El esquema ya limitó los caracteres;
  // igual escapamos _ (comodín) y ponemos el valor entre comillas dentro del filtro.
  if (buscar) {
    const patron = `"%${buscar.replace(/_/g, '\\_')}%"`
    consulta = consulta.or(`nombre.ilike.${patron},email_duenio.ilike.${patron}`)
  }

  const { data, error } = await consulta
  if (error) throw new Error(error.message) // → 500 genérico (el detalle queda en el log)
  return Response.json({ pacientes: data.map(aPacienteDeLaApi) })
})

export const POST = conManejoDeErrores(async (request) => {
  const { supabase, usuario } = await requerirVeterinaria()
  const datos = validarCon(esquemaNuevoPaciente, await leerJSON(request))

  const { data, error } = await supabase.from('mascotas').insert(aFilaDeMascota(datos)).select('*').single()
  if (error) throw new Error(error.message)

  log.info('pacientes.creado', { id: data.id, por: usuario.id })
  // 201 Created + Location: dónde quedó el recurso nuevo
  return Response.json({ paciente: aPacienteDeLaApi(data) }, {
    status: 201,
    headers: { Location: `/api/v1/pacientes/${data.id}` },
  })
})
