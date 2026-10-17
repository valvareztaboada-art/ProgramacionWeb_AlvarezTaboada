import { formatearFecha } from '@/lib/formato'

// Cuenta regresiva de las próximas vacunas (la más cercana, destacada).
// proximas: el resultado de proximasVacunas() → [{ id, mascota, vacuna, proxima_dosis, dias, estado }]

function textoDeDias(dias) {
  if (dias < 0) return { numero: Math.abs(dias), unidad: Math.abs(dias) === 1 ? 'día' : 'días', antes: 'Venció hace' }
  if (dias === 0) return { numero: 'Hoy', unidad: '', antes: 'Le toca' }
  return { numero: dias, unidad: dias === 1 ? 'día' : 'días', antes: 'Faltan' }
}

function ProximasVacunas({ proximas, mostrarMascota = true, vacio = 'No hay vacunas programadas.' }) {
  if (proximas.length === 0) return <p className="texto-suave">{vacio}</p>

  const [primera, ...resto] = proximas
  const { numero, unidad, antes } = textoDeDias(primera.dias)

  return (
    <div className="proximas-vacunas">
      <div className={`cuenta-regresiva cuenta-${primera.estado}`}>
        <div className="cuenta-numero" aria-hidden="true">
          <span className="cuenta-antes">{antes}</span>
          <strong>{numero}</strong>
          <span>{unidad}</span>
        </div>
        <div>
          <p className="cuenta-titulo">
            {primera.estado === 'vencida' ? 'Vacuna vencida' : 'Próxima vacuna'}
            {mostrarMascota && <> de <strong>{primera.mascota}</strong></>}
          </p>
          <p className="cuenta-vacuna">{primera.vacuna}</p>
          <p className="texto-suave">
            {/* Para lectores de pantalla, la cuenta va en una sola frase */}
            <span className="visualmente-oculto">{antes} {numero} {unidad}. </span>
            {formatearFecha(primera.proxima_dosis)}
          </p>
          {primera.estado !== 'al_dia' && (
            <p className="cuenta-aviso">
              {primera.estado === 'vencida' ? 'Pedí un turno lo antes posible.' : 'Es momento de pedir el turno.'}
            </p>
          )}
        </div>
      </div>

      {resto.length > 0 && (
        <ul className="lista-proximas">
          {resto.map((v) => (
            <li key={v.id} className={`proxima-${v.estado}`}>
              <span>
                <strong>{v.vacuna}</strong>
                {mostrarMascota && ` · ${v.mascota}`}
              </span>
              <span className="texto-suave">
                {formatearFecha(v.proxima_dosis)} · {v.dias < 0 ? `venció hace ${-v.dias} días` : `en ${v.dias} días`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ProximasVacunas
