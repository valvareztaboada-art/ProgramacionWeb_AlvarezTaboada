import MostrarMas from './MostrarMas'
import BotonEliminar from './BotonEliminar'
import { formatearFecha } from '@/lib/formato'

const formatoCorto = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const corta = (fecha) => formatoCorto.format(new Date(`${fecha}T00:00:00Z`))

// Historial de dosis aplicadas, de la más nueva a la más vieja (se ven las últimas 5)
// esVeterinaria: cada dosis tiene "Eliminar" (por si se cargó por error), con confirmación
function HistorialVacunas({ vacunas, mostrarMascota = false, esVeterinaria = false }) {
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
            <div className="lista-item-derecha">
              <span className="vacuna-proxima">
                {v.proxima_dosis ? <>Próxima: <strong>{corta(v.proxima_dosis)}</strong></> : 'Sin refuerzo'}
              </span>
              {esVeterinaria && (
                <BotonEliminar url={`/api/v1/vacunas/${v.id}`} que={`la dosis de ${v.vacuna} del ${corta(v.fecha_aplicacion)}`}
                  detalle="Usalo si se cargó por error. Si era la última dosis, la próxima fecha se calcula con la anterior." />
              )}
            </div>
          </li>
        ))}
      </ul>
    </MostrarMas>
  )
}

export default HistorialVacunas
