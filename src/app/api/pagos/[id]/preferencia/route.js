// POST /api/pagos/:id/preferencia
// Crea la Preferencia de Pago en Mercado Pago (Checkout Pro) y devuelve la URL para pagar.
//
// Seguridad:
//   · Hace falta estar logueado (401 si no)
//   · El pago se busca con la sesión del usuario: el RLS solo devuelve SUS pagos (404 si no)
//   · Solo se pueden pagar cobros pendientes (409 si no)
//   · El monto sale de la base de datos, nunca del navegador
//   · El Access Token de Mercado Pago solo se usa acá, en el servidor

import { crearClienteServidor } from '@/lib/supabase/servidor'
import { armarPreferencia } from '@/lib/mercadopago/preferencia'
import { crearPreferencia, urlDeCheckout } from '@/lib/mercadopago/api'

function error(status, mensaje) {
  return Response.json({ error: mensaje }, { status })
}

export async function POST(request, { params }) {
  const { id } = await params
  if (!/^\d+$/.test(id)) return error(400, 'El cobro indicado no es válido.')
  if (!process.env.MP_ACCESS_TOKEN) return error(503, 'Los pagos online todavía no están configurados.')

  const supabase = await crearClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return error(401, 'Tu sesión venció. Volvé a ingresar.')

  const { data: pago } = await supabase
    .from('pagos')
    .select('id, concepto, monto, estado, mascotas(nombre)')
    .eq('id', id)
    .maybeSingle()

  if (!pago) return error(404, 'No encontramos ese cobro.')
  if (pago.estado !== 'pendiente') return error(409, 'Este cobro ya no está pendiente de pago.')

  try {
    const preferencia = await crearPreferencia(armarPreferencia({
      pago: { id: pago.id, concepto: pago.concepto, monto: pago.monto, mascota: pago.mascotas.nombre },
      origen: new URL(request.url).origin,
    }))

    // Guardamos el preference_id (la función vuelve a controlar que sea suyo y esté pendiente)
    const { error: errorAlGuardar } = await supabase.rpc('guardar_preferencia_mp', {
      p_pago_id: pago.id,
      p_preference_id: preferencia.id,
    })
    if (errorAlGuardar) return error(409, 'Este cobro ya no está pendiente de pago.')

    return Response.json({ url: urlDeCheckout(preferencia) })
  } catch (e) {
    console.error('[pagos] Error al crear la preferencia:', e.message)
    return error(502, 'No pudimos conectar con Mercado Pago. Probá de nuevo en unos minutos.')
  }
}
