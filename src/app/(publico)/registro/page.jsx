import Link from 'next/link'
import FormularioRegistro from '@/components/FormularioRegistro'
import { PerroCara, GatoCara } from '@/components/ilustraciones/Ilustraciones'

export const metadata = { title: 'Crear cuenta' }

// Server Component: solo el formulario es Client Component
export default function RegistroPage() {
  return (
    <section className="login fondo-patron">
      <div className="card login-card">
        <div className="login-caras">
          <PerroCara />
          <GatoCara />
        </div>
        <h1>Creá tu cuenta</h1>
        <p className="texto-suave login-intro">
          Registrate con el email que le diste a la veterinaria y vas a ver a tus mascotas,
          sus turnos, vacunas y estudios.
        </p>
        <FormularioRegistro />
        <p className="login-alternativa">
          ¿Ya tenés cuenta? <Link href="/login" className="enlace">Ingresá</Link>
        </p>
      </div>
    </section>
  )
}
