import MostrarMas from './MostrarMas'
import { formatearFecha } from '@/lib/formato'

const formatoCorto = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const corta = (fecha) => formatoCorto.format(new Date(`${fecha}T00:00:00Z`))

// Historial de dosis aplicadas, de la más nueva a la más vieja (se ven las últimas 5)
function HistorialVacunas({ vacunas, mostrarMascota = false }) {
  if (vacunas.length === 0) return <p className="texto-suave">Todavía no hay vacunas registradas.</p>

  return (
    <MostrarMas total={vacunas.length} que="vacunas anteriores">
      <ul className="lista">
        {vacunas.map((v) => (
          <li key={v.id} className="card vacuna-dosis">
            <div>
              <strong>{v.vacuna}</strong>
              <p className="texto-suave">
                {mostrarMascota && <>{v.mascota} · </>}Aplicada el {formatearFecha(v.fecha_aplicacion)}
              </p>
              {v.notas && <p className="vacuna-notas">{v.notas}</p>}
            </div>
            <span className="vacuna-proxima">
              {v.proxima_dosis ? <>Próxima: <strong>{corta(v.proxima_dosis)}</strong></> : 'Sin refuerzo'}
            </span>
          </li>
        ))}
      </ul>
    </MostrarMas>
  )
}

export default HistorialVacunas
