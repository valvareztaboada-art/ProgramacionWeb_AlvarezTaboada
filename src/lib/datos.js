// Funciones para obtener datos. Solo se usan desde Server Components.
// Son async porque simulan una consulta a la base de datos (tardan un poquito).
// Cuando veamos Supabase, cambia el interior de cada función, pero las páginas quedan igual.

import { usuarios, mascotas, especialidades, turnos, vacunas, estudios, pagos } from '@/data/mockData'

// Para la vista del cliente simulamos que está logueada Ana.
// Con Supabase Auth esto sale de la sesión del usuario.
export const CLIENTE_ACTUAL = usuarios[0]

const esperar = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

// Busca al dueño/a por email. Si todavía no se registró, no hay usuario.
function conDuenio(registro) {
  const usuario = usuarios.find((u) => u.email === registro.emailDuenio)
  return {
    ...registro,
    duenio: usuario ? usuario.nombre : registro.emailDuenio,
    registrado: Boolean(usuario),
  }
}

// Agrega los datos de la mascota y su dueño/a a un registro (como un JOIN en SQL)
function conMascota(registro) {
  const mascota = conDuenio(mascotas.find((m) => m.id === registro.mascotaId))
  return {
    ...registro,
    mascota: mascota.nombre,
    duenio: mascota.duenio,
    emailDuenio: mascota.emailDuenio,
  }
}

function filtrar(lista, { emailDuenio, mascotaId } = {}) {
  return lista
    .map(conMascota)
    .filter((r) => (!emailDuenio || r.emailDuenio === emailDuenio) && (!mascotaId || r.mascotaId === mascotaId))
}

export async function obtenerMascotas({ emailDuenio } = {}) {
  await esperar()
  return mascotas
    .filter((m) => !emailDuenio || m.emailDuenio === emailDuenio)
    .map(conDuenio)
}

export async function obtenerMascota(id) {
  await esperar()
  const mascota = mascotas.find((m) => m.id === Number(id))
  return mascota ? conDuenio(mascota) : null
}

export async function obtenerTurnos(filtros) {
  await esperar()
  return filtrar(turnos, filtros)
}

export async function obtenerVacunas(filtros) {
  await esperar()
  return filtrar(vacunas, filtros)
}

export async function obtenerEstudios(filtros) {
  await esperar()
  return filtrar(estudios, filtros)
}

export async function obtenerPagos({ emailDuenio } = {}) {
  await esperar()
  return pagos
    .filter((p) => !emailDuenio || p.emailDuenio === emailDuenio)
    .map(conDuenio)
}

export async function obtenerEspecialidades() {
  await esperar()
  return especialidades
}

// Solo devuelve fecha y hora de los turnos tomados (sin datos de otras personas),
// porque esta información se le manda al navegador para marcar los horarios ocupados.
export async function obtenerHorariosOcupados() {
  await esperar()
  return turnos.map((t) => ({ fecha: t.fecha, hora: t.hora }))
}
