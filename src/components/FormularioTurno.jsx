'use client'

// Client Component: usa useState, useEffect y eventos.
// Los datos (mascotas del cliente, especialidades y horarios ocupados) los busca
// la página en el servidor y llegan por props.
// Pedido de turno de maqueta: valida pero todavía no guarda.
// Cuando veamos Supabase, en handleSubmit se inserta el turno en la tabla "turnos".

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Campo from './Campo'
import Icono from './Icono'
import { validarTurno } from '@/lib/validaciones'
import { hoyISO, horariosDelDia } from '@/lib/horarios'
import { formatearFecha } from '@/lib/formato'

function FormularioTurno({ mascotas, especialidades, ocupados }) {
  // Si tiene una sola mascota, ya viene elegida
  const vacio = {
    mascotaId: mascotas.length === 1 ? String(mascotas[0].id) : '',
    especialidad: '',
    fecha: '',
    hora: '',
    comentario: '',
  }

  const [datos, setDatos] = useState(vacio)
  const [errores, setErrores] = useState({})
  const [enviado, setEnviado] = useState(false)

  // La fecha de hoy se calcula en el navegador (useEffect solo corre ahí).
  // Si la calculáramos durante el render, el servidor y el navegador podrían
  // obtener días distintos y React mostraría un error de "hydration".
  const [hoy, setHoy] = useState('')
  useEffect(() => {
    setHoy(hoyISO())
  }, [])

  const horarios = datos.fecha ? horariosDelDia(datos.fecha, ocupados) : []
  const mascotaElegida = mascotas.find((m) => String(m.id) === datos.mascotaId)

  function handleChange(e) {
    const { name, value } = e.target
    // Si cambia el día, el horario elegido antes ya no sirve
    if (name === 'fecha') {
      setDatos({ ...datos, fecha: value, hora: '' })
    } else {
      setDatos({ ...datos, [name]: value })
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    const nuevosErrores = validarTurno(datos, hoy)
    setErrores(nuevosErrores)

    if (Object.keys(nuevosErrores).length === 0) {
      // TODO (Supabase): insertar el turno con estado "Pendiente"
      setEnviado(true)
    }
  }

  function pedirOtro() {
    setDatos(vacio)
    setErrores({})
    setEnviado(false)
  }

  if (enviado) {
    return (
      <div className="form-exito" role="status">
        <h2>¡Turno solicitado!</h2>
        <p>
          <strong>{mascotaElegida.nombre}</strong> · {datos.especialidad}
          <br />
          {formatearFecha(datos.fecha)} a las {datos.hora} h
        </p>
        <p className="texto-suave">
          Queda <strong>pendiente</strong> hasta que la veterinaria lo confirme.
        </p>
        <div className="form-exito-botones">
          <Link href="/cliente/turnos" className="btn btn-primario">Ver mis turnos</Link>
          <button type="button" className="btn btn-secundario" onClick={pedirOtro}>Pedir otro turno</button>
        </div>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {/* 1. Mascota */}
      <fieldset className="form-grupo">
        <legend>1. ¿Para quién es?</legend>
        <div className="opciones" role="radiogroup">
          {mascotas.map((m) => (
            <label key={m.id} className={`opcion ${datos.mascotaId === String(m.id) ? 'activo' : ''}`}>
              <input type="radio" name="mascotaId" value={String(m.id)}
                checked={datos.mascotaId === String(m.id)} onChange={handleChange} />
              <strong>{m.nombre}</strong>
              <span className="texto-suave">{m.especie}</span>
            </label>
          ))}
        </div>
        {errores.mascotaId && <p className="campo-error">{errores.mascotaId}</p>}
      </fieldset>

      {/* 2. Especialidad */}
      <fieldset className="form-grupo">
        <legend>2. ¿Qué necesita?</legend>
        <div className="opciones">
          {especialidades.map((esp) => (
            <label key={esp.id} className={`opcion ${datos.especialidad === esp.nombre ? 'activo' : ''}`}>
              <input type="radio" name="especialidad" value={esp.nombre}
                checked={datos.especialidad === esp.nombre} onChange={handleChange} />
              <Icono nombre={esp.icono} size={26} />
              <strong>{esp.nombre}</strong>
              <span className="texto-suave">{esp.descripcion}</span>
            </label>
          ))}
        </div>
        {errores.especialidad && <p className="campo-error">{errores.especialidad}</p>}
      </fieldset>

      {/* 3. Día y horario */}
      <fieldset className="form-grupo">
        <legend>3. ¿Cuándo?</legend>

        <Campo id="fecha" label="Día" error={errores.fecha}
          ayuda="Atendemos de lunes a viernes de 9 a 18 h y sábados de 9 a 13 h.">
          <input id="fecha" name="fecha" type="date" min={hoy}
            value={datos.fecha} onChange={handleChange}
            aria-invalid={Boolean(errores.fecha)} aria-describedby="fecha-mensaje" />
        </Campo>

        {datos.fecha && (
          <div className="horarios">
            <p className="horarios-titulo">Horario</p>
            {horarios.length === 0 ? (
              <p className="texto-suave">Ese día no atendemos. Elegí otro día.</p>
            ) : (
              <div className="opciones-horario" role="radiogroup" aria-label="Horario">
                {horarios.map((h) => (
                  <label key={h.hora}
                    className={`horario ${datos.hora === h.hora ? 'activo' : ''} ${h.ocupado ? 'ocupado' : ''}`}>
                    <input type="radio" name="hora" value={h.hora} disabled={h.ocupado}
                      checked={datos.hora === h.hora} onChange={handleChange} />
                    {h.hora}
                  </label>
                ))}
              </div>
            )}
            {errores.hora && <p className="campo-error">{errores.hora}</p>}
          </div>
        )}
      </fieldset>

      {/* 4. Comentario */}
      <Campo id="comentario" label="¿Algo que tengamos que saber? (opcional)">
        <textarea id="comentario" name="comentario" rows="3"
          placeholder="Ej: está comiendo poco desde hace unos días"
          value={datos.comentario} onChange={handleChange} />
      </Campo>

      <button type="submit" className="btn btn-primario">Pedir turno</button>
    </form>
  )
}

export default FormularioTurno
