// A dónde ir después de ingresar.
// Si alguien sin sesión abre una página privada (ej: /cliente/turnos/nuevo), el proxy lo
// manda a /login?siguiente=/cliente/turnos/nuevo y, al ingresar, vuelve a esa página.
//
// Seguridad: "siguiente" viene en la URL, así que cualquiera lo puede cambiar.
// Solo aceptamos rutas internas del panel que le corresponde a su rol; cualquier otra cosa
// (otro sitio, "//otro.com", "javascript:", etc.) se ignora. Así el login no se puede
// usar para redirigir a una página falsa (open redirect).

const INICIO_POR_ROL = { cliente: '/cliente', veterinaria: '/veterinaria' }

export function inicioDelRol(rol) {
  return INICIO_POR_ROL[rol] ?? INICIO_POR_ROL.cliente
}

// La veterinaria que entra a una pantalla de cliente (ej: "Turnos" o "Sacar turno" en la portada)
// va directo a SU pantalla equivalente, sin carteles.
const EQUIVALENTES = [
  [/^\/cliente\/turnos\/nuevo$/, '/veterinaria/agenda/nuevo'],
  [/^\/cliente\/turnos(\/|$)/, '/veterinaria/agenda'],
  [/^\/cliente\/vacunas(\/|$)/, '/veterinaria/vacunas'],
  [/^\/cliente\/estudios(\/|$)/, '/veterinaria/estudios'],
  [/^\/cliente\/pagos(\/|$)/, '/veterinaria/cobros'],
  [/^\/cliente\/perfil(\/|$)/, '/veterinaria/perfil'],
  [/^\/cliente\/mascotas(\/|$)/, '/veterinaria/pacientes'],
]

export function pantallaDeVeterinaria(ruta = '') {
  const [camino] = String(ruta).split('?')
  // La ficha de una mascota es la ficha del mismo paciente
  const ficha = camino.match(/^\/cliente\/mascotas\/(\d+)$/)
  if (ficha) return `/veterinaria/pacientes/${ficha[1]}`
  const equivalente = EQUIVALENTES.find(([patron]) => patron.test(camino))
  return equivalente ? equivalente[1] : '/veterinaria'
}

// Único parámetro que se conserva: el servicio elegido en el catálogo (/servicios/[id] → "Sacar turno")
const PARAMETRO_PERMITIDO = /^especialidad=[a-z_]+$/

export function destinoDespuesDelLogin(siguiente, rol) {
  const inicio = inicioDelRol(rol)
  if (typeof siguiente !== 'string') return inicio

  const [ruta, consulta, ...resto] = siguiente.split('?')
  // Solo letras, números, guiones y barras: sin "//", sin ":", sin "\", sin "#"
  const esRutaSimple = /^\/[a-z0-9\-/]*$/i.test(ruta) && !ruta.includes('//') && resto.length === 0
  if (!esRutaSimple) return inicio
  // Veterinaria que venía de una pantalla de cliente: va a la suya
  if (rol === 'veterinaria' && (ruta === '/cliente' || ruta.startsWith('/cliente/'))) return pantallaDeVeterinaria(ruta)
  const esDeSuPanel = ruta === inicio || ruta.startsWith(`${inicio}/`)
  if (!esDeSuPanel) return inicio

  // Cualquier otro parámetro se descarta (se vuelve a la página, sin él)
  return consulta !== undefined && PARAMETRO_PERMITIDO.test(consulta) ? `${ruta}?${consulta}` : ruta
}
