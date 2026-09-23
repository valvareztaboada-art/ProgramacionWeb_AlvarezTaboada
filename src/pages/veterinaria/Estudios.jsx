import PageHeader from '../../components/PageHeader.jsx'
import { estudios } from '../../data/mockData.js'

function Estudios() {
  return (
    <>
      <PageHeader titulo="Estudios" descripcion="Estudios organizados por paciente.">
        <button className="btn btn-primario">+ Subir estudio</button>
      </PageHeader>
      <div className="tabla-contenedor">
        <table className="tabla">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Tipo</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {estudios.map((e) => (
              <tr key={e.id}>
                <td>{e.mascota}</td>
                <td>{e.tipo}</td>
                <td>{e.fecha}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default Estudios
