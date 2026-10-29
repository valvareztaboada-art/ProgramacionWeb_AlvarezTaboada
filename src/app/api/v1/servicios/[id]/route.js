// GET /api/v1/servicios/:id → un servicio del catálogo (ej: /api/v1/servicios/vacunacion)
// Códigos: 200 · 404 no existe

import { conManejoDeErrores, noEncontrado } from '@/lib/api/errores'
import { obtenerServicio } from '@/lib/datos'

export const GET = conManejoDeErrores(async (request, { params }) => {
  const { id } = await params
  const servicio = await obtenerServicio(id)
  if (!servicio) throw noEncontrado('No encontramos ese servicio.')
  return Response.json({ servicio })
})
