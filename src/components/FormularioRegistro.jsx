'use client'

// Client Component: usa el hook useFormulario, eventos y Supabase Auth.
// Crea la cuenta (siempre con rol "cliente": lo decide la base de datos)
// y Supabase le manda un email para confirmarla.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Campo from './Campo'
import { useFormulario } from '@/hooks/useFormulario'
import { validarRegistro } from '@/lib/validaciones'
import { crearClienteNavegador } from '@/lib/supabase/navegador'
import { mensajeDeError } from '@/lib/supabase/mensajes'

const VACIO = { nombre: '', email: '', telefono: '', password: '', confirmar: '' }

function FormularioRegistro() {
  const { datos, errores, handleChange, validarAlEnviar } = useFormulario(VACIO, validarRegistro)
  const [errorGeneral, setErrorGeneral] = useState('')
  const [cargando, setCargando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorGeneral('')
    if (!validarAlEnviar()) return

    setCargando(true)
    try {
      const { data, error } = await crearClienteNavegador().auth.signUp({
        email: datos.email.trim().toLowerCase(),
        password: datos.password,
        options: {
          // Estos datos los usa la base para crear el perfil (el rol NO se manda)
          data: { nombre: datos.nombre.trim(), telefono: datos.telefono.trim() },
          // A dónde vuelve después de tocar el link del email
          emailRedirectTo: `${window.location.origin}/auth/confirmar`,
        },
      })

      if (error) {
        setErrorGeneral(mensajeDeError(error))
        return
      }

      // Si el proyecto no pide confirmar el email, ya queda la sesión iniciada
      if (data.session) {
        router.push('/cliente')
        router.refresh()
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
        <h2>¡Ya casi, {datos.nombre.split(' ')[0]}!</h2>
        <p>
          Te mandamos un email a <strong>{datos.email}</strong>. Tocá el enlace para
          confirmar tu cuenta y vas a entrar directo.
        </p>
        <p className="texto-suave">
          Si la veterinaria ya cargó a tu mascota con este email, la vas a encontrar en tu cuenta.
          ¿No te llegó? Revisá la carpeta de spam.
        </p>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <Campo id="nombre" label="Nombre y apellido" error={errores.nombre}>
        <input id="nombre" name="nombre" type="text" autoComplete="name"
          value={datos.nombre} onChange={handleChange}
          aria-invalid={Boolean(errores.nombre)} aria-describedby="nombre-mensaje" />
      </Campo>

      <Campo id="email" label="Email" error={errores.email}
        ayuda="Usá el mismo email que le diste a la veterinaria.">
        <input id="email" name="email" type="email" autoComplete="email" placeholder="tu@email.com"
          value={datos.email} onChange={handleChange}
          aria-invalid={Boolean(errores.email)} aria-describedby="email-mensaje" />
      </Campo>

      <Campo id="telefono" label="Teléfono (opcional)" error={errores.telefono}>
        <input id="telefono" name="telefono" type="tel" autoComplete="tel" placeholder="11 2345-6789"
          value={datos.telefono} onChange={handleChange}
          aria-invalid={Boolean(errores.telefono)} aria-describedby="telefono-mensaje" />
      </Campo>

      <Campo id="password" label="Contraseña" error={errores.password} ayuda="Mínimo 8 caracteres.">
        <input id="password" name="password" type="password" autoComplete="new-password"
          value={datos.password} onChange={handleChange}
          aria-invalid={Boolean(errores.password)} aria-describedby="password-mensaje" />
      </Campo>

      <Campo id="confirmar" label="Repetí la contraseña" error={errores.confirmar}>
        <input id="confirmar" name="confirmar" type="password" autoComplete="new-password"
          value={datos.confirmar} onChange={handleChange}
          aria-invalid={Boolean(errores.confirmar)} aria-describedby="confirmar-mensaje" />
      </Campo>

      {errorGeneral && <p className="form-error" role="alert">{errorGeneral}</p>}

      <button type="submit" className="btn btn-primario" disabled={cargando}>
        {cargando ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>
    </form>
  )
}

export default FormularioRegistro
