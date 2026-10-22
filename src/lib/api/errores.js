// Manejo de errores CENTRALIZADO para todos los Route Handlers de la API.
// Es el equivalente al "Global Error Middleware" de la clase:
//
//   handler → si algo falla, el error se propaga → conManejoDeErrores lo captura,
//   lo registra completo en los logs (para nosotros) y le responde al cliente un JSON
//   SIN detalles internos (nada de stack traces, nombres de tablas ni versiones).
//
// Los errores "esperables" (datos inválidos, sin sesión, sin permiso, no existe...)
// se lanzan como ErrorDeApi con su código HTTP y un mensaje pensado para la persona.
// Cualquier otro error es una falla imprevista → 500 con un mensaje genérico.

import { log } from './log.js'

export class ErrorDeApi extends Error {
  constructor(status, mensaje, detalles) {
    super(mensaje)
    this.status = status
    this.detalles = detalles // ej: { nombre: 'Ingresá el nombre…' } en un 400
  }
}

// Atajos con el código HTTP correcto para cada caso
export const datosInvalidos = (detalles) => new ErrorDeApi(400, 'Hay datos inválidos. Revisá el formulario.', detalles)
export const sinSesion = () => new ErrorDeApi(401, 'Tu sesión venció. Volvé a ingresar.')
export const sinPermiso = (mensaje = 'No tenés permiso para hacer esto.') => new ErrorDeApi(403, mensaje)
export const noEncontrado = (mensaje = 'No encontramos lo que buscabas.') => new ErrorDeApi(404, mensaje)
export const conflicto = (mensaje) => new ErrorDeApi(409, mensaje)

export function respuestaDeError(error, contexto = {}) {
  if (error instanceof ErrorDeApi) {
    // Los 4xx son errores del pedido: alcanza con un aviso en los logs
    if (error.status >= 500) log.error('api.error', { ...contexto, status: error.status, mensaje: error.message })
    else log.warn('api.pedido_rechazado', { ...contexto, status: error.status, mensaje: error.message })
    const cuerpo = { error: error.message }
    if (error.detalles) cuerpo.detalles = error.detalles
    return Response.json(cuerpo, { status: error.status })
  }

  // Falla imprevista: TODO al log interno, NADA de detalles al cliente
  log.error('api.error_inesperado', { ...contexto, mensaje: error?.message, stack: error?.stack })
  return Response.json(
    { error: 'Ocurrió un error inesperado. Probá de nuevo en unos minutos.' },
    { status: 500 },
  )
}

// Envuelve un Route Handler: export const GET = conManejoDeErrores(async (request, contexto) => { ... })
export function conManejoDeErrores(handler) {
  return async function (request, contexto) {
    try {
      return await handler(request, contexto)
    } catch (error) {
      const url = new URL(request.url)
      return respuestaDeError(error, { metodo: request.method, ruta: url.pathname })
    }
  }
}

// Lee el cuerpo JSON del pedido; si no es JSON válido → 400
export async function leerJSON(request) {
  try {
    return await request.json()
  } catch {
    throw new ErrorDeApi(400, 'El cuerpo del pedido tiene que ser un JSON válido.')
  }
}

// Valida con un esquema de Zod. Si no cumple → 400 con el error de cada campo.
export function validarCon(esquema, datos) {
  const resultado = esquema.safeParse(datos)
  if (resultado.success) return resultado.data
  const detalles = {}
  for (const problema of resultado.error.issues) {
    const campo = problema.path.join('.') || 'general'
    detalles[campo] ??= problema.message // el primer error de cada campo
  }
  throw datosInvalidos(detalles)
}
