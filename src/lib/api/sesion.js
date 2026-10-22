// Autenticación y autorización para los Route Handlers.
//   · sin sesión          → 401 Unauthorized (no sabemos quién es)
//   · sesión, otro rol    → 403 Forbidden   (sabemos quién es, pero no puede)
// Además, cada consulta usa la sesión del usuario: el RLS de la base vuelve a controlar todo.

import { crearClienteServidor } from '@/lib/supabase/servidor'
import { sinSesion, sinPermiso } from './errores'

export async function requerirRol(rol, mensajeSinPermiso) {
  const supabase = await crearClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw sinSesion()

  const { data: perfil } = await supabase.from('perfiles').select('rol').eq('id', user.id).single()
  if (perfil?.rol !== rol) throw sinPermiso(mensajeSinPermiso)

  return { supabase, usuario: user }
}

export const requerirVeterinaria = () => requerirRol('veterinaria', 'Solo la veterinaria puede hacer esto.')
export const requerirCliente = (mensaje) => requerirRol('cliente', mensaje)
