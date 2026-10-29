import Link from 'next/link'
import FormularioRecuperar from '@/components/FormularioRecuperar'

export const metadata = { title: 'Recuperar la contraseña' }

// "Olvidé mi contraseña": se pide el email y Supabase manda un enlace para elegir una nueva
export default function Recuperar() {
  return (
    <section className="login fondo-patron">
      <div className="card login-card">
        <h1>¿Olvidaste tu contraseña?</h1>
        <p className="texto-suave login-intro">
          Escribí el email de tu cuenta y te mandamos un enlace para elegir una nueva.
        </p>
        <FormularioRecuperar />
        <p className="login-alternativa">
          ¿Te acordaste? <Link href="/login" className="enlace">Volver a ingresar</Link>
        </p>
      </div>
    </section>
  )
}
