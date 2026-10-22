// Logs estructurados (una línea JSON por evento), al estilo de Pino o Winston.
// En Vercel aparecen en Logs → Runtime Logs y se pueden filtrar por nivel o por evento.
// Una línea JSON es fácil de buscar y de mandar a otra herramienta (Log Drains).
//
// Nunca loguear contraseñas, tokens ni datos de tarjetas.

function escribir(nivel, evento, datos = {}) {
  const linea = JSON.stringify({ nivel, evento, ...datos, fecha: new Date().toISOString() })
  if (nivel === 'error') console.error(linea)
  else if (nivel === 'warn') console.warn(linea)
  else console.info(linea)
}

export const log = {
  info: (evento, datos) => escribir('info', evento, datos),
  warn: (evento, datos) => escribir('warn', evento, datos),
  error: (evento, datos) => escribir('error', evento, datos),
}
