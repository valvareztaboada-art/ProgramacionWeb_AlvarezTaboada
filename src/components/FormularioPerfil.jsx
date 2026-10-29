'use client'

// Client Component: "Mi perfil" → nombre y teléfono, con fetch a PATCH /api/v1/perfil
// (la API vuelve a validar con Zod y el RLS solo deja modificar el perfil propio).

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Campo from './Campo'
import { useFormulario } from '@/hooks/useFormulario'
import { validarPerfil } from '@/lib/validaciones'
import { llamarApi } from '@/lib/api/cliente'

function FormularioPerfil({ perfil }) {
  const { datos, errores, handleChange, validarAlEnviar, mostrarErroresDelServidor } =
    useFormulario({ nombre: perfil.nombre ?? '', telefono: perfil.telefono ?? '' }, validarPerfil)
  const [cargando, setCargando] = useState(false)
  const [listo, setListo] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorGeneral('')
    setListo(false)
    if (!validarAlEnviar()) return

    setCargando(true)
    const { ok, datos: respuesta } = await llamarApi('/api/v1/perfil', {
      metodo: 'PATCH',
      cuerpo: { nombre: datos.nombre, telefono: datos.telefono },
    })
    setCargando(false)
    if (!ok) {
      if (respuesta.detalles) mostrarErroresDelServidor(respuesta.detalles)
      setErrorGeneral(respuesta.error)
      return
    }
    setListo(true)
    router.refresh() // el nombre también aparece en el menú
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <Campo id="nombre" label="Nombre y apellido" error={errores.nombre}>
        <input id="nombre" name="nombre" type="text" autoComplete="name" maxLength={80}
          value={datos.nombre} onChange={handleChange}
          aria-invalid={Boolean(errores.nombre)} aria-describedby="nombre-mensaje" />
      </Campo>

      <Campo id="telefono" label="Teléfono (opcional)" error={errores.telefono}
        ayuda="Para avisarte de algún cambio en tus turnos.">
        <input id="telefono" name="telefono" type="tel" autoComplete="tel" placeholder="11 2345-6789"
          value={datos.telefono} onChange={handleChange}
          aria-invalid={Boolean(errores.telefono)} aria-describedby="telefono-mensaje" />
      </Campo>

      <p className="texto-suave">Email: <strong>{perfil.email}</strong> (es el que vincula a tus mascotas, no se cambia desde acá)</p>

      {errorGeneral && <p className="form-error" role="alert">{errorGeneral}</p>}
      {listo && <p className="aviso-exito" role="status">Listo, tus datos quedaron guardados.</p>}

      <button type="submit" className="btn btn-primario" disabled={cargando}>
        {cargando ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </form>
  )
}

export default FormularioPerfil
