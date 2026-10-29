'use client'

// Client Component: pide el email y Supabase Auth manda un enlace para elegir una contraseña nueva.
// Seguridad: el mensaje es SIEMPRE el mismo, exista o no una cuenta con ese email
// (así nadie puede averiguar qué emails están registrados).

import { useState } from 'react'
import Campo from './Campo'
import { useFormulario } from '@/hooks/useFormulario'
import { validarRecuperar } from '@/lib/validaciones'
import { crearClienteNavegador } from '@/lib/supabase/navegador'
import { mensajeDeError } from '@/lib/supabase/mensajes'

function FormularioRecuperar() {
  const { datos, errores, handleChange, validarAlEnviar } = useFormulario({ email: '' }, validarRecuperar)
  const [cargando, setCargando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorGeneral('')
    if (!validarAlEnviar()) return

    setCargando(true)
    try {
      const { error } = await crearClienteNavegador().auth.resetPasswordForEmail(datos.email.trim().toLowerCase(), {
        // El enlace del email vuelve a /auth/confirmar, que inicia la sesión y lleva a elegir la contraseña
        redirectTo: `${window.location.origin}/auth/confirmar?siguiente=/nueva-contrasena`,
      })
      // Solo mostramos errores que no revelan nada (ej: demasiados pedidos o sin conexión)
      if (error && error.code !== 'user_not_found') {
        setErrorGeneral(mensajeDeError(error))
        return
      }
      setEnviado(true)
    } catch (error) {
      setErrorGeneral(mensajeDeError(error))
    } finally {
      setCargando(false)
    }
  }

  if (enviado) {
    return (
      <div className="form-exito" role="status">
        <h2>Revisá tu email</h2>
        <p>
          Si <strong>{datos.email.trim().toLowerCase()}</strong> tiene una cuenta en MICAN, te mandamos un enlace para
          elegir una contraseña nueva. Puede tardar unos minutos (y fijate en la carpeta de spam).
        </p>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <Campo id="email" label="Email de tu cuenta" error={errores.email}>
        <input id="email" name="email" type="email" autoComplete="email" placeholder="tu@email.com"
          value={datos.email} onChange={handleChange}
          aria-invalid={Boolean(errores.email)} aria-describedby="email-mensaje" />
      </Campo>
      {errorGeneral && <p className="form-error" role="alert">{errorGeneral}</p>}
      <button type="submit" className="btn btn-primario" disabled={cargando}>
        {cargando ? 'Enviando…' : 'Mandarme el enlace'}
      </button>
    </form>
  )
}

export default FormularioRecuperar
