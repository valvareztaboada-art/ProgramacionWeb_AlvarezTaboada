'use client'

// Client Component (veterinaria): cambia el estado de un turno con fetch a
// PATCH /api/v1/turnos/:id (solo la veterinaria puede: 403 para cualquier otro).
// Al marcarlo "Atendido" se abre la ventana para cobrarlo en el momento (si se quiere).

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DialogoCobrarTurno from './DialogoCobrarTurno'
import { llamarApi } from '@/lib/api/cliente'
import { formatearFecha } from '@/lib/formato'

const ACCIONES = {
  confirmado: { texto: 'Confirmar', clase: 'btn-secundario' },
  atendido: { texto: 'Atendido', clase: 'btn-secundario' },
  ausente: { texto: 'Ausente', clase: 'btn-secundario' },
  cancelado: { texto: 'Cancelar', clase: 'btn-peligro' },
}

// turno: lo que devuelve obtenerTurnos() · montoSugerido: último monto cobrado por ese tipo de turno
function AccionesTurno({ turno, montoSugerido }) {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [cobrando, setCobrando] = useState(false)
  const [yaAtendido, setYaAtendido] = useState(false) // para no volver a mostrar los botones mientras se actualiza
  const router = useRouter()
  const descripcion = `${turno.mascota} del ${formatearFecha(turno.fecha)}`

  // Solo los turnos activos tienen acciones (el diálogo de cobro sigue vivo aunque ya no lo sea)
  const activo = turno.estado === 'pendiente' || turno.estado === 'confirmado'
  if (!activo && !cobrando) return null

  const disponibles = turno.estado === 'pendiente'
    ? ['confirmado', 'atendido', 'ausente', 'cancelado']
    : ['atendido', 'ausente', 'cancelado']

  async function cambiarEstado(nuevoEstado) {
    if (nuevoEstado === 'cancelado' && !window.confirm(`¿Cancelar el turno de ${descripcion}?`)) return

    setCargando(true)
    setError('')
    const { ok, datos } = await llamarApi(`/api/v1/turnos/${turno.id}`, { metodo: 'PATCH', cuerpo: { estado: nuevoEstado } })
    setCargando(false)
    if (!ok) {
      setError(datos.error)
      return
    }
    // Atendido → antes de actualizar la página, ofrecemos cobrarlo (la página se actualiza al cerrar)
    if (nuevoEstado === 'atendido') {
      setYaAtendido(true)
      setCobrando(true)
    }
    else router.refresh()
  }

  return (
    <div className="acciones">
      {activo && !yaAtendido && (
        <div className="acciones-botones">
          {disponibles.map((accion) => (
            <button key={accion} type="button" disabled={cargando}
              className={`btn btn-chico ${ACCIONES[accion].clase}`}
              onClick={() => cambiarEstado(accion)}
              aria-label={`${ACCIONES[accion].texto}: ${descripcion}`}>
              {ACCIONES[accion].texto}
            </button>
          ))}
        </div>
      )}
      {yaAtendido && <span className="texto-suave">Atendido ✓</span>}
      {error && <p className="campo-error" role="alert">{error}</p>}
      {yaAtendido && (
        <DialogoCobrarTurno
          turno={{ ...turno, fechaTexto: `${formatearFecha(turno.fecha)} · ${turno.hora} h` }}
          montoSugerido={montoSugerido}
          abierto={cobrando}
          alCerrar={() => setCobrando(false)}
          recienAtendido
        />
      )}
    </div>
  )
}

export default AccionesTurno
