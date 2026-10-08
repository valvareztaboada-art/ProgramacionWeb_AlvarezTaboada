'use client'

// Client Component: mientras el webhook todavía no confirmó el pago, vuelve a pedir
// los datos al servidor cada 3 segundos (hasta 10 veces). Cuando el webhook actualiza
// la base, la página se actualiza sola y muestra "¡Pago acreditado!".

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const INTERVALO = 3000
const MAXIMO_INTENTOS = 10

function EsperandoConfirmacion() {
  const router = useRouter()
  const [intentos, setIntentos] = useState(0)

  useEffect(() => {
    if (intentos >= MAXIMO_INTENTOS) return
    const temporizador = setTimeout(() => {
      router.refresh()
      setIntentos((n) => n + 1)
    }, INTERVALO)
    return () => clearTimeout(temporizador)
  }, [intentos, router])

  if (intentos >= MAXIMO_INTENTOS) {
    return (
      <p className="texto-suave">
        Mercado Pago está tardando en avisarnos. No hace falta que pagues de nuevo:
        cuando se acredite lo vas a ver en <strong>Pagos</strong>.
      </p>
    )
  }

  return (
    <p className="texto-suave esperando" role="status">
      <span className="puntito" aria-hidden="true" /> Esperando la confirmación de Mercado Pago…
    </p>
  )
}

export default EsperandoConfirmacion
