// Funciones para obtener datos. Solo se usan desde Server Components.
// Son async porque simulan una consulta a la base de datos (tardan un poquito).
// Cuando veamos Supabase, cambia el interior de cada función, pero las páginas quedan igual.

import { mascotas, turnos, vacunas, estudios, pagos } from '@/data/mockData'

// Para la vista del cliente simulamos que está logueada "Ana Gómez".
// Con Supabase Auth esto sale de la sesión del usuario.
export const CLIENTE_ACTUAL = 'Ana Gómez'

const esperar = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

// Agrega el nombre de la mascota y su dueño/a a un registro (como un JOIN en SQL)
function conMascota(registro) {
  const mascota = mascotas.find((m) => m.id === registro.mascotaId)
  return { ...registro, mascota: mascota.nombre, duenio: mascota.duenio }
}

function filtrar(lista, { duenio, mascotaId } = {}) {
  return lista
    .map(conMascota)
    .filter((r) => (!duenio || r.duenio === duenio) && (!mascotaId || r.mascotaId === mascotaId))
}

export async function obtenerMascotas({ duenio } = {}) {
  await esperar()
  return mascotas.filter((m) => !duenio || m.duenio === duenio)
}

export async function obtenerMascota(id) {
  await esperar()
  return mascotas.find((m) => m.id === Number(id)) ?? null
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

export async function obtenerPagos({ duenio } = {}) {
  await esperar()
  return pagos.filter((p) => !duenio || p.duenio === duenio)
}
