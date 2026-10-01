'use client'

// Client Component (veterinaria): cambia el estado de un turno.
// Solo funciona para la veterinaria: el RLS rechaza el UPDATE de cualquier otro usuario.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearClienteNavegador } from '@/lib/supabase/navegador'
import { mensajeDeError } from '@/lib/supabase/mensajes'

const ACCIONES = {
  confirmado: { texto: 'Confirmar', clase: 'btn-secundario' },
  atendido: { texto: 'Atendido', clase: 'btn-secundario' },
  ausente: { texto: 'Ausente', clase: 'btn-secundario' },
  cancelado: { texto: 'Cancelar', clase: 'btn-peligro' },
}

function AccionesTurno({ turnoId, estado, descripcion }) {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Solo los turnos activos tienen acciones
  if (estado !== 'pendiente' && estado !== 'confirmado') return null

  const disponibles = estado === 'pendiente'
    ? ['confirmado', 'atendido', 'ausente', 'cancelado']
    : ['atendido', 'ausente', 'cancelado']

  async function cambiarEstado(nuevoEstado) {
    if (nuevoEstado === 'cancelado' && !window.confirm(`¿Cancelar el turno de ${descripcion}?`)) return

    setCargando(true)
    setError('')
    const { error } = await crearClienteNavegador()
      .from('turnos')
      .update({ estado: nuevoEstado })
      .eq('id', turnoId)
    setCargando(false)

    if (error) {
      setError(mensajeDeError(error))
      return
    }
    router.refresh()
  }

  return (
    <div className="acciones">
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
      {error && <p className="campo-error" role="alert">{error}</p>}
    </div>
  )
}

export default AccionesTurno
