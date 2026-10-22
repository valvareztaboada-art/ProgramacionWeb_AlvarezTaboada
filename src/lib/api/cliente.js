// Para llamar a NUESTRA API desde el navegador (Client Components) con fetch.
// Devuelve siempre { ok, status, datos } y nunca lanza: si no hay conexión,
// responde con status 0 y un mensaje para mostrar.

const SIN_CONEXION = 'No pudimos conectarnos. Revisá tu conexión a internet y probá de nuevo.'

export async function llamarApi(url, { metodo = 'GET', cuerpo } = {}) {
  try {
    const respuesta = await fetch(url, {
      method: metodo,
      headers: cuerpo ? { 'Content-Type': 'application/json' } : undefined,
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    })
    const datos = await respuesta.json().catch(() => ({}))
    if (!respuesta.ok && !datos.error) datos.error = 'Ocurrió un error inesperado. Probá de nuevo en unos minutos.'
    return { ok: respuesta.ok, status: respuesta.status, datos }
  } catch {
    return { ok: false, status: 0, datos: { error: SIN_CONEXION } }
  }
}
