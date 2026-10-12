'use client'

// Client Component (veterinaria): carga o edita un estudio, con su archivo.
//
// Cómo se guarda:
//   1. Si eligió un archivo, se sube a Supabase Storage (bucket privado "estudios")
//      en la carpeta de la mascota: "<mascota_id>/<nombre único>.<ext>".
//   2. Se guarda (o actualiza) la fila en la tabla "estudios" con la ruta del archivo.
//   3. Si el paso 2 falla, se borra el archivo recién subido (no quedan archivos huérfanos).
//   4. Al editar y reemplazar el archivo, se borra el archivo anterior.
// El RLS de la base y de Storage solo deja hacer esto a la veterinaria.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Campo from './Campo'
import { useFormulario } from '@/hooks/useFormulario'
import { validarEstudio } from '@/lib/validaciones'
import { hoyISO } from '@/lib/horarios'
import { ACEPTA, rutaDeArchivo, formatearTamanio } from '@/lib/archivos'
import { crearClienteNavegador } from '@/lib/supabase/navegador'
import { mensajeDeError } from '@/lib/supabase/mensajes'

const MAXIMO_COMENTARIOS = 2000

function FormularioEstudio({ pacientes, estudio = null, mascotaInicial = '', volverA = '/veterinaria/estudios' }) {
  const esEdicion = Boolean(estudio)
  const [hoy, setHoy] = useState('')
  const [archivo, setArchivo] = useState(null) // el File elegido (o null)
  const [etapa, setEtapa] = useState('listo') // 'listo' | 'subiendo' | 'guardando'
  const [errorGeneral, setErrorGeneral] = useState('')
  const router = useRouter()

  const { datos, errores, handleChange, cambiar, validarAlEnviar } = useFormulario(
    {
      mascotaId: estudio ? String(estudio.mascotaId) : mascotaInicial,
      titulo: estudio?.titulo ?? '',
      fecha: estudio?.fecha ?? '',
      comentarios: estudio?.comentarios ?? '',
    },
    (valores) => validarEstudio({ ...valores, archivo: archivo && { tipo: archivo.type, tamanio: archivo.size } }, hoy),
  )

  // "Hoy" se calcula en el navegador (como en el formulario de turnos) y,
  // si es un estudio nuevo, se propone como fecha.
  useEffect(() => {
    const fechaDeHoy = hoyISO()
    // oxlint-disable-next-line react/set-state-in-effect
    setHoy(fechaDeHoy)
    if (!esEdicion) cambiar({ fecha: fechaDeHoy })
    // Solo al abrir el formulario: si dependiera de "cambiar", volvería a poner
    // la fecha de hoy cada vez que la veterinaria elige otra.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleArchivo(e) {
    setArchivo(e.target.files?.[0] ?? null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorGeneral('')
    if (!validarAlEnviar()) return

    const supabase = crearClienteNavegador()
    const storage = supabase.storage.from('estudios')
    let archivoNuevo = null

    try {
      // 1. Subir el archivo (si eligió uno)
      if (archivo) {
        setEtapa('subiendo')
        const ruta = rutaDeArchivo(datos.mascotaId, archivo.type, crypto.randomUUID())
        const { error } = await storage.upload(ruta, archivo, { contentType: archivo.type, upsert: false })
        if (error) {
          setErrorGeneral(mensajeDeError(error))
          return
        }
        archivoNuevo = {
          archivo_path: ruta,
          archivo_nombre: archivo.name,
          archivo_tipo: archivo.type,
          archivo_tamanio: archivo.size,
        }
      }

      // 2. Guardar los datos del estudio
      setEtapa('guardando')
      const fila = {
        titulo: datos.titulo.trim(),
        fecha: datos.fecha,
        comentarios: datos.comentarios.trim() || null,
        actualizado_en: new Date().toISOString(),
        ...archivoNuevo,
      }
      const { data, error } = esEdicion
        ? await supabase.from('estudios').update(fila).eq('id', estudio.id).select('id')
        : await supabase.from('estudios').insert({ ...fila, mascota_id: Number(datos.mascotaId) }).select('id')

      if (error || data.length === 0) {
        // 3. No quedó guardado: borramos el archivo que acabamos de subir
        if (archivoNuevo) await storage.remove([archivoNuevo.archivo_path])
        setErrorGeneral(mensajeDeError(error ?? { code: '42501' }))
        return
      }

      // 4. Si reemplazó el archivo, borramos el anterior
      if (esEdicion && archivoNuevo && estudio.archivo_path) {
        await storage.remove([estudio.archivo_path])
      }

      router.push(volverA)
      router.refresh()
    } catch (error) {
      if (archivoNuevo) await storage.remove([archivoNuevo.archivo_path]).catch(() => {})
      setErrorGeneral(mensajeDeError(error))
    } finally {
      setEtapa('listo')
    }
  }

  const paciente = pacientes.find((p) => String(p.id) === datos.mascotaId)

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <Campo id="mascotaId" label="Paciente" error={errores.mascotaId}
        ayuda={esEdicion ? 'El paciente de un estudio no se puede cambiar.' : paciente && `Dueño/a: ${paciente.duenio}`}>
        <select id="mascotaId" name="mascotaId" value={datos.mascotaId} onChange={handleChange} disabled={esEdicion}
          aria-invalid={Boolean(errores.mascotaId)} aria-describedby="mascotaId-mensaje">
          <option value="">Elegí un paciente</option>
          {pacientes.map((p) => (
            <option key={p.id} value={String(p.id)}>{p.nombre} ({p.especie}) — {p.duenio}</option>
          ))}
        </select>
      </Campo>

      <div className="form-fila">
        <Campo id="titulo" label="Título" error={errores.titulo}>
          <input id="titulo" name="titulo" type="text" maxLength={100} placeholder="Ej: Análisis de sangre"
            value={datos.titulo} onChange={handleChange}
            aria-invalid={Boolean(errores.titulo)} aria-describedby="titulo-mensaje" />
        </Campo>

        <Campo id="fecha" label="Fecha del estudio" error={errores.fecha}>
          <input id="fecha" name="fecha" type="date" max={hoy || undefined}
            value={datos.fecha} onChange={handleChange}
            aria-invalid={Boolean(errores.fecha)} aria-describedby="fecha-mensaje" />
        </Campo>
      </div>

      <Campo id="comentarios" label="Comentarios (opcional)" error={errores.comentarios}
        ayuda={`${datos.comentarios.length}/${MAXIMO_COMENTARIOS} caracteres · el dueño/a los ve en su cuenta`}>
        <textarea id="comentarios" name="comentarios" rows="5" maxLength={MAXIMO_COMENTARIOS}
          placeholder="Ej: Valores dentro de lo normal. Repetir el control en 6 meses."
          value={datos.comentarios} onChange={handleChange}
          aria-invalid={Boolean(errores.comentarios)} aria-describedby="comentarios-mensaje" />
      </Campo>

      {esEdicion && estudio.archivo_path && (
        <p className="archivo-actual">
          Archivo actual:{' '}
          {estudio.archivoUrl
            ? <a href={estudio.archivoUrl} target="_blank" rel="noopener noreferrer" className="enlace">{estudio.archivo_nombre}</a>
            : estudio.archivo_nombre}
          {estudio.archivo_tamanio && <span className="texto-suave"> · {formatearTamanio(estudio.archivo_tamanio)}</span>}
        </p>
      )}

      <Campo id="archivo"
        label={esEdicion && estudio.archivo_path ? 'Reemplazar archivo (opcional)' : 'Archivo (opcional)'}
        error={errores.archivo}
        ayuda={archivo ? `${archivo.name} · ${formatearTamanio(archivo.size)}` : 'PDF o imagen (JPG, PNG, WEBP), hasta 10 MB.'}>
        <input id="archivo" name="archivo" type="file" accept={ACEPTA} onChange={handleArchivo}
          aria-invalid={Boolean(errores.archivo)} aria-describedby="archivo-mensaje" />
      </Campo>

      {errorGeneral && <p className="form-error" role="alert">{errorGeneral}</p>}

      <div className="form-exito-botones">
        <button type="submit" className="btn btn-primario" disabled={etapa !== 'listo'}>
          {etapa === 'subiendo' && 'Subiendo archivo…'}
          {etapa === 'guardando' && 'Guardando…'}
          {etapa === 'listo' && (esEdicion ? 'Guardar cambios' : 'Guardar estudio')}
        </button>
        <Link href={volverA} className="btn btn-secundario">Cancelar</Link>
      </div>
    </form>
  )
}

export default FormularioEstudio
