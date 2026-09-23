import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PerroCara, GatoCara } from '../../components/ilustraciones/Ilustraciones.jsx'

// Login de maqueta: todavía no valida nada.
// Cuando veamos Supabase Auth, acá va la autenticación real con roles.
function Login() {
  const [rol, setRol] = useState('cliente')
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    navigate(rol === 'cliente' ? '/cliente' : '/veterinaria')
  }

  return (
    <section className="login fondo-patron">
      <form className="card form" onSubmit={handleSubmit}>
        <div className="login-caras">
          <PerroCara />
          <GatoCara />
        </div>
        <h1>¡Hola de nuevo!</h1>

        <fieldset className="selector-rol">
          <legend>¿Cómo querés ingresar?</legend>
          <label className={rol === 'cliente' ? 'activo' : ''}>
            <input type="radio" name="rol" value="cliente"
              checked={rol === 'cliente'} onChange={(e) => setRol(e.target.value)} />
            Dueño/a
          </label>
          <label className={rol === 'veterinaria' ? 'activo' : ''}>
            <input type="radio" name="rol" value="veterinaria"
              checked={rol === 'veterinaria'} onChange={(e) => setRol(e.target.value)} />
            Veterinaria
          </label>
        </fieldset>

        <label htmlFor="email">Email</label>
        <input id="email" type="email" placeholder="tu@email.com" />

        <label htmlFor="password">Contraseña</label>
        <input id="password" type="password" placeholder="••••••••" />

        <button type="submit" className="btn btn-primario">Entrar</button>
      </form>
    </section>
  )
}

export default Login
