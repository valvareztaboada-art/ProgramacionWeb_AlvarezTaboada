'use client'

// Client Component (veterinaria): elimina un paciente, SIEMPRE con confirmación.
// Usa <dialog> nativo con showModal(): bloquea el resto de la página, lleva el foco
// adentro, se cierra con Escape y los lectores de pantalla lo anuncian como diálogo.
//
// Al borrar la mascota, la base borra en cascada sus turnos, vacunas, estudios y cobros
// pendientes. Si tiene pagos registrados, la base lo rechaza (trigger) y mostramos el motivo.
// Los archivos de los estudios están en Storage (no en la tabla): se borran después.

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearClienteNavegador } from '@/lib/supabase/navegador'
import { mensajeDeError } from '@/lib/supabase/mensajes'

// mascota: { id, nombre } · seBorra: lista de textos ("2 turnos"...) · archivos: rutas en Storage
// bloqueo: si no se puede eliminar, el motivo (y el botón queda deshabilitado)
function BotonEliminarPaciente({ mascota, seBorra, archivos, bloqueo }) {
  const dialogo = useRef(null)
  const [eliminando, setEliminando] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  function abrir() {
    setError('')
    dialogo.current?.showModal()
  }

  function cerrar() {
    if (!eliminando) dialogo.current?.close()
  }

  async function eliminar() {
    setEliminando(true)
    setError('')
    try {
      const supabase = crearClienteNavegador()
      const { data, error } = await supabase.from('mascotas').delete().eq('id', mascota.id).select('id')
      if (error || data.length === 0) {
        setError(mensajeDeError(error ?? { code: '42501' }))
        return
      }
      // La mascota ya no existe: borramos sus archivos (si falla, solo quedan archivos sueltos)
      if (archivos.length > 0) await supabase.storage.from('estudios').remove(archivos)

      dialogo.current?.close()
      router.push(`/veterinaria/pacientes?eliminado=${encodeURIComponent(mascota.nombre)}`)
      router.refresh()
    } catch (error) {
      setError(mensajeDeError(error))
    } finally {
      setEliminando(false)
    }
  }

  return (
    <>
      <button type="button" className="btn btn-peligro" onClick={abrir} disabled={Boolean(bloqueo)}
        aria-describedby={bloqueo ? 'motivo-bloqueo' : undefined}>
        Eliminar a {mascota.nombre}
      </button>
      {bloqueo && <p id="motivo-bloqueo" className="texto-suave">{bloqueo}</p>}

      <dialog ref={dialogo} className="dialogo" aria-labelledby="dialogo-titulo" aria-describedby="dialogo-texto"
        onCancel={(e) => { if (eliminando) e.preventDefault() }}>
        <h2 id="dialogo-titulo">¿Eliminar a {mascota.nombre}?</h2>
        <div id="dialogo-texto">
          {seBorra.length > 0
            ? <>
                <p>También se van a borrar:</p>
                <ul>{seBorra.map((texto) => <li key={texto}>{texto}</li>)}</ul>
              </>
            : <p>No tiene turnos, vacunas, estudios ni cobros cargados.</p>}
          <p><strong>Esta acción no se puede deshacer.</strong></p>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="dialogo-botones">
          {/* autoFocus: al abrir, el foco queda en la opción segura */}
          <button type="button" className="btn btn-secundario" onClick={cerrar} disabled={eliminando} autoFocus>
            No, volver
          </button>
          <button type="button" className="btn btn-peligro-lleno" onClick={eliminar} disabled={eliminando}>
            {eliminando ? 'Eliminando…' : `Sí, eliminar a ${mascota.nombre}`}
          </button>
        </div>
      </dialog>
    </>
  )
}

export default BotonEliminarPaciente
