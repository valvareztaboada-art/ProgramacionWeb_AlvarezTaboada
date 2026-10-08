import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validarFirmaWebhook, armarManifiesto, calcularFirma, leerCabeceraDeFirma } from '../src/lib/mercadopago/firma.js'
import { armarPreferencia, referenciaExterna, pagoIdDesdeReferencia } from '../src/lib/mercadopago/preferencia.js'
import { procesarNotificacionDePago } from '../src/lib/mercadopago/webhook.js'
import { conciliarPago, necesitaConciliar } from '../src/lib/mercadopago/conciliacion.js'

const SECRETO = 'secreto-de-prueba'
const REQUEST_ID = 'bb56a2f1-6aae-46ac-982e-9dcd3581d08e'
const TS = '1704908010'

// Arma una cabecera x-signature como la mandaría Mercado Pago
function firmar(dataId, { secreto = SECRETO, ts = TS, requestId = REQUEST_ID } = {}) {
  const v1 = calcularFirma(armarManifiesto({ dataId, xRequestId: requestId, ts }), secreto)
  return `ts=${ts},v1=${v1}`
}

// ---------- Firma del webhook ----------

test('firma: arma el manifiesto con el formato de Mercado Pago', () => {
  assert.equal(armarManifiesto({ dataId: '123', xRequestId: 'abc', ts: '99' }), 'id:123;request-id:abc;ts:99;')
  assert.equal(armarManifiesto({ dataId: 'ABC', ts: '99' }), 'id:abc;ts:99;')
})

test('firma: lee la cabecera x-signature', () => {
  assert.deepEqual(leerCabeceraDeFirma('ts=1, v1=abc'), { ts: '1', v1: 'abc' })
  assert.deepEqual(leerCabeceraDeFirma(null), {})
})

test('firma: acepta una notificación firmada correctamente', () => {
  assert.equal(validarFirmaWebhook({ xSignature: firmar('123'), xRequestId: REQUEST_ID, dataId: '123', secreto: SECRETO }), true)
})

test('firma: rechaza si cambiaron el id del pago (el ataque típico)', () => {
  assert.equal(validarFirmaWebhook({ xSignature: firmar('123'), xRequestId: REQUEST_ID, dataId: '999', secreto: SECRETO }), false)
})

test('firma: rechaza si la firmaron con otro secreto', () => {
  const xSignature = firmar('123', { secreto: 'otro-secreto' })
  assert.equal(validarFirmaWebhook({ xSignature, xRequestId: REQUEST_ID, dataId: '123', secreto: SECRETO }), false)
})

test('firma: rechaza si cambiaron el request-id o el momento', () => {
  assert.equal(validarFirmaWebhook({ xSignature: firmar('123'), xRequestId: 'otro', dataId: '123', secreto: SECRETO }), false)
  const conOtroTs = firmar('123').replace(`ts=${TS}`, 'ts=1')
  assert.equal(validarFirmaWebhook({ xSignature: conOtroTs, xRequestId: REQUEST_ID, dataId: '123', secreto: SECRETO }), false)
})

test('firma: rechaza cabeceras faltantes o mal formadas, y si no hay secreto configurado', () => {
  const base = { xRequestId: REQUEST_ID, dataId: '123', secreto: SECRETO }
  assert.equal(validarFirmaWebhook({ ...base, xSignature: null }), false)
  assert.equal(validarFirmaWebhook({ ...base, xSignature: 'cualquier cosa' }), false)
  assert.equal(validarFirmaWebhook({ ...base, xSignature: `ts=${TS},v1=corta` }), false)
  assert.equal(validarFirmaWebhook({ ...base, xSignature: firmar('123'), secreto: '' }), false)
  assert.equal(validarFirmaWebhook({ ...base, xSignature: firmar('123'), dataId: null }), false)
})

// ---------- Preferencia ----------

const PAGO = { id: 12, concepto: 'Consulta Luna', monto: '25000.00', mascota: 'Luna' }

test('preferencia: usa el monto de la base, en pesos, y la external_reference del pago', () => {
  const pref = armarPreferencia({ pago: PAGO, origen: 'https://mican-five.vercel.app' })
  assert.equal(pref.items[0].unit_price, 25000)
  assert.equal(pref.items[0].currency_id, 'ARS')
  assert.equal(pref.items[0].quantity, 1)
  assert.equal(pref.external_reference, 'mican-pago-12')
})

test('preferencia: las tres back_urls vuelven a la página de resultado', () => {
  const pref = armarPreferencia({ pago: PAGO, origen: 'https://mican-five.vercel.app' })
  const esperada = 'https://mican-five.vercel.app/cliente/pagos/resultado?pago=12'
  assert.deepEqual(pref.back_urls, { success: esperada, pending: esperada, failure: esperada })
  assert.equal(pref.auto_return, 'approved')
})

test('preferencia: en localhost no usa auto_return (Mercado Pago lo rechaza)', () => {
  const pref = armarPreferencia({ pago: PAGO, origen: 'http://localhost:3000' })
  assert.equal(pref.auto_return, undefined)
})

