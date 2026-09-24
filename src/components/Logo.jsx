import Link from 'next/link'
import { PerroCara } from './ilustraciones/Ilustraciones'

function Logo({ claro = false }) {
  return (
    <Link href="/" className={`logo ${claro ? 'logo-claro' : ''}`} aria-label="MICAN, ir al inicio">
      <span className="logo-marca">
        <PerroCara />
      </span>
      MICAN
    </Link>
  )
}

export default Logo
