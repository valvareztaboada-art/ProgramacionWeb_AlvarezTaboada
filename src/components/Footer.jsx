import Link from 'next/link'
import { GatoDurmiendo } from './ilustraciones/Ilustraciones.jsx'
import { CONTACTO } from '@/lib/contacto'

function Footer() {
  return (
    <footer className="footer">
      <GatoDurmiendo className="footer-gato" />
      <p className="footer-marca">MICAN</p>
      <p>
        {CONTACTO.direccion} · <a href={CONTACTO.telefonoLink}>{CONTACTO.telefono}</a> ·{' '}
        <a href={`mailto:${CONTACTO.email}`}>{CONTACTO.email}</a>
      </p>
      <nav aria-label="Enlaces del pie" className="footer-enlaces">
        <Link href="/#nosotros">Quiénes somos</Link>
        <Link href="/#preguntas">Preguntas frecuentes</Link>
        <Link href="/login">Ingresar</Link>
      </nav>
      <p className="footer-legal">© {new Date().getFullYear()} MICAN — Proyecto Programación Web</p>
    </footer>
  )
}

export default Footer
