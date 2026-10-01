'use client'

// Client Component: usa el hook useFormulario y eventos (onChange, onSubmit).
// Inserta la mascota en Supabase. Solo funciona para la veterinaria:
// el RLS rechaza el INSERT de cualquier otro usuario.

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Campo from './Campo'
import { useFormulario } from '@/hooks/useFormulario'
import { validarPaciente } from '@/lib/validaciones'
import { crearClienteNavegador } from '@/lib/supabase/navegador'
import { mensajeDeError } from '@/lib/supabase/mensajes'

const VACIO = { nombre: '', especie: '', raza: '', edad: '', emailDuenio: '' }

function FormularioPaciente() {
  const { datos, errores, handleChange, validarAlEnviar, reiniciar } = useFormulario(VACIO, validarPaciente)
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
      const { error } = await crearClienteNavegador().from('mascotas').insert({
        nombre: datos.nombre.trim(),
        especie: datos.especie,
        raza: datos.raza.trim() || null,
        edad: datos.edad === '' ? null : Number(datos.edad),
        email_duenio: datos.emailDuenio.trim().toLowerCase(),
      })

      if (error) {
        setErrorGeneral(mensajeDeError(error))
        return
      }
      setEnviado(true)
      router.refresh()
    } catch (error) {
      setErrorGeneral(mensajeDeError(error))
    } finally {
      setCargando(false)
    }
  }

  function cargarOtro() {
    reiniciar()
    setErrorGeneral('')
    setEnviado(false)
  }

  if (enviado) {
    return (
      <div className="form-exito" role="status">
        <h2>¡{datos.nombre} quedó cargado/a!</h2>
        <p>
          Cuando <strong>{datos.emailDuenio}</strong> se registre en MICAN con ese email,
          va a ver a {datos.nombre} en su cuenta.
        </p>
        <div className="form-exito-botones">
          <button type="button" className="btn btn-primario" onClick={cargarOtro}>Cargar otro paciente</button>
          <Link href="/veterinaria/pacientes" className="btn btn-secundario">Ver pacientes</Link>
        </div>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <fieldset className="form-grupo">
        <legend>Mascota</legend>

        <Campo id="nombre" label="Nombre" error={errores.nombre}>
          <input id="nombre" name="nombre" type="text"
            value={datos.nombre} onChange={handleChange}
            aria-invalid={Boolean(errores.nombre)} aria-describedby="nombre-mensaje" />
        </Campo>

        <div className="form-fila">
          <Campo id="especie" label="Especie" error={errores.especie}>
            <select id="especie" name="especie"
              value={datos.especie} onChange={handleChange}
              aria-invalid={Boolean(errores.especie)} aria-describedby="especie-mensaje">
              <option value="">Elegí una opción</option>
              <option value="Perro">Perro</option>
              <option value="Gato">Gato</option>
              <option value="Ave">Ave</option>
              <option value="Otro">Otro</option>
            </select>
          </Campo>

          <Campo id="edad" label="Edad (años)" error={errores.edad}>
            <input id="edad" name="edad" type="number" min="0" max="40"
              value={datos.edad} onChange={handleChange}
              aria-invalid={Boolean(errores.edad)} aria-describedby="edad-mensaje" />
          </Campo>
        </div>

        <Campo id="raza" label="Raza (opcional)">
          <input id="raza" name="raza" type="text" maxLength={40}
            value={datos.raza} onChange={handleChange} />
        </Campo>
      </fieldset>

      <fieldset className="form-grupo">
        <legend>Dueño/a</legend>

        <Campo id="emailDuenio" label="Email del dueño/a" error={errores.emailDuenio}
          ayuda="Cuando se registre con este email, va a ver a su mascota en su cuenta.">
          <input id="emailDuenio" name="emailDuenio" type="email" placeholder="dueño@email.com"
            value={datos.emailDuenio} onChange={handleChange}
            aria-invalid={Boolean(errores.emailDuenio)} aria-describedby="emailDuenio-mensaje" />
        </Campo>
      </fieldset>

      {errorGeneral && <p className="form-error" role="alert">{errorGeneral}</p>}

      <button type="submit" className="btn btn-primario" disabled={cargando}>
        {cargando ? 'Guardando…' : 'Guardar paciente'}
      </button>
    </form>
  )
}

export default FormularioPaciente
