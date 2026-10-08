import PageHeader from '@/components/PageHeader'
import Badge from '@/components/Badge'
import BotonPagar from '@/components/BotonPagar'
import { obtenerPagos } from '@/lib/datos'

export const metadata = { title: 'Pagos' }

const formatoFecha = new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeZone: 'America/Argentina/Buenos_Aires' })

export default async function MisPagos() {
  const pagos = await obtenerPagos()
  const pendientes = pagos.filter((p) => p.estado === 'pendiente' || p.estado === 'en_proceso')
  const historial = pagos.filter((p) => !pendientes.includes(p))

  return (
    <>
      <PageHeader titulo="Pagos" descripcion="Pagá online con Mercado Pago: tarjeta, débito o dinero en cuenta." />

      <section className="seccion-panel" aria-labelledby="titulo-pendientes">
        <h2 id="titulo-pendientes">Para pagar</h2>
        {pendientes.length === 0 && <p className="texto-suave">No tenés pagos pendientes. 🎉</p>}
        <ul className="lista">
          {pendientes.map((p) => (
            <li key={p.id} className="card lista-item">
              <div>
                <strong>{p.concepto}</strong>
                <p className="texto-suave">{p.mascota} · ${Number(p.monto).toLocaleString('es-AR')}</p>
              </div>
              {p.estado === 'pendiente'
                ? <BotonPagar pagoId={p.id} monto={p.monto} />
                : (
                  <div className="lista-item-derecha">
                    <Badge estado={p.estado} />
                    <p className="texto-chico">Mercado Pago está procesando el pago. Te avisamos acá cuando se acredite.</p>
                  </div>
                )}
            </li>
          ))}
        </ul>
      </section>

      <section className="seccion-panel" aria-labelledby="titulo-historial-pagos">
        <h2 id="titulo-historial-pagos">Historial</h2>
        {historial.length === 0 && <p className="texto-suave">Todavía no hay pagos realizados.</p>}
        <ul className="lista">
          {historial.map((p) => (
            <li key={p.id} className="card lista-item lista-item-historial">
              <div>
                <strong>{p.concepto}</strong>
                <p className="texto-suave">
                  {p.mascota} · ${Number(p.monto).toLocaleString('es-AR')}
                  {p.pagado_en && ` · pagado el ${formatoFecha.format(new Date(p.pagado_en))}`}
                </p>
              </div>
              <Badge estado={p.estado} />
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
