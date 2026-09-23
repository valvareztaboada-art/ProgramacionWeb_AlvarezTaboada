import PageHeader from '../../components/PageHeader.jsx'
import { mascotas } from '../../data/mockData.js'

function Pacientes() {
  return (
    <>
      <PageHeader titulo="Pacientes" descripcion="Registro de todos los pacientes.">
        <button className="btn btn-primario">+ Nuevo paciente</button>
      </PageHeader>
      <div className="tabla-contenedor">
        <table className="tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Especie</th>
              <th>Raza</th>
              <th>Edad</th>
              <th>Dueño/a</th>
            </tr>
          </thead>
          <tbody>
            {mascotas.map((m) => (
              <tr key={m.id}>
                <td>{m.nombre}</td>
                <td>{m.especie}</td>
                <td>{m.raza}</td>
                <td>{m.edad}</td>
                <td>{m.duenio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default Pacientes
