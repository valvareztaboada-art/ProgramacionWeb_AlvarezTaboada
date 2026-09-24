import FormularioLogin from '@/components/FormularioLogin'
import { PerroCara, GatoCara } from '@/components/ilustraciones/Ilustraciones'

export const metadata = { title: 'Ingresar' }

// La página es Server Component: solo el formulario (la parte interactiva) es Client Component
export default function LoginPage() {
  return (
    <section className="login fondo-patron">
      <div className="card login-card">
        <div className="login-caras">
          <PerroCara />
          <GatoCara />
        </div>
        <h1>¡Hola de nuevo!</h1>
        <FormularioLogin />
      </div>
    </section>
  )
}
