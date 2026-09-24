import Link from 'next/link'
import Logo from './Logo'
import Icono from './Icono'
import EnlaceNav from './EnlaceNav'

// Server Component. Solo el enlace (EnlaceNav) es Client Component.
// El ícono se dibuja en el servidor y se le pasa como children.
function Sidebar({ titulo, menu }) {
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
      <Link href="/login" className="sidebar-salir">
        <Icono nombre="salir" /> Cerrar sesión
      </Link>
    </aside>
  )
}

export default Sidebar
