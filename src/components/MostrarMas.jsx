'use client'

// Client Component: muestra los primeros 5 elementos de una lista (o filas de una tabla)
// y un botón para ver el resto. La información está toda en la página (la dibuja el
// servidor); el CSS oculta lo que pasa del quinto mientras está "plegado".
//
// Uso: <MostrarMas total={turnos.length}><ul className="lista">…</ul></MostrarMas>

import { useId, useState } from 'react'

export const CANTIDAD_INICIAL = 5 // si cambia, cambiar también el nth-child(n+6) del CSS

function MostrarMas({ total, children, que = 'más' }) {
  const [abierto, setAbierto] = useState(false)
  const id = useId()
  const ocultos = total - CANTIDAD_INICIAL

  if (ocultos <= 0) return children

  return (
    <div className="plegable" data-plegado={!abierto}>
      <div id={id}>{children}</div>
      <button type="button" className="boton-mostrar-mas" aria-expanded={abierto} aria-controls={id}
        onClick={() => setAbierto(!abierto)}>
        {abierto ? 'Mostrar menos' : `Mostrar ${ocultos} ${que}`}
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" className={abierto ? 'girado' : ''}>
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}

export default MostrarMas
