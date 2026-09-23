import { Link } from 'react-router-dom'
import { PerroCara } from './ilustraciones/Ilustraciones.jsx'

function Logo({ claro = false }) {
  return (
    <Link to="/" className={`logo ${claro ? 'logo-claro' : ''}`} aria-label="MICAN, ir al inicio">
      <span className="logo-marca">
        <PerroCara />
      </span>
      MICAN
    </Link>
  )
}

export default Logo
