import Link from 'next/link'
import { notFound } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import Badge from '@/components/Badge'
import EsperandoConfirmacion from '@/components/EsperandoConfirmacion'
import { obtenerPago } from '@/lib/datos'

export const metadata = { title: 'Resultado del pago' }

// A esta página vuelve el usuario desde Mercado Pago (back_urls).
// Mercado Pago agrega en la URL cómo le fue (?status=approved&payment_id=...),
// pero ese dato SOLO lo usamos para elegir el mensaje: lo que vale es el estado
// en NUESTRA base de datos, que actualiza el webhook (la URL se puede inventar).
export default async function ResultadoDelPago({ searchParams }) {
  const parametros = await searchParams
  const pago = await obtenerPago(parametros.pago)
  if (!pago) notFound()

  const segunMercadoPago = parametros.collection_status ?? parametros.status
  const monto = `$${Number(pago.monto).toLocaleString('es-AR')}`

  let titulo, mensaje, esperar = false
  if (pago.estado === 'pagado') {
    titulo = '¡Pago acreditado!'
    mensaje = `Recibimos tu pago de ${monto} por "${pago.concepto}". ¡Gracias!`
  } else if (pago.estado === 'en_proceso' || segunMercadoPago === 'pending' || segunMercadoPago === 'in_process') {
    titulo = 'Tu pago está en proceso'
    mensaje = 'Mercado Pago lo está procesando (pasa con pagos en efectivo o cuando el banco lo revisa). Te avisamos acá cuando se acredite.'
  } else if (segunMercadoPago === 'approved') {
    titulo = 'Estamos confirmando tu pago'
    mensaje = 'Mercado Pago aprobó el pago y en unos segundos se acredita en tu cuenta.'
    esperar = true
  } else {
    titulo = 'El pago no se completó'
    mensaje = 'No se realizó ningún cobro. Podés intentarlo de nuevo con otro medio de pago.'
  }

  return (
    <>
      <PageHeader titulo="Resultado del pago" />
      <section className={`card resultado-pago resultado-${pago.estado}`}>
        <h2>{titulo}</h2>
        <p>{mensaje}</p>
        <p className="texto-suave">
          {pago.concepto} · {pago.mascota} · {monto} · <Badge estado={pago.estado} />
        </p>
        {esperar && <EsperandoConfirmacion />}
        <div className="form-exito-botones">
          <Link href="/cliente/pagos" className="btn btn-primario">Volver a Pagos</Link>
        </div>
      </section>
    </>
  )
}
