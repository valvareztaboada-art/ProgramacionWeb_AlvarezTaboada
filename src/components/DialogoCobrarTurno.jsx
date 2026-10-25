'use client'

// Client Component (veterinaria): ventana para cobrar un turno atendido.
// Aparece sola al marcar "Atendido" y también desde "Atendidos sin cobrar".
// Tiene el formulario de cobro ya completo (paciente, concepto y monto sugerido) y dos salidas:
//   · "Ahora no"     → se cierra; el turno queda en "Atendidos sin cobrar" para hacerlo después
//   · "No se cobra"  → lo marca sin cargo (ej: un control de cortesía) y deja de figurar como pendiente
// Usa <dialog> nativo: lleva el foco adentro, se cierra con Escape y bloquea el resto de la página.

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import FormularioCobro from './FormularioCobro'
import { llamarApi } from '@/lib/api/cliente'

// turno: { id, mascotaId, mascota, duenio, especialidad } · recienAtendido: el título lo celebra
function DialogoCobrarTurno({ turno, montoSugerido, abierto, alCerrar, recienAtendido = false }) {
  const dialogo = useRef(null)
  const [marcando, setMarcando] = useState(false)
  const [cobrado, setCobrado] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // El estado "abierto" lo maneja el componente de afuera; acá se sincroniza con el <dialog>
  useEffect(() => {
    const d = dialogo.current
    if (!d) return
    if (abierto && !d.open) d.showModal()
    if (!abierto && d.open) d.close()
  }, [abierto])

  function cerrar() {
    setError('')
    setCobrado(false)
    alCerrar()
    router.refresh() // ahora sí: el turno pasa a la lista que corresponde
  }

  async function noSeCobra() {
    setMarcando(true)
    setError('')
    const { ok, datos } = await llamarApi(`/api/v1/turnos/${turno.id}`, { metodo: 'PATCH', cuerpo: { sinCargo: true } })
    setMarcando(false)
    if (!ok) {
      setError(datos.error)
      return
    }
    cerrar()
  }

  const idTitulo = `cobrar-titulo-${turno.id}`
  return (
    <dialog ref={dialogo} className="dialogo dialogo-cobro" aria-labelledby={idTitulo}
      onCancel={(e) => { e.preventDefault(); cerrar() }}>
      <h2 id={idTitulo}>
        {recienAtendido ? `✓ ${turno.mascota} quedó como atendido/a` : `Cobrar el turno de ${turno.mascota}`}
      </h2>
      <p className="texto-suave">
        {recienAtendido ? '¿Querés registrar el cobro ahora? ' : ''}{turno.especialidad} · {turno.fechaTexto}
      </p>

      {/* El formulario se monta solo con la ventana abierta: cada vez arranca de cero */}
      {abierto && (
        <FormularioCobro turno={turno} montoSugerido={montoSugerido} alCrear={() => setCobrado(true)} alTerminar={cerrar} />
      )}

      {error && <p className="form-error" role="alert">{error}</p>}
      {!cobrado && (
      <div className="dialogo-botones dialogo-salidas">
        <button type="button" className="boton-enlace" onClick={noSeCobra} disabled={marcando}>
          {marcando ? 'Guardando…' : 'No se cobra'}
        </button>
        <button type="button" className="btn btn-secundario" onClick={cerrar} disabled={marcando}>
          Ahora no
        </button>
      </div>
      )}
    </dialog>
  )
}

export default DialogoCobrarTurno
