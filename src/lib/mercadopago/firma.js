// Validación de la FIRMA de los webhooks de Mercado Pago.
//
// Cualquiera podría mandar un POST a nuestro endpoint haciéndose pasar por Mercado Pago.
// Para evitarlo, Mercado Pago firma cada notificación con un secreto que solo conocemos
// nosotros y ellos (el "Webhook Secret" del panel de Mercado Pago).
//
// Cabeceras que manda Mercado Pago:
//   x-signature:  "ts=1704908010,v1=618c8534...e839"   (ts = momento, v1 = la firma)
//   x-request-id: "bb56a2f1-6aae-46ac-982e-9dcd3581d08e"
//
// Cómo se verifica:
//   1. Armamos el texto "id:<data.id>;request-id:<x-request-id>;ts:<ts>;"
//   2. Calculamos HMAC-SHA256 de ese texto con nuestro secreto
//   3. Si el resultado es igual a v1, la notificación es auténtica

import { createHmac, timingSafeEqual } from 'node:crypto'

// "ts=123,v1=abc" → { ts: '123', v1: 'abc' }
export function leerCabeceraDeFirma(xSignature) {
  const partes = {}
  for (const parte of (xSignature ?? '').split(',')) {
    const [clave, ...valor] = parte.split('=')
    if (clave && valor.length) partes[clave.trim()] = valor.join('=').trim()
  }
  return partes
}

// Texto que firma Mercado Pago. Si falta algún dato, esa parte no va.
export function armarManifiesto({ dataId, xRequestId, ts }) {
  // Mercado Pago indica pasar a minúsculas el data.id si es alfanumérico
  const id = dataId ? String(dataId).toLowerCase() : ''
  return [
    id && `id:${id};`,
    xRequestId && `request-id:${xRequestId};`,
    ts && `ts:${ts};`,
  ].filter(Boolean).join('')
}

export function calcularFirma(manifiesto, secreto) {
  return createHmac('sha256', secreto).update(manifiesto).digest('hex')
}

// Devuelve true solo si la firma es válida
export function validarFirmaWebhook({ xSignature, xRequestId, dataId, secreto }) {
  if (!secreto || !xSignature || !dataId) return false

  const { ts, v1 } = leerCabeceraDeFirma(xSignature)
  if (!ts || !v1 || !/^[0-9a-f]{64}$/i.test(v1)) return false

  const esperada = calcularFirma(armarManifiesto({ dataId, xRequestId, ts }), secreto)

  // timingSafeEqual compara en tiempo constante: no da pistas a quien intenta adivinar la firma
  return timingSafeEqual(Buffer.from(esperada, 'hex'), Buffer.from(v1.toLowerCase(), 'hex'))
}
