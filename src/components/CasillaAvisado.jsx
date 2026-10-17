'use client'

// Client Component (veterinaria): casilla "Ya le avisé".
// Al tildarla guarda la fecha en vacunas.avisado_en y la vacuna sale de los pendientes.
// Al destildarla (por si fue un error) vuelve a la lista. El RLS solo deja a la veterinaria.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearClienteNavegador } from '@/lib/supabase/navegador'
import { mensajeDeError } from '@/lib/supabase/mensajes'

function CasillaAvisado({ vacunaId, avisado, descripcion }) {
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function cambiar(e) {
    const marcado = e.target.checked
    setGuardando(true)
    setError('')
    try {
      const { data, error } = await crearClienteNavegador()
        .from('vacunas')
        .update({ avisado_en: marcado ? new Date().toISOString() : null })
        .eq('id', vacunaId)
        .select('id')
      if (error || data.length === 0) {
        setError(mensajeDeError(error ?? { code: '42501' }))
        return
      }
      router.refresh() // la vacuna pasa de "por avisar" a "ya avisadas" (o al revés)
    } catch (error) {
      setError(mensajeDeError(error))
    } finally {
      setGuardando(false)
    }
  }

  const id = `avisado-${vacunaId}`
  return (
    <div className="casilla-avisado">
      <input id={id} type="checkbox" checked={avisado} onChange={cambiar} disabled={guardando} />
      <label htmlFor={id}>
        {guardando ? 'Guardando…' : 'Ya le avisé'}
        <span className="visualmente-oculto"> ({descripcion})</span>
      </label>
      {error && <p className="campo-error" role="alert">{error}</p>}
    </div>
  )
}

export default CasillaAvisado
