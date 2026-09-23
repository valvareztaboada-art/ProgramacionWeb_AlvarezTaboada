import PageHeader from '../../components/PageHeader.jsx'
import Badge from '../../components/Badge.jsx'
import { vacunas } from '../../data/mockData.js'

function Vacunas() {
  return (
    <>
      <PageHeader titulo="Vacunas" descripcion="Calendario de vacunación de tus mascotas." />
      <ul className="lista">
        {vacunas.map((v) => (
          <li key={v.id} className="card lista-item">
            <div>
              <strong>{v.vacuna}</strong>
              <p className="texto-suave">{v.mascota} · {v.fecha}</p>
            </div>
            <Badge estado={v.aplicada ? 'Aplicada' : 'Pendiente'} />
          </li>
        ))}
      </ul>
    </>
  )
}

export default Vacunas
