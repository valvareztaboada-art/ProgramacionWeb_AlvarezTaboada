import Link from 'next/link'
import FormularioLogin from '@/components/FormularioLogin'
import { PerroCara, GatoCara } from '@/components/ilustraciones/Ilustraciones'

export const metadata = { title: 'Ingresar' }

// La página es Server Component: solo el formulario (la parte interactiva) es Client Component.
// searchParams trae los parámetros de la URL (ej: /login?error=confirmacion)
// "siguiente" es la página privada que se quería abrir (la pone el proxy).
export default async function LoginPage({ searchParams }) {
  const { error, siguiente } = await searchParams

  return (
    <section className="login fondo-patron">
      <div className="card login-card">
        <div className="login-caras">
          <PerroCara />
          <GatoCara />
        </div>
        <h1>¡Hola de nuevo!</h1>
        {error === 'confirmacion' && (
          <p className="form-error" role="alert">
            El enlace de confirmación no es válido o ya venció. Probá ingresar o registrarte de nuevo.
          </p>
        )}
        {siguiente && (
          <p className="aviso-login" role="status">Ingresá para continuar. Después te llevamos a donde ibas.</p>
        )}
        <FormularioLogin siguiente={siguiente} />
        <p className="login-alternativa">
          ¿Primera vez en MICAN? <Link href="/registro" className="enlace">Creá tu cuenta</Link>
        </p>
      </div>
    </section>
  )
}
