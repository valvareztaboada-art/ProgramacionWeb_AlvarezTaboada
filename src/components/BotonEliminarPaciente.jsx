'use client'

// Client Component (veterinaria): elimina un paciente, SIEMPRE con confirmación.
// Usa <dialog> nativo con showModal(): bloquea el resto de la página, lleva el foco
// adentro, se cierra con Escape y los lectores de pantalla lo anuncian como diálogo.
//
// Confirmado, llama con fetch a DELETE /api/v1/pacientes/:id. El servidor borra la mascota
// (la base borra en cascada sus turnos, vacunas, estudios y cobros pendientes) y los archivos
// de sus estudios. Si tiene pagos registrados responde 409 y mostramos el motivo.

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { llamarApi } from '@/lib/api/cliente'

// mascota: { id, nombre } · seBorra: lista de textos ("2 turnos"...)
// bloqueo: si no se puede eliminar, el motivo (y el botón queda deshabilitado)
function BotonEliminarPaciente({ mascota, seBorra, bloqueo }) {
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
    const { ok, datos } = await llamarApi(`/api/v1/pacientes/${mascota.id}`, { metodo: 'DELETE' })
    setEliminando(false)
    if (!ok) {
      setError(datos.error)
      return
    }
    dialogo.current?.close()
    router.push(`/veterinaria/pacientes?eliminado=${encodeURIComponent(mascota.nombre)}`)
    router.refresh()
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
