'use client'

// Client Component: usa useState, eventos (onChange, onSubmit) y useRouter.
// Login de maqueta: todavía no valida nada.
// Cuando veamos Supabase Auth, acá va la autenticación real con roles.

import { useState } from 'react'
import { useRouter } from 'next/navigation'

function FormularioLogin() {
  const [rol, setRol] = useState('cliente')
  const router = useRouter()

  function handleSubmit(e) {
    e.preventDefault()
    router.push(rol === 'cliente' ? '/cliente' : '/veterinaria')
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
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
  )
}

export default FormularioLogin
