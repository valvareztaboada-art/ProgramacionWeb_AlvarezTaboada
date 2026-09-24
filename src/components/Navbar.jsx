import Link from 'next/link'
import Logo from './Logo'
import EnlaceNav from './EnlaceNav'

function Navbar() {
  return (
    <header className="navbar">
      <Logo />
      <nav className="navbar-links">
        <EnlaceNav href="/" exacto>Inicio</EnlaceNav>
        <Link href="/#servicios">Servicios</Link>
        <Link href="/#contacto">Contacto</Link>
        <Link href="/login" className="btn btn-primario">Ingresar</Link>
      </nav>
    </header>
  )
}

export default Navbar
