import Link from 'next/link'
import FormularioContrasena from '@/components/FormularioContrasena'
import { obtenerUsuarioActual } from '@/lib/datos'
import { inicioDelRol } from '@/lib/destino'

export const metadata = { title: 'Contraseña nueva' }

// Se llega desde el enlace del email de "Olvidé mi contraseña". El enlace trae:
//   · ?token_hash=…&type=recovery (plantilla de email de MICAN, ver docs/seguridad.md): funciona en
//     cualquier navegador o celular. El enlace se usa recién al tocar "Guardar", así si el servicio de
//     correo lo abre antes para revisarlo, no lo gasta.
//   · ?code=… (plantilla por defecto de Supabase): funciona si se abre en el mismo navegador.
// Sin enlace pero con la sesión iniciada, también sirve para elegir una contraseña nueva.
export default async function NuevaContrasena({ searchParams }) {
  const { token_hash: tokenHash, type: tipo, code: codigo } = await searchParams
  const enlace = tokenHash && tipo === 'recovery'
    ? { tokenHash }
    : codigo ? { codigo } : null
  const usuario = enlace ? null : await obtenerUsuarioActual()

  return (
    <section className="login fondo-patron">
      <div className="card login-card">
        <h1>Elegí tu contraseña nueva</h1>
        {enlace || usuario ? (
          <>
            {usuario && <p className="texto-suave login-intro">Para la cuenta <strong>{usuario.email}</strong>.</p>}
            {/* Con el enlace todavía no sabemos el rol: /cliente lleva a la veterinaria a su panel */}
            <FormularioContrasena enlace={enlace} destino={usuario ? inicioDelRol(usuario.rol) : '/cliente'} />
          </>
        ) : (
          <p className="login-intro">
            El enlace venció o ya se usó.{' '}
            <Link href="/recuperar" className="enlace">Pedí uno nuevo</Link>.
          </p>
        )}
      </div>
    </section>
  )
}
