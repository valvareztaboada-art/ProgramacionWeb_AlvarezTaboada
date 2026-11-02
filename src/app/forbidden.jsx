import Link from 'next/link'
import { PerroCara } from '@/components/ilustraciones/Ilustraciones'
import { obtenerUsuarioActual } from '@/lib/datos'
import { inicioDelRol } from '@/lib/destino'

export const metadata = { title: 'Sección de otra cuenta' }

// Next.js muestra esta página (y responde HTTP 403 Forbidden) cuando se llama a forbidden():
// la persona SÍ inició sesión (está autenticada), pero su rol no tiene permiso para esa sección.
// Distinto del 401: ahí no hay sesión y la mandamos a iniciarla.
// El código 403 queda en la respuesta HTTP; en pantalla no se muestra, porque a la persona
// no le dice nada y puede asustarla.
export default async function SinPermiso() {
  const usuario = await obtenerUsuarioActual()

  return (
    <section className="seccion centrado no-encontrado">
      <PerroCara className="no-encontrado-gato" />
      <h1>Esta sección es del equipo de la veterinaria</h1>
      <p>Tus mascotas, turnos y pagos están en tu cuenta.</p>
      <Link href={inicioDelRol(usuario?.rol)} className="btn btn-primario">Ir a mi cuenta</Link>
    </section>
  )
}
