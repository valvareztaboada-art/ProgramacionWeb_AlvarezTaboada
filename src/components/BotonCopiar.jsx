'use client'

// Client Component: copia un texto (ej: el email del dueño/a) al portapapeles.
// Si el navegador no lo permite, muestra el texto seleccionado para copiarlo a mano.

import { useRef, useState } from 'react'

function BotonCopiar({ texto, etiqueta = 'Copiar', descripcion }) {
  const [estado, setEstado] = useState('listo') // 'listo' | 'copiado' | 'manual'
  const campo = useRef(null)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto)
      setEstado('copiado')
      setTimeout(() => setEstado('listo'), 2000)
    } catch {
      setEstado('manual')
      setTimeout(() => campo.current?.select(), 0)
    }
  }

  return (
    <span className="boton-copiar">
      <button type="button" className="btn btn-chico btn-secundario" onClick={copiar}
        aria-label={descripcion ? `${etiqueta}: ${descripcion}` : etiqueta}>
        {estado === 'copiado' ? '¡Copiado!' : etiqueta}
      </button>
      {estado === 'manual' && (
        <input ref={campo} className="copiar-manual" readOnly value={texto}
          aria-label="Seleccionalo y copialo con Ctrl+C" onFocus={(e) => e.target.select()} />
      )}
      <span className="visualmente-oculto" aria-live="polite">{estado === 'copiado' ? 'Copiado al portapapeles' : ''}</span>
    </span>
  )
}

export default BotonCopiar
