import Link from 'next/link'
import FormularioLogin from '@/components/FormularioLogin'
import { PerroCara, GatoCara } from '@/components/ilustraciones/Ilustraciones'

export const metadata = { title: 'Ingresar' }

// La página es Server Component: solo el formulario (la parte interactiva) es Client Component.
// searchParams trae los parámetros de la URL (ej: /login?error=confirmacion)
export default async function LoginPage({ searchParams }) {
  const { error } = await searchParams

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
        <FormularioLogin />
        <p className="login-alternativa">
          ¿Primera vez en MICAN? <Link href="/registro" className="enlace">Creá tu cuenta</Link>
        </p>
      </div>
    </section>
  )
}
