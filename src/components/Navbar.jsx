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
        <Link href="/#nosotros">Nosotros</Link>
        <Link href="/#servicios">Servicios</Link>
        <Link href="/#opiniones">Opiniones</Link>
        <Link href="/#contacto">Contacto</Link>
        <EnlaceNav href="/registro">Registrarse</EnlaceNav>
        <Link href="/login" className="btn btn-primario">Ingresar</Link>
      </MenuDesplegable>
    </header>
  )
}

export default Navbar
