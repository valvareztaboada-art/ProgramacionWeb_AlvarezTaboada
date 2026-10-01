'use client'

// Client Component: usa useState, useEffect y eventos.
// Los datos (mascotas del cliente, especialidades y horarios ocupados) los busca
// la página en el servidor y llegan por props.
// Al confirmar, inserta el turno en Supabase. La base de datos vuelve a controlar
// todo (que la mascota sea suya, el horario de atención, que no esté ocupado).

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Campo from './Campo'
import Icono from './Icono'
import { useFormulario } from '@/hooks/useFormulario'
import { validarTurno } from '@/lib/validaciones'
import { hoyISO, horariosDelDia } from '@/lib/horarios'
import { formatearFecha } from '@/lib/formato'
import { crearClienteNavegador } from '@/lib/supabase/navegador'
import { mensajeDeError, SESION_VENCIDA } from '@/lib/supabase/mensajes'

const MAXIMO_COMENTARIO = 300

function FormularioTurno({ mascotas, especialidades, ocupados }) {
  // Si tiene una sola mascota, ya viene elegida
  const vacio = {
    mascotaId: mascotas.length === 1 ? String(mascotas[0].id) : '',
    especialidad: '',
    fecha: '',
    hora: '',
    comentario: '',
  }

  const [hoy, setHoy] = useState('')
  // La función de validación necesita "hoy" para no aceptar días pasados
  const { datos, errores, handleChange, cambiar, validarAlEnviar, reiniciar } =
    useFormulario(vacio, (valores) => validarTurno(valores, hoy))
  const [errorGeneral, setErrorGeneral] = useState('')
  const [cargando, setCargando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const router = useRouter()

  // La fecha de hoy se calcula en el navegador (useEffect solo corre ahí).
  // Si la calculáramos durante el render, el servidor y el navegador podrían
  // obtener días distintos y React mostraría un error de "hydration".
  useEffect(() => {
    // Acá sí corresponde un efecto: sincroniza con algo externo a React (el reloj del navegador)
    // oxlint-disable-next-line react/set-state-in-effect
    setHoy(hoyISO())
  }, [])

  const horarios = datos.fecha ? horariosDelDia(datos.fecha, ocupados) : []
  const mascotaElegida = mascotas.find((m) => String(m.id) === datos.mascotaId)
  const especialidadElegida = especialidades.find((esp) => esp.id === datos.especialidad)

  // Si cambia el día, el horario elegido antes ya no sirve
  function handleCambioDeFecha(e) {
    cambiar({ fecha: e.target.value, hora: '' })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorGeneral('')
    if (!validarAlEnviar()) return

    setCargando(true)
    try {
      const supabase = crearClienteNavegador()

      // Si la sesión venció mientras completaba el formulario, avisamos en vez de fallar
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setErrorGeneral(SESION_VENCIDA)
        return
      }

      const { error } = await supabase.from('turnos').insert({
        mascota_id: Number(datos.mascotaId),
        especialidad_id: datos.especialidad,
        fecha: datos.fecha,
        hora: datos.hora,
        motivo: datos.comentario.trim() || null,
        creado_por: user.id,
      })

      if (error) {
        setErrorGeneral(mensajeDeError(error))
        if (error.code === '23505') {
          // Alguien tomó ese horario recién: lo desmarcamos y actualizamos los ocupados
          cambiar({ hora: '' })
          router.refresh()
        }
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

  function pedirOtro() {
    reiniciar()
    setErrorGeneral('')
    setEnviado(false)
  }

  if (enviado) {
    return (
      <div className="form-exito" role="status">
        <h2>¡Turno solicitado!</h2>
        <p>
          <strong>{mascotaElegida.nombre}</strong> · {especialidadElegida.nombre}
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
            <label key={esp.id} className={`opcion ${datos.especialidad === esp.id ? 'activo' : ''}`}>
              <input type="radio" name="especialidad" value={esp.id}
                checked={datos.especialidad === esp.id} onChange={handleChange} />
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
            value={datos.fecha} onChange={handleCambioDeFecha}
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
      <Campo id="comentario" label="¿Algo que tengamos que saber? (opcional)" error={errores.comentario}
        ayuda={`${datos.comentario.length}/${MAXIMO_COMENTARIO} caracteres`}>
        <textarea id="comentario" name="comentario" rows="3" maxLength={MAXIMO_COMENTARIO}
          placeholder="Ej: está comiendo poco desde hace unos días"
          value={datos.comentario} onChange={handleChange}
          aria-invalid={Boolean(errores.comentario)} aria-describedby="comentario-mensaje" />
      </Campo>

      {errorGeneral && <p className="form-error" role="alert">{errorGeneral}</p>}

      <button type="submit" className="btn btn-primario" disabled={cargando}>
        {cargando ? 'Pidiendo turno…' : 'Pedir turno'}
      </button>
    </form>
  )
}

export default FormularioTurno
