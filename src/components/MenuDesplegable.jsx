'use client'

// Client Component: en el celular el menú se abre y se cierra (useState + onClick).
// Los enlaces llegan como children desde Navbar (Server Component).
// En pantallas grandes el botón se oculta con CSS y el menú se ve siempre.

import { useEffect, useRef, useState } from 'react'
import Icono from './Icono'

function MenuDesplegable({ children }) {
  const [abierto, setAbierto] = useState(false)
  const boton = useRef(null)

  // Con Escape se cierra y el foco vuelve al botón (accesibilidad con teclado)
  useEffect(() => {
    if (!abierto) return
    function alApretarTecla(e) {
      if (e.key === 'Escape') {
        setAbierto(false)
        boton.current?.focus()
      }
    }
    document.addEventListener('keydown', alApretarTecla)
    return () => document.removeEventListener('keydown', alApretarTecla)
  }, [abierto])

  // Si se toca un enlace del menú, se cierra (útil en el celular)
  function handleClickCapture(e) {
    if (e.target.closest('a')) setAbierto(false)
  }

  return (
    <>
      <button
        ref={boton}
        type="button"
        className="menu-boton"
        aria-expanded={abierto}
        aria-controls="menu-principal"
        onClick={() => setAbierto(!abierto)}
      >
        <Icono nombre={abierto ? 'cerrar' : 'menu'} />
        {abierto ? 'Cerrar' : 'Menú'}
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
