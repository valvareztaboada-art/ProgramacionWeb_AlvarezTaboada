import Logo from './Logo'
import Icono from './Icono'
import EnlaceNav from './EnlaceNav'
import BotonCerrarSesion from './BotonCerrarSesion'

// Server Component. Solo el enlace (EnlaceNav) y el botón de salir son Client Components.
// El ícono se dibuja en el servidor y se les pasa como children.
function Sidebar({ titulo, menu, usuario }) {
  return (
    <aside className="sidebar">
      <Logo claro />
      <p className="sidebar-titulo">{titulo}</p>
      <nav aria-label="Menú del panel">
        <ul>
          {menu.map((item) => (
            <li key={item.href}>
              <EnlaceNav href={item.href} exacto={item.exacto}>
                <Icono nombre={item.icono} /> {item.label}
              </EnlaceNav>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-pie">
        <p className="sidebar-usuario">
          <strong>{usuario.nombre}</strong>
          <span>{usuario.email}</span>
        </p>
        <BotonCerrarSesion>
          <Icono nombre="salir" /> Cerrar sesión
        </BotonCerrarSesion>
      </div>
    </aside>
  )
}

export default Sidebar
