'use client'

// Client Component: usa el hook useFormulario y eventos (onChange, onSubmit).
// Sirve para cargar un paciente nuevo o, si recibe "paciente", para corregir sus datos.
// Los manda con fetch a nuestra API REST (POST /api/v1/pacientes o PATCH /api/v1/pacientes/:id),
// que vuelve a validar en el servidor. Solo la veterinaria puede (403 para cualquier otro).

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Campo from './Campo'
import SelectorDuenio from './SelectorDuenio'
import { useFormulario } from '@/hooks/useFormulario'
import { validarPaciente } from '@/lib/validaciones'
import { llamarApi } from '@/lib/api/cliente'

const VACIO = { nombre: '', especie: '', raza: '', fechaNacimiento: '', emailDuenio: '' }

// Los datos de un paciente existente, con la forma que usa el formulario
function datosDe(paciente) {
  return {
    nombre: paciente.nombre,
    especie: paciente.especie,
    raza: paciente.raza ?? '',
    fechaNacimiento: paciente.fechaNacimiento ?? '',
    emailDuenio: paciente.emailDuenio,
  }
}

// duenios: los dueños/as que ya existen (con o sin cuenta), para sugerirlos
// paciente: si viene, el formulario edita a ese paciente en lugar de crear uno nuevo
// hoy: "AAAA-MM-DD", lo calcula el servidor (así el navegador y el servidor usan la misma fecha)
function FormularioPaciente({ duenios = [], paciente = null, hoy }) {
  const editando = Boolean(paciente)
  const { datos, errores, handleChange, cambiar, validarAlEnviar, reiniciar, mostrarErroresDelServidor } =
    useFormulario(editando ? datosDe(paciente) : VACIO, (d) => validarPaciente(d, hoy))
  // Paciente cargado antes de que existiera la fecha de nacimiento: tiene solo la edad (fija)
  const tieneSoloEdadVieja = editando && !paciente.fechaNacimiento && paciente.edad !== null && paciente.edad !== undefined
  // Al editar, si cambia el email la mascota pasa a otra cuenta: lo avisamos
  const cambioDeDuenio = editando && datos.emailDuenio.trim().toLowerCase() !== paciente.emailDuenio
  const duenioElegido = duenios.find((d) => d.email === datos.emailDuenio.trim().toLowerCase())
  const [errorGeneral, setErrorGeneral] = useState('')
  const [cargando, setCargando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorGeneral('')
    if (!validarAlEnviar()) return

    setCargando(true)
    // Nuevo → POST a la colección · Editar → PATCH al paciente (la API vuelve a validar todo)
    const { ok, datos: respuesta } = await llamarApi(
      editando ? `/api/v1/pacientes/${paciente.id}` : '/api/v1/pacientes',
      {
        metodo: editando ? 'PATCH' : 'POST',
        cuerpo: {
          nombre: datos.nombre,
          especie: datos.especie,
          raza: datos.raza,
          fechaNacimiento: datos.fechaNacimiento || null,
          emailDuenio: datos.emailDuenio,
        },
      },
    )
    setCargando(false)

    if (!ok) {
      // 400: la validación del servidor marca cada campo con su error
      if (respuesta.detalles) mostrarErroresDelServidor(respuesta.detalles)
      setErrorGeneral(respuesta.error)
      return
    }
    if (editando) {
      router.push(`/veterinaria/pacientes/${paciente.id}?editado=1`)
      router.refresh()
      return
    }
    setEnviado(true)
    router.refresh()
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
          {duenioElegido?.registrado
            ? <><strong>{duenioElegido.nombre ?? datos.emailDuenio}</strong> ya puede ver a {datos.nombre} en su cuenta.</>
            : <>Cuando <strong>{datos.emailDuenio}</strong> se registre en MICAN con ese email, va a ver a {datos.nombre} en su cuenta.</>}
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

          <Campo id="fechaNacimiento" label="Fecha de nacimiento (opcional)" error={errores.fechaNacimiento}
            ayuda={tieneSoloEdadVieja
              ? `Antes se cargó la edad (${paciente.edadTexto}). Cargá la fecha para que se actualice sola.`
              : 'Si no sabés el día exacto, poné uno aproximado. La edad se calcula sola.'}>
            <input id="fechaNacimiento" name="fechaNacimiento" type="date" min="1985-01-01" max={hoy}
              value={datos.fechaNacimiento} onChange={handleChange}
              aria-invalid={Boolean(errores.fechaNacimiento)} aria-describedby="fechaNacimiento-mensaje" />
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
          ayuda="Elegí un dueño/a de la lista o escribí el email de uno nuevo: cuando se registre con ese email, va a ver a su mascota.">
          <SelectorDuenio id="emailDuenio" duenios={duenios} valor={datos.emailDuenio}
            onCambiar={(email) => cambiar({ emailDuenio: email })} invalido={Boolean(errores.emailDuenio)} />
        </Campo>
        {cambioDeDuenio && (
          <p className="aviso-bloqueo" role="status">
            Ojo: {paciente.nombre} va a pasar a la cuenta de <strong>{datos.emailDuenio.trim().toLowerCase() || 'ese email'}</strong> y
            {' '}deja de verse en la de {paciente.emailDuenio}. Sus turnos, vacunas y estudios se mueven con la mascota.
          </p>
        )}
      </fieldset>

      {errorGeneral && <p className="form-error" role="alert">{errorGeneral}</p>}

      <div className="form-exito-botones">
        <button type="submit" className="btn btn-primario" disabled={cargando}>
          {cargando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Guardar paciente'}
        </button>
        {editando && <Link href={`/veterinaria/pacientes/${paciente.id}`} className="btn btn-secundario">Cancelar</Link>}
      </div>
    </form>
  )
}

export default FormularioPaciente
