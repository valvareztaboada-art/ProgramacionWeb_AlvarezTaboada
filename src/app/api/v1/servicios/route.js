// GET /api/v1/servicios?especie=Gatos → catálogo público de servicios que se pueden reservar
// (query param opcional para filtrar por especie). No necesita sesión.
// Códigos: 200 · 400 especie inválida

import { z } from 'zod'
import { conManejoDeErrores, validarCon } from '@/lib/api/errores'
import { obtenerServicios } from '@/lib/datos'
import { filtrarServicios, ESPECIES_DEL_CATALOGO } from '@/lib/servicios'

const esquemaFiltro = z.object({
  especie: z.enum(ESPECIES_DEL_CATALOGO, { error: `Elegí una especie: ${ESPECIES_DEL_CATALOGO.join(', ')}.` }).optional(),
})

export const GET = conManejoDeErrores(async (request) => {
  const { especie } = validarCon(esquemaFiltro, Object.fromEntries(new URL(request.url).searchParams))
  const servicios = filtrarServicios(await obtenerServicios(), especie)
  return Response.json({ servicios })
})
