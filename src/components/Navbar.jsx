import Link from 'next/link'
import Logo from './Logo'
import EnlaceNav from './EnlaceNav'
import MenuDesplegable from './MenuDesplegable'

// Server Component. Solo el menú desplegable y el enlace activo son Client Components.
function Navbar() {
  return (
    <header className="navbar">
      <Logo />
      <MenuDesplegable>
        <EnlaceNav href="/" exacto>Inicio</EnlaceNav>
        <Link href="/#servicios">Servicios</Link>
        <Link href="/#como-funciona">Cómo funciona</Link>
        <Link href="/#contacto">Contacto</Link>
        <EnlaceNav href="/registro">Registrarse</EnlaceNav>
        <Link href="/login" className="btn btn-primario">Ingresar</Link>
      </MenuDesplegable>
    </header>
  )
}

export default Navbar
