import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

// Grupo de rutas "(publico)": el paréntesis hace que NO aparezca en la URL.
// Sirve para que el inicio y el login compartan este layout (navbar + footer).
export default function PublicoLayout({ children }) {
  return (
    <div className="public-layout">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
