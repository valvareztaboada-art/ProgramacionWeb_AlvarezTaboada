// Llamadas a la API de Mercado Pago con fetch.
// Usan el ACCESS TOKEN, que es secreto: por eso este archivo es 'server-only'
// y la variable no empieza con NEXT_PUBLIC_.

import 'server-only'
import { randomUUID } from 'node:crypto'

const API = 'https://api.mercadopago.com'

function accessToken() {
  const token = process.env.MP_ACCESS_TOKEN
  if (!token) throw new Error('Falta la variable de entorno MP_ACCESS_TOKEN')
  return token
}

// POST /checkout/preferences → { id, init_point, sandbox_init_point }
export async function crearPreferencia(preferencia) {
  const respuesta = await fetch(`${API}/checkout/preferences`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      'Content-Type': 'application/json',
      // Si el pedido se reintenta por un corte, Mercado Pago no crea dos preferencias
      'X-Idempotency-Key': randomUUID(),
    },
    body: JSON.stringify(preferencia),
    signal: AbortSignal.timeout(10000),
  })

  if (!respuesta.ok) {
    const detalle = await respuesta.text()
    throw new Error(`Mercado Pago respondió ${respuesta.status} al crear la preferencia: ${detalle}`)
  }
  return respuesta.json()
}

// URL a la que mandamos al usuario para pagar.
// Con credenciales viejas de prueba ("TEST-...") se usa la URL de sandbox.
export function urlDeCheckout(preferencia) {
  if (accessToken().startsWith('TEST-') && preferencia.sandbox_init_point) {
    return preferencia.sandbox_init_point
  }
  return preferencia.init_point
}

// GET /v1/payments/:id → el estado REAL del pago (o null si no existe)
export async function obtenerPagoMP(paymentId) {
  if (!/^\d+$/.test(String(paymentId))) return null

  const respuesta = await fetch(`${API}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken()}` },
    signal: AbortSignal.timeout(10000),
    cache: 'no-store',
  })

  if (respuesta.status === 404) return null
  if (!respuesta.ok) throw new Error(`Mercado Pago respondió ${respuesta.status} al consultar el pago ${paymentId}`)
  return respuesta.json()
}
