'use client'

// Client Component: usa el hook useFormulario, eventos y Supabase Auth desde el navegador.
// El rol no se elige: se lee del perfil del usuario en la base de datos.
//
// Seguridad:
//   · La contraseña viaja por HTTPS a Supabase Auth, que la compara con su hash bcrypt.
//   · Después de varios intentos fallidos se bloquea el botón un tiempo que va creciendo
//     (bloqueo progresivo). El límite real lo aplica Supabase en el servidor, por IP.
//   · El mensaje de error es el mismo si el email no existe o si la contraseña está mal:
//     así no se puede averiguar qué emails tienen cuenta.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Campo from './Campo'
import { useFormulario } from '@/hooks/useFormulario'
import { validarLogin } from '@/lib/validaciones'
import { esperaTrasFallos, formatearEspera } from '@/lib/intentos'
import { crearClienteNavegador } from '@/lib/supabase/navegador'
import { mensajeDeError } from '@/lib/supabase/mensajes'

function FormularioLogin() {
  const { datos, errores, handleChange, validarAlEnviar } = useFormulario({ email: '', password: '' }, validarLogin)
  const [errorGeneral, setErrorGeneral] = useState('')
  const [cargando, setCargando] = useState(false)
  const [fallos, setFallos] = useState(0)
  const [segundosDeEspera, setSegundosDeEspera] = useState(0)
  const router = useRouter()

  // Cuenta regresiva del bloqueo: baja de a un segundo hasta llegar a 0
  useEffect(() => {
    if (segundosDeEspera <= 0) return
    const temporizador = setTimeout(() => setSegundosDeEspera((s) => s - 1), 1000)
    return () => clearTimeout(temporizador)
  }, [segundosDeEspera])

  const bloqueado = segundosDeEspera > 0

  async function handleSubmit(e) {
    e.preventDefault()
    if (bloqueado) return
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
        if (error.code === 'invalid_credentials') {
          const nuevosFallos = fallos + 1
          setFallos(nuevosFallos)
          setSegundosDeEspera(esperaTrasFallos(nuevosFallos))
        }
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
      {bloqueado && (
        <p className="aviso-bloqueo" role="status">
          Por seguridad, después de {fallos} intentos fallidos esperá{' '}
          <strong>{formatearEspera(segundosDeEspera)}</strong> para volver a probar.
        </p>
      )}

      <button type="submit" className="btn btn-primario" disabled={cargando || bloqueado}>
        {cargando ? 'Ingresando…' : bloqueado ? `Esperá ${formatearEspera(segundosDeEspera)}` : 'Entrar'}
      </button>
    </form>
  )
}

export default FormularioLogin
