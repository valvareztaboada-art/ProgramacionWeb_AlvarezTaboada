import PageHeader from '../../components/PageHeader.jsx'
import Badge from '../../components/Badge.jsx'
import { turnos } from '../../data/mockData.js'

function Agenda() {
  return (
    <>
      <PageHeader titulo="Agenda" descripcion="Turnos de la semana." />
      <div className="tabla-contenedor">
        <table className="tabla">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Paciente</th>
              <th>Dueño/a</th>
              <th>Motivo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {turnos.map((t) => (
              <tr key={t.id}>
                <td>{t.fecha}</td>
                <td>{t.hora}</td>
                <td>{t.mascota}</td>
                <td>{t.duenio}</td>
                <td>{t.motivo}</td>
                <td><Badge estado={t.estado} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default Agenda
