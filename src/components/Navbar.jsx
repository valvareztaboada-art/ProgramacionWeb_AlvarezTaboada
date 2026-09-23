import { NavLink } from 'react-router-dom'
import Logo from './Logo.jsx'

function Navbar() {
  return (
    <header className="navbar">
      <Logo />
      <nav className="navbar-links">
        <NavLink to="/" end>Inicio</NavLink>
        <a href="/#servicios">Servicios</a>
        <a href="/#contacto">Contacto</a>
        <NavLink to="/login" className="btn btn-primario">Ingresar</NavLink>
      </nav>
    </header>
  )
}

export default Navbar
