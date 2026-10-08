// Conciliación desde el SERVIDOR (la usan las páginas de Pagos, Cobros y Resultado).
// Usa el Access Token (para preguntarle a Mercado Pago) y la clave secreta de Supabase
// (para registrar el resultado), por eso es 'server-only'.
//
// Importante: solo se llama con cobros que el usuario YA puede ver (vienen de una
// consulta con su sesión y RLS), y los datos que se guardan salen de la API de
// Mercado Pago, no del navegador.

import 'server-only'
import { conciliarPago, necesitaConciliar } from './conciliacion.js'
import { buscarPagosPorReferencia } from './api.js'
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

// Concilia los cobros que lo necesitan. Nunca rompe la página: si Mercado Pago
// no responde, se registra el error y se sigue mostrando lo que hay en la base.
// Devuelve true si algún cobro cambió (para volver a leerlos).
export async function conciliarCobros(pagos) {
  if (!process.env.MP_ACCESS_TOKEN || !process.env.SUPABASE_SECRET_KEY) return false

  const resultados = await Promise.all(
    pagos.filter(necesitaConciliar).map(async (pago) => {
      try {
        return await conciliarPago(pago.id, { buscarPagos: buscarPagosPorReferencia, registrarPago })
      } catch (e) {
        console.error(`[conciliación] Cobro ${pago.id}:`, e.message)
        return false
      }
    }),
  )
  return resultados.some(Boolean)
}
