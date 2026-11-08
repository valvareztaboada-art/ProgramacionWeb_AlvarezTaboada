import NuevaContrasena from '@/components/NuevaContrasena'
import { obtenerUsuarioActual } from '@/lib/datos'
import { inicioDelRol } from '@/lib/destino'

export const metadata = { title: 'Contraseña nueva' }

// Se llega desde el enlace del email de "Olvidé mi contraseña". El enlace puede traer la sesión de
// recuperación de tres formas (las maneja NuevaContrasena):
//   · #access_token=… → email por defecto de Supabase (flujo "implicit"): funciona en cualquier navegador
//   · ?token_hash=…&type=recovery → si algún día se usa una plantilla de email propia
//   · ?code=… → flujo PKCE (solo funciona en el mismo navegador donde se pidió)
// Sin enlace pero con la sesión iniciada, también sirve para elegir una contraseña nueva.
export default async function PaginaNuevaContrasena({ searchParams }) {
  const { token_hash: tokenHash, type: tipo, code: codigo } = await searchParams
  const enlaceDelServidor = tokenHash && tipo === 'recovery' ? { tokenHash } : codigo ? { codigo } : null
  const usuario = enlaceDelServidor ? null : await obtenerUsuarioActual()

  return (
    <section className="login fondo-patron">
      <div className="card login-card">
        <h1>Elegí tu contraseña nueva</h1>
        {/* Con el enlace todavía no sabemos el rol: /cliente lleva a la veterinaria a su panel */}
        <NuevaContrasena enlaceDelServidor={enlaceDelServidor} email={usuario?.email ?? null}
          destino={usuario ? inicioDelRol(usuario.rol) : '/cliente'} />
      </div>
    </section>
  )
}
