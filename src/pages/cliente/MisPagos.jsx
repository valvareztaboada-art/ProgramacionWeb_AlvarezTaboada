import PageHeader from '../../components/PageHeader.jsx'
import Badge from '../../components/Badge.jsx'
import { pagos, clienteActual } from '../../data/mockData.js'

function MisPagos() {
  const misPagos = pagos.filter((p) => p.duenio === clienteActual)

  return (
    <>
      <PageHeader titulo="Pagos" descripcion="Más adelante se integra con Mercado Pago." />
      <ul className="lista">
        {misPagos.map((p) => (
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

export default MisPagos
