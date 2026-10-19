import Link from 'next/link'
import Icono from './Icono'

// claro: para fondos oscuros (la barra del sitio público)
function Logo({ claro = false }) {
  return (
    <Link href="/" className={`logo ${claro ? 'logo-claro' : ''}`} aria-label="MICAN, ir al inicio">
      <span className="logo-marca">
        <Icono nombre="huella" size={30} />
      </span>
      MICAN
    </Link>
  )
}

export default Logo
