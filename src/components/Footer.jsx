import { GatoDurmiendo } from './ilustraciones/Ilustraciones.jsx'

function Footer() {
  return (
    <footer className="footer">
      <GatoDurmiendo className="footer-gato" />
      <p className="footer-marca">MICAN</p>
      <p>Av. Siempre Viva 742 · (011) 1234-5678 · hola@mican.vet</p>
      <p className="footer-legal">© {new Date().getFullYear()} MICAN — Proyecto Programación Web</p>
    </footer>
  )
}

export default Footer
