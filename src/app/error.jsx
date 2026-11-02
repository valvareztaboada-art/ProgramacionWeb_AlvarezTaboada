'use client' // Las pantallas de error de Next.js tienen que ser Client Components

// Si algo falla al mostrar una página (ej: la base no responde), se ve esta pantalla en lugar
// del mensaje técnico de Next.js. "retry" vuelve a pedir la página sin recargar todo.
// El detalle del error queda en los logs del servidor (Vercel → Logs), no en pantalla.

import Link from 'next/link'
import { PerroCara } from '@/components/ilustraciones/Ilustraciones'

export default function ErrorDePagina({ retry }) {
  return (
    <section className="seccion centrado no-encontrado">
      <PerroCara className="no-encontrado-gato" />
      <h1>Algo no salió como esperábamos</h1>
      <p>No es tu culpa. Probá de nuevo en un momento y, si sigue pasando, llamanos.</p>
      <div className="form-exito-botones">
        <button type="button" className="btn btn-primario" onClick={() => retry()}>Probar de nuevo</button>
        <Link href="/" className="btn btn-secundario">Volver al inicio</Link>
      </div>
    </section>
  )
}
