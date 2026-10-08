// POST /api/webhooks/mercadopago
// Mercado Pago llama acá (servidor a servidor) cada vez que cambia un pago.
//
// Pasos (como en la clase):
//   1. Recibir la notificación
//   2. Validar la FIRMA con el Webhook Secret → si no es válida, 401 y no hacemos nada
//   3. Consultar el pago REAL en GET /v1/payments/:id (no confiamos en el cuerpo)
//   4. Conciliar en Supabase usando la external_reference (función registrar_pago_mp)
//   5. Responder: 200 si está todo bien (o si hay que ignorarla), 500 si falló algo
//      transitorio → Mercado Pago reintenta más tarde.
//
// Por qué procesamos ANTES de responder: en Vercel la función se corta al responder,
// y si respondiéramos 200 y después fallara, Mercado Pago no reintentaría y el pago
// quedaría desincronizado. Todo el proceso tarda menos de un segundo.

import { validarFirmaWebhook } from '@/lib/mercadopago/firma'
import { procesarNotificacionDePago } from '@/lib/mercadopago/webhook'
import { obtenerPagoMP } from '@/lib/mercadopago/api'
import { crearClienteAdmin } from '@/lib/supabase/admin'

async function registrarPago({ pagoId, paymentId, estado, monto }) {
  const { data, error } = await crearClienteAdmin().rpc('registrar_pago_mp', {
    p_pago_id: pagoId,
    p_mp_payment_id: paymentId,
    p_mp_estado: estado,
    p_monto: monto,
  })
  if (error) throw new Error(error.message)
  return data
}

export async function POST(request) {
  const url = new URL(request.url)
  let cuerpo = {}
  try {
    cuerpo = await request.json()
  } catch {
    // Algunas notificaciones viejas (IPN) vienen sin cuerpo: usamos los parámetros de la URL
  }

  const tipo = url.searchParams.get('type') ?? cuerpo.type ?? url.searchParams.get('topic')
  const dataId = url.searchParams.get('data.id') ?? cuerpo.data?.id

  // 2. Validar la firma
  const firmaValida = validarFirmaWebhook({
    xSignature: request.headers.get('x-signature'),
    xRequestId: request.headers.get('x-request-id'),
    dataId,
    secreto: process.env.MP_WEBHOOK_SECRET,
  })
  if (!firmaValida) {
    console.warn('[webhook] Firma inválida: notificación descartada', { tipo, dataId })
    return Response.json({ error: 'Firma inválida' }, { status: 401 })
  }

  // Solo nos interesan los pagos (ej: ignoramos "merchant_order")
  if (tipo !== 'payment') {
    return Response.json({ ok: true, motivo: `Notificación de tipo ${tipo} ignorada` })
  }

  // 3 y 4. Consultar el pago real y conciliar
  const resultado = await procesarNotificacionDePago(dataId, { consultarPago: obtenerPagoMP, registrarPago })
  console.info('[webhook] Pago', dataId, '→', resultado.motivo)

  // 5. Responder
  return Response.json(resultado, { status: resultado.reintentar ? 500 : 200 })
}
