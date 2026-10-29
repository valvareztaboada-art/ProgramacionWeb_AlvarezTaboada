'use client'

// Client Component genérico: acción con ventana de confirmación (<dialog>) y fetch a la API.
// Por defecto "Eliminar" (DELETE), pero sirve para otras acciones (ej: "Anular" con PATCH).
// Nunca actúa directo: primero pregunta, con el foco en la opción segura ("No, volver").
// Ej: <BotonEliminar url="/api/v1/vacunas/5" que="la dosis de Rabia del 12/03" />
//     <BotonEliminar url="/api/v1/cobros/8" metodo="PATCH" cuerpo={{ estado: 'anulado' }} verbo="Anular" que="el cobro…" />

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { llamarApi } from '@/lib/api/cliente'

function BotonEliminar({ url, que, detalle = 'Esta acción no se puede deshacer.', metodo = 'DELETE', cuerpo, verbo = 'Eliminar' }) {
  const dialogo = useRef(null)
  const [eliminando, setEliminando] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function eliminar() {
    setEliminando(true)
    setError('')
    const { ok, datos } = await llamarApi(url, { metodo, cuerpo })
    setEliminando(false)
    if (!ok) {
      setError(datos.error)
      return
    }
    dialogo.current?.close()
    router.refresh()
  }

  return (
    <>
      <button type="button" className="btn btn-chico btn-peligro" onClick={() => { setError(''); dialogo.current?.showModal() }}
        aria-label={`${verbo} ${que}`}>
        {verbo}
      </button>
      <dialog ref={dialogo} className="dialogo" aria-label={`¿${verbo} ${que}?`}
        onCancel={(e) => { if (eliminando) e.preventDefault() }}>
        <h2>¿{verbo} {que}?</h2>
        <p>{detalle}</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="dialogo-botones">
          <button type="button" className="btn btn-secundario" onClick={() => dialogo.current?.close()} disabled={eliminando} autoFocus>
            No, volver
          </button>
          <button type="button" className="btn btn-peligro-lleno" onClick={eliminar} disabled={eliminando}>
            {eliminando ? 'Guardando…' : `Sí, ${verbo.toLowerCase()}`}
          </button>
        </div>
      </dialog>
    </>
  )
}

export default BotonEliminar
