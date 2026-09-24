'use client'

// Client Component: en el celular el menú se abre y se cierra (useState + onClick).
// Los enlaces llegan como children desde Navbar (Server Component).
// En pantallas grandes el botón se oculta con CSS y el menú se ve siempre.

import { useState } from 'react'

function MenuDesplegable({ children }) {
  const [abierto, setAbierto] = useState(false)

  // Si se toca un enlace del menú, se cierra (útil en el celular)
  function handleClickCapture(e) {
    if (e.target.closest('a')) setAbierto(false)
  }

  return (
    <>
      <button
        type="button"
        className="menu-boton"
        aria-expanded={abierto}
        aria-controls="menu-principal"
        onClick={() => setAbierto(!abierto)}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          {abierto
            ? <path d="M6 6l12 12M18 6 6 18" />
            : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
        <span className="visualmente-oculto">{abierto ? 'Cerrar menú' : 'Abrir menú'}</span>
      </button>

      <nav
        id="menu-principal"
        aria-label="Principal"
        className={`navbar-links ${abierto ? 'abierto' : ''}`}
        onClickCapture={handleClickCapture}
      >
        {children}
      </nav>
    </>
  )
}

export default MenuDesplegable
