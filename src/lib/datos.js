// Funciones para obtener datos de Supabase. Solo se usan desde Server Components.
//
// IMPORTANTE: acá NO filtramos "lo de cada usuario". Eso lo hace el RLS de la base:
// si la que pide es la veterinaria, Supabase devuelve todo; si es un cliente,
// devuelve solo lo de sus mascotas. La misma consulta sirve para los dos.

import { cache } from 'react'
import { crearClienteServidor } from '@/lib/supabase/servidor'

// Si una consulta falla, mostramos el error (lo atrapa el error boundary de Next)
function revisar({ data, error }) {
  if (error) throw new Error(`Error al consultar Supabase: ${error.message}`)
  return data
}

// Usuario logueado + su perfil. cache() evita repetir la consulta si en el mismo
// pedido la llaman el layout y la página.
export const obtenerUsuarioActual = cache(async () => {
  const supabase = await crearClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('nombre, email, rol')
    .eq('id', user.id)
    .single()

  return {
    id: user.id,
    email: user.email,
    nombre: perfil?.nombre || user.email,
    rol: perfil?.rol ?? 'cliente',
  }
})

// email → nombre de los dueños/as que ya tienen cuenta
async function obtenerNombresDeDuenios(supabase, emails) {
  if (emails.length === 0) return new Map()
  const perfiles = revisar(await supabase.from('perfiles').select('email, nombre').in('email', emails))
  return new Map(perfiles.map((p) => [p.email, p.nombre || p.email]))
}

// Pasa una fila de "mascotas" al formato que usan los componentes
function aMascota(fila, duenios) {
  return {
    id: fila.id,
    nombre: fila.nombre,
    especie: fila.especie,
    raza: fila.raza ?? '',
    edad: fila.edad,
    emailDuenio: fila.email_duenio,
    duenio: duenios.get(fila.email_duenio) ?? fila.email_duenio,
    registrado: duenios.has(fila.email_duenio),
  }
}

// Agrega los datos de la mascota y su dueño/a a turnos, vacunas, estudios y pagos
async function conMascota(supabase, filas) {
  const emails = [...new Set(filas.map((f) => f.mascotas.email_duenio))]
  const duenios = await obtenerNombresDeDuenios(supabase, emails)
  return filas.map(({ mascotas: m, mascota_id, ...resto }) => ({
    ...resto,
    mascotaId: mascota_id,
    mascota: m.nombre,
    emailDuenio: m.email_duenio,
    duenio: duenios.get(m.email_duenio) ?? m.email_duenio,
  }))
}

export async function obtenerMascotas() {
  const supabase = await crearClienteServidor()
  const filas = revisar(await supabase.from('mascotas').select('*').order('nombre'))
  const duenios = await obtenerNombresDeDuenios(supabase, [...new Set(filas.map((f) => f.email_duenio))])
  return filas.map((f) => aMascota(f, duenios))
}

// Devuelve null si no existe O si el usuario no tiene permiso para verla (RLS)
export async function obtenerMascota(id) {
  if (!/^\d+$/.test(String(id))) return null
  const supabase = await crearClienteServidor()
  const fila = revisar(await supabase.from('mascotas').select('*').eq('id', id).maybeSingle())
  if (!fila) return null
  const duenios = await obtenerNombresDeDuenios(supabase, [fila.email_duenio])
  return aMascota(fila, duenios)
}

export async function obtenerTurnos({ mascotaId } = {}) {
  const supabase = await crearClienteServidor()
  let consulta = supabase
    .from('turnos')
    .select('id, fecha, hora, motivo, estado, mascota_id, mascotas(nombre, email_duenio), especialidades(nombre)')
    .order('fecha')
    .order('hora')
  if (mascotaId) consulta = consulta.eq('mascota_id', mascotaId)

  const filas = await conMascota(supabase, revisar(await consulta))
  return filas.map(({ especialidades, hora, ...t }) => ({
    ...t,
    hora: hora.slice(0, 5), // "10:00:00" → "10:00"
    especialidad: especialidades.nombre,
  }))
}

export async function obtenerVacunas({ mascotaId } = {}) {
  const supabase = await crearClienteServidor()
  let consulta = supabase.from('vacunas').select('*, mascotas(nombre, email_duenio)').order('fecha')
  if (mascotaId) consulta = consulta.eq('mascota_id', mascotaId)
  return conMascota(supabase, revisar(await consulta))
}

export async function obtenerEstudios({ mascotaId } = {}) {
  const supabase = await crearClienteServidor()
  let consulta = supabase.from('estudios').select('*, mascotas(nombre, email_duenio)').order('fecha', { ascending: false })
  if (mascotaId) consulta = consulta.eq('mascota_id', mascotaId)
  return conMascota(supabase, revisar(await consulta))
}

export async function obtenerPagos() {
  const supabase = await crearClienteServidor()
  const filas = revisar(await supabase.from('pagos').select('*, mascotas(nombre, email_duenio)').order('creado_en', { ascending: false }))
  return conMascota(supabase, filas)
}

export async function obtenerEspecialidades() {
  const supabase = await crearClienteServidor()
  return revisar(await supabase.from('especialidades').select('id, nombre, icono, descripcion').order('orden'))
}

// Solo fecha y hora de los turnos tomados (sin datos de otras personas)
export async function obtenerHorariosOcupados() {
  const supabase = await crearClienteServidor()
  const filas = revisar(await supabase.rpc('horarios_ocupados'))
  return filas.map((t) => ({ fecha: t.fecha, hora: t.hora.slice(0, 5) }))
}
