import Link from 'next/link'
import { CONTACTO, HORARIOS } from '@/lib/contacto'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-contenido">
        <div>
          <h2>MICAN</h2>
          <address>
            {CONTACTO.direccion}
            <br />
            <a href={CONTACTO.telefonoLink}>{CONTACTO.telefono}</a> ·{' '}
            <a href={`mailto:${CONTACTO.email}`}>{CONTACTO.email}</a>
          </address>
        </div>
        <div>
          <h2>Horarios</h2>
          <ul>
            {HORARIOS.map((h) => <li key={h.dias}>{h.dias}: {h.horas}</li>)}
          </ul>
        </div>
        <nav aria-label="Enlaces del pie">
          <h2>Tu cuenta</h2>
          <ul>
            <li><Link href="/login">Ingresar</Link></li>
            <li><Link href="/registro">Crear cuenta</Link></li>
            <li><Link href="/servicios">Servicios</Link></li>
            <li><Link href="/#como-funciona">Cómo funciona</Link></li>
            <li><Link href="/#preguntas">Preguntas frecuentes</Link></li>
          </ul>
        </nav>
        <p className="footer-legal">
          © {new Date().getFullYear()} MICAN · Proyecto de Programación Web. Datos y opiniones ilustrativos.
        </p>
      </div>
    </footer>
  )
}

export default Footer
