'use client'

// Client Component: usa useState, eventos y Supabase Auth desde el navegador.
// Ya no se elige el rol: se lee del perfil del usuario en la base de datos.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearClienteNavegador } from '@/lib/supabase/navegador'
import { mensajeDeError } from '@/lib/supabase/mensajes'

function FormularioLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setCargando(true)

    const supabase = crearClienteNavegador()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(mensajeDeError(error))
      setCargando(false)
      return
    }

    // ¿Es cliente o veterinaria? Lo dice su perfil (no lo elige el usuario)
    const { data: perfil } = await supabase.from('perfiles').select('rol').eq('id', data.user.id).single()
    router.push(perfil?.rol === 'veterinaria' ? '/veterinaria' : '/cliente')
    router.refresh()
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" autoComplete="email" placeholder="tu@email.com" required
        value={email} onChange={(e) => setEmail(e.target.value)} />

      <label htmlFor="password">Contraseña</label>
      <input id="password" type="password" autoComplete="current-password" required
        value={password} onChange={(e) => setPassword(e.target.value)} />

      {error && <p className="form-error" role="alert">{error}</p>}

      <button type="submit" className="btn btn-primario" disabled={cargando}>
        {cargando ? 'Ingresando…' : 'Entrar'}
      </button>
    </form>
  )
}

export default FormularioLogin
