'use client'

// Client Component: dos pestañas ("Ya llevé a mi mascota" / "Todavía no la llevé").
// El contenido de cada camino llega armado desde el servidor (props yaVino y nuevo);
// acá solo se decide cuál se muestra. Sigue el patrón de pestañas accesibles:
// role="tablist", aria-selected y flechas del teclado para moverse.

import { useRef, useState } from 'react'

const CAMINOS = [
  { id: 'ya-vino', etiqueta: 'Ya llevé a mi mascota a MICAN' },
  { id: 'nuevo', etiqueta: 'Todavía no la llevé' },
]

function CaminosCuenta({ yaVino, nuevo }) {
  const [elegido, setElegido] = useState(CAMINOS[0].id)
  const botones = useRef([])

  function alApretarTecla(e, i) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    const siguiente = (i + (e.key === 'ArrowRight' ? 1 : CAMINOS.length - 1)) % CAMINOS.length
    setElegido(CAMINOS[siguiente].id)
    botones.current[siguiente]?.focus()
  }

  return (
    <>
      <div className="caminos-selector" role="tablist" aria-label="Elegí tu caso">
        {CAMINOS.map((c, i) => (
          <button
            key={c.id}
            ref={(el) => { botones.current[i] = el }}
            type="button"
            role="tab"
            id={`pestania-${c.id}`}
            aria-controls={`camino-${c.id}`}
            aria-selected={elegido === c.id}
            tabIndex={elegido === c.id ? 0 : -1}
            onClick={() => setElegido(c.id)}
            onKeyDown={(e) => alApretarTecla(e, i)}
          >
            {c.etiqueta}
          </button>
        ))}
      </div>
      <div id="camino-ya-vino" role="tabpanel" aria-labelledby="pestania-ya-vino" hidden={elegido !== 'ya-vino'}>
        {yaVino}
      </div>
      <div id="camino-nuevo" role="tabpanel" aria-labelledby="pestania-nuevo" hidden={elegido !== 'nuevo'}>
        {nuevo}
      </div>
    </>
  )
}

export default CaminosCuenta
