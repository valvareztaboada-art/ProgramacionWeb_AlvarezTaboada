'use client'

// Client Component (veterinaria): crea un cobro con fetch a POST /api/v1/cobros.
// Después el dueño/a lo ve en "Pagos" y lo paga con Mercado Pago, o, si ya pagó
// en el mostrador, se tilda "Ya lo pagó en efectivo" y queda cobrado en el mismo paso.
//
// Se usa en dos lugares:
//   · /veterinaria/cobros/nuevo → se elige el paciente (cobros sueltos, ej: un alimento)
//   · la ventana que aparece al marcar un turno como atendido (prop "turno") → el paciente
//     y el concepto vienen del turno, y el monto se sugiere con el último cobrado.

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Campo from './Campo'
import { useFormulario } from '@/hooks/useFormulario'
import { validarCobro } from '@/lib/validaciones'
import { llamarApi } from '@/lib/api/cliente'
import { conceptoDelTurno, montoANumero } from '@/lib/cobros'

const pesos = (monto) => `$${Number(monto).toLocaleString('es-AR')}`

// pacientes: para elegir (página de cobros) · turno: { id, mascotaId, mascota, duenio, especialidad }
// montoSugerido: número o undefined · alCrear(cobro): avisa que se creó
// alTerminar: (solo con turno) se llama al tocar "Listo" en el mensaje de éxito
function FormularioCobro({ pacientes = [], turno = null, montoSugerido, alCrear, alTerminar }) {
  const vacio = turno
    ? { mascotaId: String(turno.mascotaId), concepto: conceptoDelTurno(turno), monto: montoSugerido ? String(montoSugerido) : '' }
    : { mascotaId: '', concepto: '', monto: '' }
  const { datos, errores, handleChange, validarAlEnviar, reiniciar, mostrarErroresDelServidor } =
    useFormulario(vacio, validarCobro)
  const [enEfectivo, setEnEfectivo] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')
  const [cargando, setCargando] = useState(false)
  const [creado, setCreado] = useState(null) // el cobro que devolvió la API
  const router = useRouter()

  const paciente = turno
    ? { nombre: turno.mascota, duenio: turno.duenio }
    : pacientes.find((p) => String(p.id) === datos.mascotaId)
  const prefijo = turno ? `cobro-${turno.id}-` : '' // ids únicos si hay varios formularios en la página

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorGeneral('')
    if (!validarAlEnviar()) return

    setCargando(true)
    const { ok, datos: respuesta } = await llamarApi('/api/v1/cobros', {
      metodo: 'POST',
      cuerpo: {
        mascotaId: Number(datos.mascotaId),
        concepto: datos.concepto,
        monto: montoANumero(datos.monto),
        turnoId: turno?.id ?? null,
        enEfectivo,
      },
    })
    setCargando(false)

    if (!ok) {
      if (respuesta.detalles) mostrarErroresDelServidor(respuesta.detalles)
      setErrorGeneral(respuesta.error)
      return
    }
    setCreado(respuesta.cobro)
    alCrear?.(respuesta.cobro)
    // Dentro de la ventana del turno, la página se actualiza recién al cerrarla
    // (si no, el turno cambia de lista y la ventana desaparecería a mitad de camino)
    if (!turno) router.refresh()
  }

  function cargarOtro() {
    reiniciar()
    setEnEfectivo(false)
    setErrorGeneral('')
    setCreado(null)
  }

  if (creado) {
    const pagado = creado.estado === 'pagado'
    return (
      <div className="form-exito" role="status">
        <h2>{pagado ? '¡Cobrado en efectivo!' : '¡Cobro creado!'}</h2>
        <p>
          {creado.concepto} · {pesos(creado.monto)}.{' '}
          {pagado
            ? 'Ya figura como pagado.'
            : <><strong>{paciente.duenio}</strong> ya lo ve en su cuenta y puede pagarlo con Mercado Pago.</>}
        </p>
        {enEfectivo && !pagado && (
          <p className="aviso-bloqueo">No se pudo marcar como pagado en efectivo. Hacelo desde Cobros.</p>
        )}
        <div className="form-exito-botones">
          {turno
            ? <button type="button" className="btn btn-primario" onClick={alTerminar}>Listo</button>
            : <>
                <button type="button" className="btn btn-primario" onClick={cargarOtro}>Crear otro cobro</button>
                <Link href="/veterinaria/cobros" className="btn btn-secundario">Ver cobros</Link>
              </>}
        </div>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {turno
        ? <p className="cobro-paciente">Paciente: <strong>{turno.mascota}</strong> · {turno.duenio}</p>
        : (
          <Campo id="mascotaId" label="Paciente" error={errores.mascotaId}
            ayuda={paciente && `Dueño/a: ${paciente.duenio}${paciente.registrado ? '' : ' (todavía sin cuenta)'}`}>
            <select id="mascotaId" name="mascotaId" value={datos.mascotaId} onChange={handleChange}
              aria-invalid={Boolean(errores.mascotaId)} aria-describedby="mascotaId-mensaje">
              <option value="">Elegí un paciente</option>
              {pacientes.map((p) => (
                <option key={p.id} value={String(p.id)}>{p.nombre} ({p.especie}) — {p.duenio}</option>
              ))}
            </select>
          </Campo>
        )}

      <Campo id={`${prefijo}concepto`} label="Concepto" error={errores.concepto}>
        <input id={`${prefijo}concepto`} name="concepto" type="text" maxLength={80} placeholder="Ej: Consulta de control"
          value={datos.concepto} onChange={handleChange}
          aria-invalid={Boolean(errores.concepto)} aria-describedby={`${prefijo}concepto-mensaje`} />
      </Campo>

      <Campo id={`${prefijo}monto`} label="Monto (en pesos)" error={errores.monto}
        ayuda={turno && montoSugerido ? `Sugerido: ${pesos(montoSugerido)}, lo último que se cobró por ${turno.especialidad.toLowerCase()}.` : undefined}>
        <input id={`${prefijo}monto`} name="monto" type="text" inputMode="decimal" placeholder="15000"
          value={datos.monto} onChange={handleChange}
          aria-invalid={Boolean(errores.monto)} aria-describedby={`${prefijo}monto-mensaje`} />
      </Campo>

      <label className="casilla-efectivo">
        <input type="checkbox" checked={enEfectivo} onChange={(e) => setEnEfectivo(e.target.checked)} />
        Ya lo pagó en efectivo
        <span className="texto-suave"> (queda como pagado; si no, el dueño/a lo paga desde su cuenta)</span>
      </label>

      {errorGeneral && <p className="form-error" role="alert">{errorGeneral}</p>}

      <button type="submit" className="btn btn-primario" disabled={cargando}>
        {cargando ? 'Guardando…' : enEfectivo ? 'Registrar pago en efectivo' : 'Crear cobro'}
      </button>
    </form>
  )
}

export default FormularioCobro
