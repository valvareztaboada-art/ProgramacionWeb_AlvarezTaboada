'use client'

// Client Component (veterinaria): marca un cobro pendiente como pagado en efectivo.
// La regla de verdad la controla la base (función registrar_pago_efectivo):
// solo la veterinaria, y solo cobros pendientes.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearClienteNavegador } from '@/lib/supabase/navegador'
import { mensajeDeError } from '@/lib/supabase/mensajes'

function BotonPagoEfectivo({ pagoId, descripcion }) {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function marcar() {
    if (!window.confirm(`¿Confirmás que se cobró en efectivo ${descripcion}?`)) return

    setCargando(true)
    setError('')
    try {
      const { error } = await crearClienteNavegador().rpc('registrar_pago_efectivo', { p_pago_id: pagoId })
      if (error) {
        setError(mensajeDeError(error))
        return
      }
      router.refresh() // el cobro pasa a "Pagado" (y el dueño/a también lo ve así)
    } catch (error) {
      setError(mensajeDeError(error))
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="acciones">
      <button type="button" className="btn btn-chico btn-secundario" onClick={marcar} disabled={cargando}
        aria-label={`Marcar como cobrado en efectivo: ${descripcion}`}>
        {cargando ? 'Guardando…' : 'Cobrado en efectivo'}
      </button>
      {error && <p className="campo-error" role="alert">{error}</p>}
    </div>
  )
}

export default BotonPagoEfectivo
