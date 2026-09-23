import PageHeader from '../../components/PageHeader.jsx'
import Badge from '../../components/Badge.jsx'
import { turnos, clienteActual } from '../../data/mockData.js'

function MisTurnos() {
  const misTurnos = turnos.filter((t) => t.duenio === clienteActual)

  return (
    <>
      <PageHeader titulo="Mis turnos" descripcion="Tus próximas visitas a la veterinaria.">
        <button className="btn btn-primario">+ Pedir turno</button>
      </PageHeader>
      <ul className="lista">
        {misTurnos.map((t) => (
          <li key={t.id} className="card lista-item">
            <div>
              <strong>{t.fecha} · {t.hora}</strong>
              <p className="texto-suave">{t.mascota} — {t.motivo}</p>
            </div>
            <Badge estado={t.estado} />
          </li>
        ))}
      </ul>
    </>
  )
}

export default MisTurnos
