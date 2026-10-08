// Arma la PREFERENCIA DE PAGO que se le manda a Mercado Pago (Checkout Pro).
// Es una función pura: recibe los datos y devuelve el JSON, así se puede testear.

const PREFIJO_REFERENCIA = 'mican-pago-'

// El "puente" entre Mercado Pago y nuestra base: el id del pago en la tabla "pagos"
export function referenciaExterna(pagoId) {
  return `${PREFIJO_REFERENCIA}${pagoId}`
}

// "mican-pago-12" → 12  ·  cualquier otra cosa → null
export function pagoIdDesdeReferencia(referencia) {
  const coincidencia = /^mican-pago-(\d+)$/.exec(referencia ?? '')
  return coincidencia ? Number(coincidencia[1]) : null
}

// pago: { id, concepto, monto, mascota }  ·  origen: "https://mican-five.vercel.app"
export function armarPreferencia({ pago, origen }) {
  const volverA = `${origen}/cliente/pagos/resultado?pago=${pago.id}`

  return {
    items: [
      {
        id: `pago-${pago.id}`,
        title: pago.concepto,
        description: `Veterinaria MICAN · ${pago.mascota}`,
        quantity: 1,
        // El monto SIEMPRE sale de nuestra base de datos, nunca de lo que manda el navegador
        unit_price: Number(pago.monto),
        currency_id: 'ARS',
      },
    ],
    external_reference: referenciaExterna(pago.id),
    // A dónde vuelve el usuario. OJO: solo sirven para MOSTRAR un mensaje;
    // el estado del pago lo actualiza el webhook, nunca estas URLs.
    back_urls: {
      success: volverA,
      pending: volverA,
      failure: volverA,
    },
    // Mercado Pago solo acepta volver automáticamente a direcciones https (no a localhost)
    ...(origen.startsWith('https://') ? { auto_return: 'approved' } : {}),
    statement_descriptor: 'MICAN',
    metadata: { pago_id: pago.id },
  }
}
