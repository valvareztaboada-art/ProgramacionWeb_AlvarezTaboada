// POST /api/v1/pagos/:id/preferencia
// Crea la Preferencia de Pago en Mercado Pago (Checkout Pro) para ese cobro y devuelve
// la URL para pagar. Es un POST porque CREA un recurso (la preferencia) cada vez.
//
// Seguridad:
//   · Hace falta estar logueado (401 si no) y ser cliente (403 si es otro rol)
//   · El pago se busca con la sesión del usuario: el RLS solo devuelve SUS pagos (404 si no)
//   · Solo se pueden pagar cobros pendientes (409 si no)
//   · El monto sale de la base de datos, nunca del navegador
//   · El Access Token de Mercado Pago solo se usa acá, en el servidor

import { conManejoDeErrores, validarCon, noEncontrado, conflicto, ErrorDeApi } from '@/lib/api/errores'
import { requerirCliente } from '@/lib/api/sesion'
import { log } from '@/lib/api/log'
import { esquemaId } from '@/lib/esquemas'
import { armarPreferencia } from '@/lib/mercadopago/preferencia'
import { crearPreferencia, urlDeCheckout } from '@/lib/mercadopago/api'

const YA_NO_PENDIENTE = 'Este cobro ya no está pendiente de pago.'

export const POST = conManejoDeErrores(async (request, { params }) => {
  if (!process.env.MP_ACCESS_TOKEN) throw new ErrorDeApi(503, 'Los pagos online todavía no están configurados.')

  // Pagar es cosa del dueño/a (RBAC)
  const { supabase } = await requerirCliente('Solo el dueño/a puede pagar sus cobros.')
  const { id } = await params
  const pagoId = validarCon(esquemaId, id)

  const { data: pago } = await supabase
    .from('pagos')
    .select('id, concepto, monto, estado, mascotas(nombre)')
    .eq('id', pagoId)
    .maybeSingle()

  if (!pago) throw noEncontrado('No encontramos ese cobro.')
  if (pago.estado !== 'pendiente') throw conflicto(YA_NO_PENDIENTE)

  let preferencia
  try {
    preferencia = await crearPreferencia(armarPreferencia({
      pago: { id: pago.id, concepto: pago.concepto, monto: pago.monto, mascota: pago.mascotas.nombre },
      origen: new URL(request.url).origin,
    }))
  } catch (e) {
    // 502: el que falló fue otro servidor (Mercado Pago), no el nuestro
    log.error('pagos.preferencia_fallida', { pagoId, mensaje: e.message })
    throw new ErrorDeApi(502, 'No pudimos conectar con Mercado Pago. Probá de nuevo en unos minutos.')
  }

  // Guardamos el preference_id (la función vuelve a controlar que sea suyo y esté pendiente)
  const { error } = await supabase.rpc('guardar_preferencia_mp', {
    p_pago_id: pago.id,
    p_preference_id: preferencia.id,
  })
  if (error) throw conflicto(YA_NO_PENDIENTE)

  log.info('pagos.preferencia_creada', { pagoId })
  return Response.json({ url: urlDeCheckout(preferencia) }, { status: 201 })
})
