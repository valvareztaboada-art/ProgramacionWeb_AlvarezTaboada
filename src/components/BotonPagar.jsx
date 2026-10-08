'use client'

// Client Component: le pide a NUESTRA API (con fetch) que cree la preferencia
// en Mercado Pago y después manda al usuario al Checkout Pro para pagar.
// El navegador nunca ve el Access Token: eso queda en el servidor.

import { useState } from 'react'

const SIN_CONEXION = 'No pudimos conectarnos. Revisá tu conexión a internet y probá de nuevo.'

function BotonPagar({ pagoId, monto }) {
  const [estado, setEstado] = useState('listo') // 'listo' | 'cargando' | 'redirigiendo'
  const [error, setError] = useState('')

  async function pagar() {
    setEstado('cargando')
    setError('')

    try {
      const respuesta = await fetch(`/api/pagos/${pagoId}/preferencia`, { method: 'POST' })
      const datos = await respuesta.json().catch(() => ({}))

      if (!respuesta.ok || !datos.url) {
        setError(datos.error ?? 'No pudimos iniciar el pago. Probá de nuevo.')
        setEstado('listo')
        return
      }

      setEstado('redirigiendo')
      window.location.assign(datos.url) // nos vamos a Mercado Pago
    } catch {
      setError(SIN_CONEXION)
      setEstado('listo')
    }
  }

  return (
    <div className="acciones">
      <button type="button" className="btn btn-primario" onClick={pagar} disabled={estado !== 'listo'}
        aria-label={`Pagar $${Number(monto).toLocaleString('es-AR')} con Mercado Pago`}>
        {estado === 'cargando' && 'Preparando…'}
        {estado === 'redirigiendo' && 'Yendo a Mercado Pago…'}
        {estado === 'listo' && 'Pagar con Mercado Pago'}
      </button>
      {error && <p className="campo-error" role="alert">{error}</p>}
    </div>
  )
}

export default BotonPagar
