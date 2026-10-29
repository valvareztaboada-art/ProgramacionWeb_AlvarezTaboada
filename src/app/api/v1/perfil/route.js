// PATCH /api/v1/perfil → cada persona (cliente o veterinaria) corrige SU nombre y teléfono.
// Body JSON: { nombre, telefono }
// El email y el rol no se cambian acá (el rol nunca lo elige el usuario: ver el RLS de perfiles).
// Códigos: 200 · 400 datos inválidos · 401 sin sesión

import { conManejoDeErrores, leerJSON, validarCon, sinSesion } from '@/lib/api/errores'
import { crearClienteServidor } from '@/lib/supabase/servidor'
import { log } from '@/lib/api/log'
import { esquemaPerfil } from '@/lib/esquemas'

export const PATCH = conManejoDeErrores(async (request) => {
  const supabase = await crearClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw sinSesion()

  const { nombre, telefono } = validarCon(esquemaPerfil, await leerJSON(request))

  // El RLS solo deja modificar el perfil propio, y solo las columnas nombre y teléfono
  const { data, error } = await supabase.from('perfiles').update({ nombre, telefono }).eq('id', user.id)
    .select('nombre, telefono').single()
  if (error) throw new Error(error.message)

  log.info('perfil.modificado', { por: user.id })
  return Response.json({ perfil: data })
})
