import Link from 'next/link'
import { GatoDurmiendo } from '@/components/ilustraciones/Ilustraciones'

export const metadata = { title: 'Página no encontrada' }

// Next.js muestra esta página (y responde HTTP 404) para rutas que no existen o cuando se
// llama a notFound(). El código queda en la respuesta; en pantalla, un mensaje que se entienda.
export default function NotFound() {
  return (
    <section className="seccion centrado no-encontrado">
      <GatoDurmiendo className="no-encontrado-gato" />
      <h1>No encontramos esta página</h1>
      <p>Shh… acá no hay nada, solo un gato durmiendo la siesta.</p>
      <Link href="/" className="btn btn-primario">Volver al inicio</Link>
    </section>
  )
}
