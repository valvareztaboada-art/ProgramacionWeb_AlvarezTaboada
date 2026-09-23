import PageHeader from '../../components/PageHeader.jsx'
import { estudios } from '../../data/mockData.js'

function MisEstudios() {
  return (
    <>
      <PageHeader titulo="Estudios" descripcion="Resultados subidos por la veterinaria." />
      <ul className="lista">
        {estudios.map((e) => (
          <li key={e.id} className="card lista-item">
            <div>
              <strong>{e.tipo}</strong>
              <p className="texto-suave">{e.mascota} · {e.fecha}</p>
            </div>
            <button className="btn btn-secundario">Ver</button>
          </li>
        ))}
      </ul>
    </>
  )
}

export default MisEstudios
