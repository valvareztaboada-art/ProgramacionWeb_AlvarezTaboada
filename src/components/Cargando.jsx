import { GatoDurmiendo } from './ilustraciones/Ilustraciones'

// Se muestra mientras el servidor busca los datos (lo usan los loading.jsx)
function Cargando() {
  return (
    <div className="cargando" role="status">
      <GatoDurmiendo className="cargando-gato" />
      <p className="texto-suave">Cargando…</p>
    </div>
  )
}

export default Cargando
