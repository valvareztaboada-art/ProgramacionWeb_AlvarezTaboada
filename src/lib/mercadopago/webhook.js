// Qué hacemos cuando llega una notificación de pago (ya con la firma validada).
//
// Recibe las funciones que hablan con Mercado Pago y con la base como parámetros
// ("inyección de dependencias"): en la app son las reales y en los tests son de mentira.
//
// Devuelve { ok, reintentar, motivo }:
//   · reintentar = true → respondemos 500 y Mercado Pago vuelve a mandar la notificación más tarde
//   · reintentar = false → respondemos 200 (aunque la ignoremos), para que no la repita

import { pagoIdDesdeReferencia } from './preferencia.js'

export async function procesarNotificacionDePago(paymentId, { consultarPago, registrarPago }) {
  // 1. NO confiamos en el cuerpo del webhook: consultamos el pago real en la API de Mercado Pago
  let pagoMP
  try {
    pagoMP = await consultarPago(paymentId)
  } catch {
    return { ok: false, reintentar: true, motivo: 'No se pudo consultar el pago en Mercado Pago' }
  }

  if (!pagoMP) {
    // Ej: la notificación de prueba del panel de Mercado Pago usa un id que no existe
    return { ok: true, reintentar: false, motivo: 'El pago no existe en Mercado Pago' }
  }

  // 2. ¿Es un pago de MICAN? Lo sabemos por la external_reference
  const pagoId = pagoIdDesdeReferencia(pagoMP.external_reference)
  if (!pagoId) {
    return { ok: true, reintentar: false, motivo: 'El pago no pertenece a MICAN' }
  }

  if (pagoMP.currency_id !== 'ARS') {
    return { ok: true, reintentar: false, motivo: `Moneda inesperada: ${pagoMP.currency_id}` }
  }

  // 3. Conciliación en la base (la función SQL controla el monto y que no se "despague")
  try {
    const resultado = await registrarPago({
      pagoId,
      paymentId: String(pagoMP.id),
      estado: pagoMP.status,
      monto: pagoMP.transaction_amount,
    })
    return { ok: true, reintentar: false, motivo: resultado }
  } catch {
    return { ok: false, reintentar: true, motivo: 'No se pudo guardar el resultado en la base de datos' }
  }
}
