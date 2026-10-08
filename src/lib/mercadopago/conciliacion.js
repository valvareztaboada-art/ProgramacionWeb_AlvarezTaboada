// CONCILIACIÓN ACTIVA: en vez de esperar al webhook, le preguntamos a Mercado Pago
// qué pagos hay para un cobro y los aplicamos con la misma función segura del webhook.
//
// ¿Por qué hace falta? Si el webhook no llega (mala configuración, caída, demora),
// el cobro quedaría "pendiente" aunque el cliente haya pagado, y podría pagar dos veces.
// Es una función pura (las dependencias se reciben por parámetro), así que tiene tests.

import { referenciaExterna } from './preferencia.js'

// Cobros que vale la pena consultar: los que no están cerrados y ya se intentaron pagar
export function necesitaConciliar(pago) {
  return Boolean(pago.mp_preference_id) && (pago.estado === 'pendiente' || pago.estado === 'en_proceso')
}

// Aplica los pagos de Mercado Pago de un cobro, del más viejo al más nuevo
// (así un rechazo viejo no pisa una aprobación posterior).
// Devuelve true si algo cambió en la base.
export async function conciliarPago(pagoId, { buscarPagos, registrarPago }) {
  const pagosMP = await buscarPagos(referenciaExterna(pagoId))
  const ordenados = [...pagosMP].sort((a, b) => new Date(a.date_created) - new Date(b.date_created))

  let huboCambios = false
  for (const pagoMP of ordenados) {
    if (pagoMP.currency_id !== 'ARS') continue
    const resultado = await registrarPago({
      pagoId,
      paymentId: String(pagoMP.id),
      estado: pagoMP.status,
      monto: pagoMP.transaction_amount,
    })
    if (resultado.startsWith('actualizado')) huboCambios = true
  }
  return huboCambios
}
