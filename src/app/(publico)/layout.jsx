import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SaltarAlContenido from '@/components/SaltarAlContenido'

// Grupo de rutas "(publico)": el paréntesis hace que NO aparezca en la URL.
// Sirve para que el inicio, el login y el registro compartan este layout (navbar + footer).
export default function PublicoLayout({ children }) {
  return (
    <div className="public-layout">
      <SaltarAlContenido />
      <Navbar />
      <main id="contenido" tabIndex={-1}>{children}</main>
      <Footer />
    </div>
  )
}
