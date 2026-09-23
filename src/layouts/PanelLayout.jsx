import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'

// Layout compartido por las dos interfaces (cliente y veterinaria).
// El "rol" cambia el color del panel.
function PanelLayout({ titulo, rol, menu }) {
  return (
    <div className={`panel-layout panel-${rol}`}>
      <Sidebar titulo={titulo} menu={menu} />
      <main className="panel-contenido">
        <Outlet />
      </main>
    </div>
  )
}

export default PanelLayout
