import { Link, NavLink } from 'react-router-dom'
import Logo from './Logo.jsx'
import Icono from './Icono.jsx'

function Sidebar({ titulo, menu }) {
  return (
    <aside className="sidebar">
      <Logo claro />
      <p className="sidebar-titulo">{titulo}</p>
      <nav>
        <ul>
          {menu.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.end}>
                <Icono nombre={item.icon} /> {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <Link to="/login" className="sidebar-salir">
        <Icono nombre="salir" /> Cerrar sesión
      </Link>
    </aside>
  )
}

export default Sidebar
