import Link from 'next/link'
import { GatoDurmiendo } from '@/components/ilustraciones/Ilustraciones'

// Next.js muestra esta página para rutas que no existen o cuando se llama a notFound()
export default function NotFound() {
  return (
    <section className="seccion centrado no-encontrado">
      <GatoDurmiendo className="no-encontrado-gato" />
      <h1>404</h1>
      <p>Shh… acá no hay nada, solo un gato durmiendo la siesta.</p>
      <Link href="/" className="btn btn-primario">Volver al inicio</Link>
    </section>
  )
}
