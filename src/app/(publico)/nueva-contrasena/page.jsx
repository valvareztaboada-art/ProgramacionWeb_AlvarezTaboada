import Link from 'next/link'
import FormularioContrasena from '@/components/FormularioContrasena'
import { obtenerUsuarioActual } from '@/lib/datos'
import { inicioDelRol } from '@/lib/destino'

export const metadata = { title: 'Contraseña nueva' }

// Se llega desde el enlace del email de "Olvidé mi contraseña": /auth/confirmar ya inició la sesión.
// Sin sesión (enlace vencido o abierto en otro navegador) se pide uno nuevo.
export default async function NuevaContrasena() {
  const usuario = await obtenerUsuarioActual()

  return (
    <section className="login fondo-patron">
      <div className="card login-card">
        <h1>Elegí tu contraseña nueva</h1>
        {usuario ? (
          <>
            <p className="texto-suave login-intro">Para la cuenta <strong>{usuario.email}</strong>.</p>
            <FormularioContrasena destino={inicioDelRol(usuario.rol)} />
          </>
        ) : (
          <p className="login-intro">
            El enlace venció o se abrió en otro navegador.{' '}
            <Link href="/recuperar" className="enlace">Pedí uno nuevo</Link>.
          </p>
        )}
      </div>
    </section>
  )
}
