import Link from 'next/link'
import Logo from './Logo'
import MenuDesplegable from './MenuDesplegable'

// Server Component. Solo el menú desplegable (abrir/cerrar en el celular) es Client Component.
// Los enlaces a secciones usan "/#..." para que funcionen también desde /login o /registro.
// "Sacar turno" va directo al formulario: si no hay sesión, el proxy pide ingresar
// y después del login vuelve ahí.
function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-contenido">
        <Logo claro />
        <MenuDesplegable>
          <ul className="navbar-secciones">
            <li><Link href="/#servicios">Servicios</Link></li>
            <li><Link href="/#como-funciona">Cómo funciona</Link></li>
            <li><Link href="/#nosotros">Nosotros</Link></li>
            <li><Link href="/#contacto">Contacto</Link></li>
          </ul>
          <div className="navbar-acciones">
            <Link href="/login" className="btn btn-claro">Ingresar</Link>
            <Link href="/cliente/turnos/nuevo" className="btn btn-acento">Sacar turno</Link>
          </div>
        </MenuDesplegable>
      </div>
    </header>
  )
}

export default Navbar
