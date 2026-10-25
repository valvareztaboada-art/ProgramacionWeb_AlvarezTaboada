'use client'

// Client Component (veterinaria): botón "Cobrar" de la lista "Atendidos sin cobrar".
// Abre la misma ventana que aparece al marcar un turno como atendido.

import { useState } from 'react'
import DialogoCobrarTurno from './DialogoCobrarTurno'

function BotonCobrarTurno({ turno, montoSugerido }) {
  const [abierto, setAbierto] = useState(false)

  return (
    <>
      <button type="button" className="btn btn-chico btn-primario" onClick={() => setAbierto(true)}
        aria-label={`Cobrar el turno de ${turno.mascota} (${turno.especialidad}, ${turno.fechaTexto})`}>
        Cobrar
      </button>
      {abierto && (
        <DialogoCobrarTurno turno={turno} montoSugerido={montoSugerido} abierto alCerrar={() => setAbierto(false)} />
      )}
    </>
  )
}

export default BotonCobrarTurno
