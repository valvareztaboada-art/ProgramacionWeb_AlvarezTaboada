'use client'

// Client Component: usa useState y eventos (onChange, onSubmit).
// Alta de paciente de maqueta: valida los datos pero todavía no los guarda.
// Cuando veamos Supabase, en handleSubmit se inserta la mascota en la tabla "mascotas".

import { useState } from 'react'
import Link from 'next/link'
import Campo from './Campo'
import { validarPaciente } from '@/lib/validaciones'

const VACIO = { nombre: '', especie: '', raza: '', edad: '', emailDuenio: '' }

function FormularioPaciente() {
  const [datos, setDatos] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const [enviado, setEnviado] = useState(false)

  function handleChange(e) {
    setDatos({ ...datos, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    const nuevosErrores = validarPaciente(datos)
    setErrores(nuevosErrores)

    if (Object.keys(nuevosErrores).length === 0) {
      // TODO (Supabase): insertar { ...datos } en la tabla "mascotas"
      setEnviado(true)
    }
  }

  function cargarOtro() {
    setDatos(VACIO)
    setErrores({})
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
          <input id="raza" name="raza" type="text"
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

      <button type="submit" className="btn btn-primario">Guardar paciente</button>
    </form>
  )
}

export default FormularioPaciente
