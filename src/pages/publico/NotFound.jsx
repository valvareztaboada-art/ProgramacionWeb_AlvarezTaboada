import { Link } from 'react-router-dom'
import { GatoDurmiendo } from '../../components/ilustraciones/Ilustraciones.jsx'

function NotFound() {
  return (
    <section className="seccion centrado no-encontrado">
      <GatoDurmiendo className="no-encontrado-gato" />
      <h1>404</h1>
      <p>Shh… acá no hay nada, solo un gato durmiendo la siesta.</p>
      <Link to="/" className="btn btn-primario">Volver al inicio</Link>
    </section>
  )
}

export default NotFound
