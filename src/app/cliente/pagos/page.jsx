import PageHeader from '@/components/PageHeader'
import Badge from '@/components/Badge'
import { obtenerPagos } from '@/lib/datos'

export const metadata = { title: 'Pagos' }

export default async function MisPagos() {
  const pagos = await obtenerPagos()

  return (
    <>
      <PageHeader titulo="Pagos" descripcion="Más adelante se integra con Mercado Pago." />
      <ul className="lista">
        {pagos.map((p) => (
          <li key={p.id} className="card lista-item">
            <div>
              <strong>{p.concepto}</strong>
              <p className="texto-suave">{p.mascota} · ${Number(p.monto).toLocaleString('es-AR')}</p>
            </div>
            {p.estado === 'pendiente'
              ? <button className="btn btn-primario" disabled title="Se habilita con Mercado Pago">Pagar</button>
              : <Badge estado={p.estado} />}
          </li>
        ))}
      </ul>
    </>
  )
}
