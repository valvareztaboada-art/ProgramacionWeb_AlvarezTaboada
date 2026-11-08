'use client'

// Client Component: elegir una contraseña nueva (Supabase Auth guarda solo su hash bcrypt).
// Se usa en dos lugares:
//   · /nueva-contrasena, al volver del enlace de "Olvidé mi contraseña" (después va a su panel)
//   · "Mi perfil", para cambiarla estando con la sesión iniciada
// Exige lo mismo que el registro: largo, mayúscula, número, símbolo y que no sea obvia.

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Campo from './Campo'
import MedidorContrasena from './MedidorContrasena'
import { useFormulario } from '@/hooks/useFormulario'
import { validarNuevaContrasena } from '@/lib/validaciones'
import { crearClienteNavegador } from '@/lib/supabase/navegador'
import { mensajeDeError } from '@/lib/supabase/mensajes'

const VACIO = { password: '', confirmar: '' }

// destino: si viene, después de guardar va ahí (recuperación); si no, muestra "Listo" (perfil)
// enlace: lo que trae el email de "Olvidé mi contraseña": { accessToken, refreshToken } (email por defecto),
// { tokenHash } (plantilla propia) o { codigo } (PKCE). Se usa recién al guardar.
function FormularioContrasena({ destino, enlace = null }) {
  const { datos, errores, handleChange, validarAlEnviar, reiniciar } = useFormulario(VACIO, validarNuevaContrasena)
  const [cargando, setCargando] = useState(false)
  const [listo, setListo] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')
  const [enlaceVencido, setEnlaceVencido] = useState(false)
  const sesionLista = useRef(!enlace) // el enlace se usa una sola vez
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorGeneral('')
    setListo(false)
    if (!validarAlEnviar()) return

    setCargando(true)
    try {
      const supabase = crearClienteNavegador()

      // 1. Con el enlace del email se inicia la sesión de recuperación
      if (!sesionLista.current) {
        const { error } = enlace.accessToken
          ? await supabase.auth.setSession({ access_token: enlace.accessToken, refresh_token: enlace.refreshToken })
          : enlace.tokenHash
            ? await supabase.auth.verifyOtp({ token_hash: enlace.tokenHash, type: 'recovery' })
            : await supabase.auth.exchangeCodeForSession(enlace.codigo)
        if (error) {
          setEnlaceVencido(true)
          return
        }
        sesionLista.current = true
      }

      // 2. Se guarda la contraseña nueva
      const { error } = await supabase.auth.updateUser({ password: datos.password })
      if (error) {
        setErrorGeneral(error.code === 'same_password'
          ? 'Esa es tu contraseña actual. Elegí una distinta.'
          : mensajeDeError(error))
        return
      }
      if (destino) {
        router.push(destino)
        router.refresh()
        return
      }
      reiniciar()
      setListo(true)
    } catch (error) {
      setErrorGeneral(mensajeDeError(error))
    } finally {
      setCargando(false)
    }
  }

  if (enlaceVencido) {
    return (
      <div className="form-exito" role="alert">
        <p>El enlace venció o ya se usó (cada enlace sirve una sola vez y dura una hora).</p>
        <Link href="/recuperar" className="btn btn-primario">Pedir un enlace nuevo</Link>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <Campo id="password" label="Contraseña nueva" error={errores.password}>
        <input id="password" name="password" type="password" autoComplete="new-password" maxLength={72}
          value={datos.password} onChange={handleChange}
          aria-invalid={Boolean(errores.password)} aria-describedby="password-mensaje password-medidor" />
      </Campo>
      <div id="password-medidor">
        <MedidorContrasena contrasena={datos.password} />
      </div>

      <Campo id="confirmar" label="Repetí la contraseña nueva" error={errores.confirmar}>
        <input id="confirmar" name="confirmar" type="password" autoComplete="new-password"
          value={datos.confirmar} onChange={handleChange}
          aria-invalid={Boolean(errores.confirmar)} aria-describedby="confirmar-mensaje" />
      </Campo>

      {errorGeneral && <p className="form-error" role="alert">{errorGeneral}</p>}
      {listo && <p className="aviso-exito" role="status">Listo, tu contraseña quedó cambiada.</p>}

      <button type="submit" className="btn btn-primario" disabled={cargando}>
        {cargando ? 'Guardando…' : 'Guardar contraseña'}
      </button>
    </form>
  )
}

export default FormularioContrasena
