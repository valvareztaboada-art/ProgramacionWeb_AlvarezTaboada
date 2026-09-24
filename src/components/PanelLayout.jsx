import Sidebar from './Sidebar'

// Estructura compartida por las dos interfaces (cliente y veterinaria).
// El "rol" cambia el color del panel.
function PanelLayout({ titulo, rol, menu, children }) {
  return (
    <div className={`panel-layout panel-${rol}`}>
      <Sidebar titulo={titulo} menu={menu} />
      <main className="panel-contenido">{children}</main>
    </div>
  )
}

export default PanelLayout
