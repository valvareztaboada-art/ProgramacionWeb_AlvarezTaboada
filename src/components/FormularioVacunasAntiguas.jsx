'use client'

// Client Component (veterinaria): carga las vacunas ANTERIORES de un paciente (antecedentes),
// ej: las de la infancia de un perro que llega por primera vez.
//   · Se cargan varias de una vez: cada fila es una vacuna con su fecha.
//   · Quedan en el historial marcadas como "Antecedente", SIN próxima dosis: no generan avisos
//     ni aparecen en rojo como atrasadas (la base no deja que una antigua tenga próxima dosis).
// Para que el sistema avise la próxima dosis, la última se registra con "Registrar vacuna".
// El RLS solo deja insertar a la veterinaria.

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Campo from './Campo'
import { validarVacunasAntiguas } from '@/lib/validaciones'
import { opcionesDeVacuna, buscarVacuna, lineaDeVacuna, OTRA } from '@/lib/vacunas'
import { crearClienteNavegador } from '@/lib/supabase/navegador'
import { mensajeDeError } from '@/lib/supabase/mensajes'

let siguienteClave = 1
const filaVacia = (tipo) => ({ clave: siguienteClave++, tipo, nombre: '', fecha: '', notas: '' })

// hoy: "AAAA-MM-DD", lo calcula el servidor
function FormularioVacunasAntiguas({ mascota, volverA, hoy }) {
  const opciones = opcionesDeVacuna(mascota.especie)
  const tieneCalendario = opciones.length > 0
  const tipoInicial = tieneCalendario ? '' : OTRA
  const [filas, setFilas] = useState(() => [filaVacia(tipoInicial)])
  const [intentoEnviar, setIntentoEnviar] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')
  const [cargando, setCargando] = useState(false)
  const formulario = useRef(null)
  const router = useRouter()

  // Igual que en los demás formularios: los errores aparecen después del primer "Guardar"
  // y se recalculan mientras se corrige
  const validacion = validarVacunasAntiguas(filas, hoy)
  const errores = intentoEnviar ? validacion : { filas: [] }

  function cambiar(clave, campo, valor) {
    setFilas((anteriores) => anteriores.map((f) => (f.clave === clave ? { ...f, [campo]: valor } : f)))
  }

  function agregar() {
    setFilas((anteriores) => [...anteriores, filaVacia(tipoInicial)])
  }

  function quitar(clave) {
    setFilas((anteriores) => anteriores.filter((f) => f.clave !== clave))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorGeneral('')
    setIntentoEnviar(true)
    if (validacion.hayErrores) {
      // Foco en el primer campo con problemas (se calcula: los errores todavía no están dibujados)
      const i = validacion.filas.findIndex((e) => Object.keys(e).length > 0)
      if (i >= 0) {
        const campo = ['tipo', 'nombre', 'fecha', 'notas'].find((c) => validacion.filas[i][c])
        formulario.current?.querySelector(`#antigua-${filas[i].clave}-${campo}`)?.focus()
      }
      return
    }

    setCargando(true)
    try {
      const { error } = await crearClienteNavegador().from('vacunas').insert(filas.map((f) => {
        const escribeNombre = f.tipo === OTRA
        const nombre = escribeNombre ? f.nombre.trim() : buscarVacuna(mascota.especie, f.tipo).nombre
        return {
          mascota_id: mascota.id,
          vacuna: nombre,
          tipo: escribeNombre ? null : f.tipo,
          linea: lineaDeVacuna(mascota.especie, f.tipo, nombre),
          fecha_aplicacion: f.fecha,
          proxima_dosis: null, // antecedente: no genera avisos
          antigua: true,
          notas: f.notas.trim() || null,
        }
      }))
      if (error) {
        setErrorGeneral(mensajeDeError(error))
        return
      }
      router.push(`${volverA}?antiguas=${filas.length}`)
      router.refresh()
    } catch (error) {
      setErrorGeneral(mensajeDeError(error))
    } finally {
      setCargando(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate ref={formulario}>
      <ol className="filas-vacunas">
        {filas.map((f, i) => {
          const err = errores.filas[i] ?? {}
          const id = (campo) => `antigua-${f.clave}-${campo}`
          return (
            <li key={f.clave} className="fila-vacuna">
              <fieldset>
                <legend>Vacuna {i + 1}</legend>
                <div className="form-fila">
                  {tieneCalendario ? (
                    <Campo id={id('tipo')} label="Vacuna" error={err.tipo}>
                      <select id={id('tipo')} value={f.tipo} onChange={(e) => cambiar(f.clave, 'tipo', e.target.value)}
                        aria-invalid={Boolean(err.tipo)} aria-describedby={`${id('tipo')}-mensaje`}>
                        <option value="">Elegí la vacuna</option>
                        {opciones.map((v) => <option key={v.id} value={v.id}>{v.nombre}</option>)}
                        <option value={OTRA}>Otra (escribir el nombre)</option>
                      </select>
                    </Campo>
                  ) : null}
                  {f.tipo === OTRA && (
                    <Campo id={id('nombre')} label="Nombre de la vacuna" error={err.nombre}>
                      <input id={id('nombre')} type="text" maxLength={80} placeholder="Ej: Leptospirosis"
                        value={f.nombre} onChange={(e) => cambiar(f.clave, 'nombre', e.target.value)}
                        aria-invalid={Boolean(err.nombre)} aria-describedby={`${id('nombre')}-mensaje`} />
                    </Campo>
                  )}
                  <Campo id={id('fecha')} label="Fecha en que se aplicó" error={err.fecha}>
                    <input id={id('fecha')} type="date" max={hoy}
                      value={f.fecha} onChange={(e) => cambiar(f.clave, 'fecha', e.target.value)}
                      aria-invalid={Boolean(err.fecha)} aria-describedby={`${id('fecha')}-mensaje`} />
                  </Campo>
                </div>
                <Campo id={id('notas')} label="Notas (opcional)" error={err.notas}>
                  <input id={id('notas')} type="text" maxLength={500} placeholder="Ej: según libreta sanitaria, otra veterinaria"
                    value={f.notas} onChange={(e) => cambiar(f.clave, 'notas', e.target.value)}
                    aria-invalid={Boolean(err.notas)} aria-describedby={`${id('notas')}-mensaje`} />
                </Campo>
                {filas.length > 1 && (
                  <button type="button" className="boton-enlace" onClick={() => quitar(f.clave)}>
                    Quitar la vacuna {i + 1}
                  </button>
                )}
              </fieldset>
            </li>
          )
        })}
      </ol>

      <button type="button" className="btn btn-secundario btn-agregar-fila" onClick={agregar}>+ Agregar otra vacuna</button>

      {errores.general && <p className="form-error" role="alert">{errores.general}</p>}
      {errorGeneral && <p className="form-error" role="alert">{errorGeneral}</p>}

      <div className="form-exito-botones">
        <button type="submit" className="btn btn-primario" disabled={cargando}>
          {cargando ? 'Guardando…' : filas.length === 1 ? 'Guardar 1 vacuna anterior' : `Guardar ${filas.length} vacunas anteriores`}
        </button>
        <Link href={volverA} className="btn btn-secundario">Cancelar</Link>
      </div>
    </form>
  )
}

export default FormularioVacunasAntiguas
