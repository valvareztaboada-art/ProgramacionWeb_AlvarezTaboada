import Sidebar from './Sidebar'
import SaltarAlContenido from './SaltarAlContenido'

// Estructura compartida por las dos interfaces (cliente y veterinaria).
// El "rol" cambia el color del panel.
function PanelLayout({ titulo, rol, menu, children }) {
  return (
    <div className={`panel-layout panel-${rol}`}>
      <SaltarAlContenido />
      <Sidebar titulo={titulo} menu={menu} />
      <main id="contenido" tabIndex={-1} className="panel-contenido">{children}</main>
    </div>
  )
}

export default PanelLayout
