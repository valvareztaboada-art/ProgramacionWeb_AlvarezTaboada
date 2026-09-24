import PageHeader from '@/components/PageHeader'
import Badge from '@/components/Badge'
import { CLIENTE_ACTUAL, obtenerPagos } from '@/lib/datos'

export const metadata = { title: 'Pagos' }

export default async function MisPagos() {
  const pagos = await obtenerPagos({ emailDuenio: CLIENTE_ACTUAL.email })

  return (
    <>
      <PageHeader titulo="Pagos" descripcion="Más adelante se integra con Mercado Pago." />
      <ul className="lista">
        {pagos.map((p) => (
          <li key={p.id} className="card lista-item">
            <div>
              <strong>{p.concepto}</strong>
              <p className="texto-suave">${p.monto.toLocaleString('es-AR')}</p>
            </div>
            {p.estado === 'Pendiente'
              ? <button className="btn btn-primario">Pagar</button>
              : <Badge estado={p.estado} />}
          </li>
        ))}
      </ul>
    </>
  )
}
