'use client'

// Client Component (veterinaria): registra una dosis de vacuna aplicada.
//
//   · Perro y gato: se elige del calendario (o "Otra" para escribir el nombre).
//   · Aves y otras especies: no hay calendario, se escribe el nombre.
//   · La próxima dosis se calcula sola según el calendario cuando se elige la vacuna
//     o se cambia la fecha; la veterinaria la puede corregir o borrar.
// El RLS solo deja insertar a la veterinaria.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Campo from './Campo'
import { useFormulario } from '@/hooks/useFormulario'
import { validarVacuna } from '@/lib/validaciones'
import { hoyISO } from '@/lib/horarios'
import { opcionesDeVacuna, buscarVacuna, calcularProximaDosis, lineaDeVacuna, OTRA } from '@/lib/vacunas'
import { crearClienteNavegador } from '@/lib/supabase/navegador'
import { mensajeDeError } from '@/lib/supabase/mensajes'

function FormularioVacuna({ mascota, volverA }) {
  const opciones = opcionesDeVacuna(mascota.especie)
  const tieneCalendario = opciones.length > 0
  const [hoy, setHoy] = useState('')
  const [errorGeneral, setErrorGeneral] = useState('')
  const [cargando, setCargando] = useState(false)
  const router = useRouter()

  const { datos, errores, handleChange, cambiar, validarAlEnviar } = useFormulario(
    { tipo: tieneCalendario ? '' : OTRA, nombre: '', fecha: '', proxima: '', notas: '' },
    (valores) => validarVacuna(valores, hoy),
  )

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    setHoy(hoyISO())
    cambiar({ fecha: hoyISO() })
    // Solo al abrir: propone hoy como fecha de aplicación
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Al elegir la vacuna o cambiar la fecha, se recalcula la próxima dosis sugerida
  function handleTipo(e) {
    const tipo = e.target.value
    cambiar({ tipo, proxima: calcularProximaDosis(mascota.especie, tipo, datos.fecha) ?? '' })
  }
  function handleFecha(e) {
    const fecha = e.target.value
    cambiar({ fecha, proxima: calcularProximaDosis(mascota.especie, datos.tipo, fecha) ?? datos.proxima })
  }

  const elegida = buscarVacuna(mascota.especie, datos.tipo)
  const escribeNombre = datos.tipo === OTRA

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorGeneral('')
    if (!validarAlEnviar()) return

    setCargando(true)
    try {
      const nombre = escribeNombre ? datos.nombre.trim() : elegida.nombre
      const { error } = await crearClienteNavegador().from('vacunas').insert({
        mascota_id: mascota.id,
        vacuna: nombre,
        tipo: escribeNombre ? null : datos.tipo,
        linea: lineaDeVacuna(mascota.especie, datos.tipo, nombre),
        fecha_aplicacion: datos.fecha,
        proxima_dosis: datos.proxima || null,
        notas: datos.notas.trim() || null,
      })
      if (error) {
        setErrorGeneral(mensajeDeError(error))
        return
      }
      router.push(volverA)
      router.refresh()
    } catch (error) {
      setErrorGeneral(mensajeDeError(error))
    } finally {
      setCargando(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {tieneCalendario ? (
        <Campo id="tipo" label={`Vacuna (calendario de ${mascota.especie === 'Perro' ? 'perros' : 'gatos'})`} error={errores.tipo}>
          <select id="tipo" name="tipo" value={datos.tipo} onChange={handleTipo}
            aria-invalid={Boolean(errores.tipo)} aria-describedby="tipo-mensaje">
            <option value="">Elegí la vacuna</option>
            {opciones.map((v) => <option key={v.id} value={v.id}>{v.nombre}</option>)}
            <option value={OTRA}>Otra (escribir el nombre)</option>
          </select>
        </Campo>
      ) : (
        <p className="texto-suave">
          Para {mascota.especie === 'Ave' ? 'aves' : 'esta especie'} no hay un calendario fijo en Argentina: escribí el nombre de la vacuna.
        </p>
      )}

      {escribeNombre && (
        <Campo id="nombre" label="Nombre de la vacuna" error={errores.nombre}>
          <input id="nombre" name="nombre" type="text" maxLength={80} placeholder="Ej: Leptospirosis"
            value={datos.nombre} onChange={handleChange}
            aria-invalid={Boolean(errores.nombre)} aria-describedby="nombre-mensaje" />
        </Campo>
      )}

      <div className="form-fila">
        <Campo id="fecha" label="Fecha de aplicación" error={errores.fecha}>
          <input id="fecha" name="fecha" type="date" max={hoy || undefined}
            value={datos.fecha} onChange={handleFecha}
            aria-invalid={Boolean(errores.fecha)} aria-describedby="fecha-mensaje" />
        </Campo>

        <Campo id="proxima" label="Próxima dosis (opcional)" error={errores.proxima}
          ayuda={elegida?.proximaEnDias ? 'Calculada según el calendario. Podés cambiarla.' : 'Dejala vacía si no se repite.'}>
          <input id="proxima" name="proxima" type="date" min={datos.fecha || undefined}
            value={datos.proxima} onChange={handleChange}
            aria-invalid={Boolean(errores.proxima)} aria-describedby="proxima-mensaje" />
        </Campo>
      </div>

      <Campo id="notas" label="Notas (opcional)" error={errores.notas} ayuda="Ej: lote, marca o alguna reacción. El dueño/a las ve.">
        <textarea id="notas" name="notas" rows="3" maxLength={500}
          value={datos.notas} onChange={handleChange}
          aria-invalid={Boolean(errores.notas)} aria-describedby="notas-mensaje" />
      </Campo>

      {errorGeneral && <p className="form-error" role="alert">{errorGeneral}</p>}

      <div className="form-exito-botones">
        <button type="submit" className="btn btn-primario" disabled={cargando}>
          {cargando ? 'Guardando…' : 'Registrar vacuna'}
        </button>
        <Link href={volverA} className="btn btn-secundario">Cancelar</Link>
      </div>
    </form>
  )
}

export default FormularioVacuna
