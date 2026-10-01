'use client'

// Client Component: usa el hook useFormulario, eventos y Supabase Auth desde el navegador.
// El rol no se elige: se lee del perfil del usuario en la base de datos.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Campo from './Campo'
import { useFormulario } from '@/hooks/useFormulario'
import { validarLogin } from '@/lib/validaciones'
import { crearClienteNavegador } from '@/lib/supabase/navegador'
import { mensajeDeError } from '@/lib/supabase/mensajes'

function FormularioLogin() {
  const { datos, errores, handleChange, validarAlEnviar } = useFormulario({ email: '', password: '' }, validarLogin)
  const [errorGeneral, setErrorGeneral] = useState('')
  const [cargando, setCargando] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorGeneral('')
    if (!validarAlEnviar()) return

    setCargando(true)
    try {
      const supabase = crearClienteNavegador()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: datos.email.trim().toLowerCase(),
        password: datos.password,
      })
      if (error) {
        setErrorGeneral(mensajeDeError(error))
        return
      }

      // ¿Es cliente o veterinaria? Lo dice su perfil (no lo elige el usuario)
      const { data: perfil } = await supabase.from('perfiles').select('rol').eq('id', data.user.id).single()
      router.push(perfil?.rol === 'veterinaria' ? '/veterinaria' : '/cliente')
      router.refresh()
    } catch (error) {
      setErrorGeneral(mensajeDeError(error))
    } finally {
      setCargando(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <Campo id="email" label="Email" error={errores.email}>
        <input id="email" name="email" type="email" autoComplete="email" placeholder="tu@email.com"
          value={datos.email} onChange={handleChange}
          aria-invalid={Boolean(errores.email)} aria-describedby="email-mensaje" />
      </Campo>

      <Campo id="password" label="Contraseña" error={errores.password}>
        <input id="password" name="password" type="password" autoComplete="current-password"
          value={datos.password} onChange={handleChange}
          aria-invalid={Boolean(errores.password)} aria-describedby="password-mensaje" />
      </Campo>

      {errorGeneral && <p className="form-error" role="alert">{errorGeneral}</p>}

      <button type="submit" className="btn btn-primario" disabled={cargando}>
        {cargando ? 'Ingresando…' : 'Entrar'}
      </button>
    </form>
  )
}

export default FormularioLogin