test('external_reference: ida y vuelta, y rechaza referencias ajenas', () => {
  assert.equal(pagoIdDesdeReferencia(referenciaExterna(45)), 45)
  assert.equal(pagoIdDesdeReferencia('otra-app-45'), null)
  assert.equal(pagoIdDesdeReferencia('mican-pago-45; drop table pagos'), null)
  assert.equal(pagoIdDesdeReferencia(null), null)
})

// ---------- Procesamiento de la notificación ----------

const pagoAprobado = { id: 555, status: 'approved', external_reference: 'mican-pago-12', transaction_amount: 25000, currency_id: 'ARS' }

test('webhook: consulta el pago real y registra lo que dice la API (no el cuerpo del webhook)', async () => {
  let registrado
  const r = await procesarNotificacionDePago('555', {
    consultarPago: async (id) => ({ ...pagoAprobado, id: Number(id) }),
    registrarPago: async (datos) => { registrado = datos; return 'actualizado: pendiente → pagado' },
  })
  assert.deepEqual(registrado, { pagoId: 12, paymentId: '555', estado: 'approved', monto: 25000 })
  assert.deepEqual(r, { ok: true, reintentar: false, motivo: 'actualizado: pendiente → pagado' })
})

test('webhook: si Mercado Pago no responde, pide que reintenten', async () => {
  const r = await procesarNotificacionDePago('555', {
    consultarPago: async () => { throw new Error('timeout') },
    registrarPago: async () => assert.fail('no debería registrar'),
  })
  assert.equal(r.reintentar, true)
})

test('webhook: si falla la base de datos, pide que reintenten', async () => {
  const r = await procesarNotificacionDePago('555', {
    consultarPago: async () => pagoAprobado,
    registrarPago: async () => { throw new Error('db caída') },
  })
  assert.equal(r.reintentar, true)
})

test('webhook: ignora (sin reintentos) pagos inexistentes, ajenos a MICAN o en otra moneda', async () => {
  const noRegistrar = async () => assert.fail('no debería registrar')
  const inexistente = await procesarNotificacionDePago('1', { consultarPago: async () => null, registrarPago: noRegistrar })
  const ajeno = await procesarNotificacionDePago('1', { consultarPago: async () => ({ ...pagoAprobado, external_reference: 'otra-tienda-12' }), registrarPago: noRegistrar })
  const dolares = await procesarNotificacionDePago('1', { consultarPago: async () => ({ ...pagoAprobado, currency_id: 'USD' }), registrarPago: noRegistrar })
  for (const r of [inexistente, ajeno, dolares]) {
    assert.equal(r.ok, true)
    assert.equal(r.reintentar, false)
  }
})

// ---------- Conciliación activa ----------

test('conciliación: solo consulta cobros abiertos que ya se intentaron pagar', () => {
  assert.equal(necesitaConciliar({ estado: 'pendiente', mp_preference_id: 'pref' }), true)
  assert.equal(necesitaConciliar({ estado: 'en_proceso', mp_preference_id: 'pref' }), true)
  assert.equal(necesitaConciliar({ estado: 'pendiente', mp_preference_id: null }), false)
  assert.equal(necesitaConciliar({ estado: 'pagado', mp_preference_id: 'pref' }), false)
})

test('conciliación: busca por external_reference y aplica los pagos del más viejo al más nuevo', async () => {
  const registrados = []
  let referenciaBuscada
  const huboCambios = await conciliarPago(6, {
    buscarPagos: async (ref) => {
      referenciaBuscada = ref
      return [
        { id: 3, status: 'approved', date_created: '2026-10-08T14:00:08Z', transaction_amount: 1200, currency_id: 'ARS' },
        { id: 1, status: 'rejected', date_created: '2026-10-08T13:58:00Z', transaction_amount: 1200, currency_id: 'ARS' },
        { id: 2, status: 'approved', date_created: '2026-10-08T13:59:00Z', transaction_amount: 1200, currency_id: 'USD' },
      ]
    },
    registrarPago: async (datos) => { registrados.push(datos.paymentId + ':' + datos.estado); return 'actualizado: pendiente → pagado' },
  })
  assert.equal(referenciaBuscada, 'mican-pago-6')
  assert.deepEqual(registrados, ['1:rejected', '3:approved']) // el de USD se ignora
  assert.equal(huboCambios, true)
})

test('conciliación: si no hay pagos o nada cambió, avisa que no hubo cambios', async () => {
  const sinPagos = await conciliarPago(6, { buscarPagos: async () => [], registrarPago: async () => assert.fail() })
  const yaProcesado = await conciliarPago(6, {
    buscarPagos: async () => [{ id: 1, status: 'approved', date_created: 'x', transaction_amount: 1, currency_id: 'ARS' }],
    registrarPago: async () => 'sin cambios: notificación ya procesada',
  })
  assert.equal(sinPagos, false)
  assert.equal(yaProcesado, false)
})
