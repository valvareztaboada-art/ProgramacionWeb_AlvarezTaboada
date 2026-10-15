import Link from 'next/link'
import { PerroCara } from '@/components/ilustraciones/Ilustraciones'
import { obtenerUsuarioActual } from '@/lib/datos'

export const metadata = { title: 'Sin permiso' }

// Next.js muestra esta página (y responde HTTP 403 Forbidden) cuando se llama a forbidden():
// la persona SÍ inició sesión (está autenticada), pero su rol no tiene permiso para esa sección.
// Distinto del 401: ahí no hay sesión y la mandamos a iniciarla.
export default async function SinPermiso() {
  const usuario = await obtenerUsuarioActual()
  const miPanel = usuario?.rol === 'veterinaria' ? '/veterinaria' : '/cliente'

  return (
    <section className="seccion centrado no-encontrado">
      <PerroCara className="no-encontrado-gato" />
      <h1>403</h1>
      <p>Esta sección no es para tu tipo de cuenta.</p>
      <Link href={miPanel} className="btn btn-primario">Ir a mi cuenta</Link>
    </section>
  )
}
