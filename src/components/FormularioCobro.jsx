'use client'

// Client Component (veterinaria): crea un cobro pendiente para un paciente.
// Después el dueño/a lo ve en "Pagos" y lo paga con Mercado Pago.
// Solo funciona para la veterinaria: el RLS rechaza el INSERT de cualquier otro usuario.

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Campo from './Campo'
import { useFormulario } from '@/hooks/useFormulario'
import { validarCobro } from '@/lib/validaciones'
import { crearClienteNavegador } from '@/lib/supabase/navegador'
import { mensajeDeError } from '@/lib/supabase/mensajes'

const VACIO = { mascotaId: '', concepto: '', monto: '' }

function FormularioCobro({ pacientes }) {
  const { datos, errores, handleChange, validarAlEnviar, reiniciar } = useFormulario(VACIO, validarCobro)
  const [errorGeneral, setErrorGeneral] = useState('')
  const [cargando, setCargando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const router = useRouter()

  const paciente = pacientes.find((p) => String(p.id) === datos.mascotaId)

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorGeneral('')
    if (!validarAlEnviar()) return

    setCargando(true)
    try {
      const { error } = await crearClienteNavegador().from('pagos').insert({
        mascota_id: Number(datos.mascotaId),
        concepto: datos.concepto.trim(),
        monto: Number(datos.monto.replace(',', '.')),
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
        <h2>¡Cobro creado!</h2>
        <p>
          <strong>{paciente.duenio}</strong> ya lo ve en su cuenta y puede pagarlo con Mercado Pago:
          {' '}{datos.concepto} · ${Number(datos.monto.replace(',', '.')).toLocaleString('es-AR')}.
        </p>
        <div className="form-exito-botones">
          <button type="button" className="btn btn-primario" onClick={cargarOtro}>Crear otro cobro</button>
          <Link href="/veterinaria/cobros" className="btn btn-secundario">Ver cobros</Link>
        </div>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
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

      <Campo id="concepto" label="Concepto" error={errores.concepto}>
        <input id="concepto" name="concepto" type="text" maxLength={80} placeholder="Ej: Consulta de control"
          value={datos.concepto} onChange={handleChange}
          aria-invalid={Boolean(errores.concepto)} aria-describedby="concepto-mensaje" />
      </Campo>

      <Campo id="monto" label="Monto (en pesos)" error={errores.monto}>
        <input id="monto" name="monto" type="text" inputMode="decimal" placeholder="15000"
          value={datos.monto} onChange={handleChange}
          aria-invalid={Boolean(errores.monto)} aria-describedby="monto-mensaje" />
      </Campo>

      {errorGeneral && <p className="form-error" role="alert">{errorGeneral}</p>}

      <button type="submit" className="btn btn-primario" disabled={cargando}>
        {cargando ? 'Creando…' : 'Crear cobro'}
      </button>
    </form>
  )
}

export default FormularioCobro
