'use client'

// Client Component (cliente): cancela un turno llamando a la función cancelar_turno
// de la base de datos, que es la que controla de verdad la regla de las 24 h.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearClienteNavegador } from '@/lib/supabase/navegador'
import { mensajeDeError } from '@/lib/supabase/mensajes'

function BotonCancelarTurno({ turnoId, descripcion }) {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function cancelar() {
    if (!window.confirm(`¿Seguro que querés cancelar el turno de ${descripcion}?`)) return

    setCargando(true)
    setError('')
    const { error } = await crearClienteNavegador().rpc('cancelar_turno', { p_turno_id: turnoId })
    setCargando(false)

    if (error) {
      setError(mensajeDeError(error))
      return
    }
    router.refresh() // vuelve a pedir los datos al servidor
  }

  return (
    <div className="acciones">
      <button type="button" className="btn btn-chico btn-peligro" onClick={cancelar} disabled={cargando}>
        {cargando ? 'Cancelando…' : 'Cancelar turno'}
      </button>
      {error && <p className="campo-error" role="alert">{error}</p>}
    </div>
  )
}

export default BotonCancelarTurno
