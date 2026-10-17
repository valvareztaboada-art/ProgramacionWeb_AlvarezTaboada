// Calendario de vacunas (Argentina) y cuentas de fechas.
// Funciones puras: tienen tests en tests/vacunas.test.js.
//
// "proximaEnDias": cuántos días después de esta dosis toca la siguiente de la misma línea.
// Las edades del calendario se traducen a intervalos entre dosis:
//   Perro: polivalente a las 6, 8 y 12 semanas; rabia a las 16 semanas;
//          al año, refuerzo de polivalente y rabia, y después todos los años.
//   Gato:  triple felina a las 8 semanas y refuerzo a los 3 meses;
//          rabia a los 4 meses y después todos los años.

const UN_ANIO = 365

export const CALENDARIO = {
  Perro: [
    { id: 'polivalente_1', nombre: 'Polivalente (séxtuple) · 1ª dosis (6 semanas)', linea: 'polivalente', proximaEnDias: 14 },
    { id: 'polivalente_2', nombre: 'Polivalente · 2ª dosis (8 semanas)', linea: 'polivalente', proximaEnDias: 28 },
    { id: 'polivalente_3', nombre: 'Polivalente · refuerzo (12 semanas)', linea: 'polivalente', proximaEnDias: 280 }, // → al año de vida
    { id: 'rabia_perro_1', nombre: 'Antirrábica · 1ª dosis (16 semanas)', linea: 'rabia', proximaEnDias: 252 },     // → al año de vida
    { id: 'polivalente_anual', nombre: 'Polivalente · refuerzo anual', linea: 'polivalente', proximaEnDias: UN_ANIO },
    { id: 'rabia_anual', nombre: 'Antirrábica · refuerzo anual', linea: 'rabia', proximaEnDias: UN_ANIO },
  ],
  Gato: [
    { id: 'triple_felina_1', nombre: 'Triple felina · 1ª dosis (8 semanas)', linea: 'triple_felina', proximaEnDias: 28 },
    { id: 'triple_felina_2', nombre: 'Triple felina · refuerzo (3 meses)', linea: 'triple_felina', proximaEnDias: null },
    { id: 'rabia_gato_1', nombre: 'Antirrábica · 1ª dosis (4 meses)', linea: 'rabia', proximaEnDias: UN_ANIO },
    { id: 'rabia_anual', nombre: 'Antirrábica · refuerzo anual', linea: 'rabia', proximaEnDias: UN_ANIO },
  ],
}

export const OTRA = 'otra'
export const DIAS_DE_AVISO = 30 // desde cuántos días antes aparece en "a vencer" y en el aviso del menú

// Opciones para el formulario según la especie. Aves y "Otro" no tienen calendario.
export function opcionesDeVacuna(especie) {
  return CALENDARIO[especie] ?? []
}

export function buscarVacuna(especie, tipo) {
  return opcionesDeVacuna(especie).find((v) => v.id === tipo) ?? null
}

// "2026-10-17" + 365 → "2027-10-17"
export function sumarDias(fechaISO, dias) {
  const fecha = new Date(`${fechaISO}T00:00:00Z`)
  fecha.setUTCDate(fecha.getUTCDate() + dias)
  return fecha.toISOString().slice(0, 10)
}

// Días entre dos fechas ISO (negativo si "hasta" ya pasó)
export function diasEntre(desdeISO, hastaISO) {
  return Math.round((Date.parse(`${hastaISO}T00:00:00Z`) - Date.parse(`${desdeISO}T00:00:00Z`)) / 86400000)
}

// Próxima dosis sugerida según el calendario (null si esa vacuna no se repite o es "otra")
export function calcularProximaDosis(especie, tipo, fechaAplicacion) {
  const vacuna = buscarVacuna(especie, tipo)
  if (!vacuna || !vacuna.proximaEnDias || !fechaAplicacion) return null
  return sumarDias(fechaAplicacion, vacuna.proximaEnDias)
}

// Línea para agrupar dosis: la del calendario, o el nombre escrito (para "otra")
export function lineaDeVacuna(especie, tipo, nombre) {
  return buscarVacuna(especie, tipo)?.linea ?? nombre.trim().toLowerCase()
}

// Estado de una próxima dosis según los días que faltan
export function estadoDeProxima(dias) {
  if (dias < 0) return 'vencida'
  if (dias <= DIAS_DE_AVISO) return 'pronto'
  return 'al_dia'
}

// De todas las dosis, las PRÓXIMAS pendientes: la última dosis de cada línea de cada
// mascota, si tiene próxima fecha. Ordenadas de la más cercana a la más lejana.
// vacunas: [{ id, mascotaId, mascota, vacuna, linea, fecha_aplicacion, proxima_dosis }]
export function proximasVacunas(vacunas, hoyISO) {
  const ultimaPorLinea = new Map()
  for (const v of vacunas) {
    const clave = `${v.mascotaId}|${v.linea}`
    const actual = ultimaPorLinea.get(clave)
    if (!actual || v.fecha_aplicacion > actual.fecha_aplicacion || (v.fecha_aplicacion === actual.fecha_aplicacion && v.id > actual.id)) {
      ultimaPorLinea.set(clave, v)
    }
  }
  return [...ultimaPorLinea.values()]
    .filter((v) => v.proxima_dosis)
    .map((v) => {
      const dias = diasEntre(hoyISO, v.proxima_dosis)
      return { ...v, dias, estado: estadoDeProxima(dias) }
    })
    .sort((a, b) => a.dias - b.dias)
}

// ¿Hay algo que necesite atención? (para la alerta del menú)
export function hayVacunasParaAtender(vacunas, hoyISO) {
  return proximasVacunas(vacunas, hoyISO).some((v) => v.estado !== 'al_dia')
}

// Lista "Vacunas a vencer" de la veterinaria: las próximas que vencen en 30 días o menos
// (o ya vencieron) y a las que todavía no les marcó "ya le avisé al dueño/a".
// Si se registra una dosis nueva de esa vacuna, la vieja deja de ser "próxima" y sale sola.
export function vacunasAVencer(vacunas, hoyISO) {
  return proximasVacunas(vacunas, hoyISO).filter((v) => v.estado !== 'al_dia' && !v.avisado_en)
}

// Las mismas, pero ya avisadas (para poder desmarcar si hubo un error)
export function vacunasYaAvisadas(vacunas, hoyISO) {
  return proximasVacunas(vacunas, hoyISO).filter((v) => v.estado !== 'al_dia' && v.avisado_en)
}

// Mensaje sugerido para avisarle al dueño/a (para copiar o abrir en el email)
export function mensajeDeAviso({ nombreDuenio, mascota, vacuna, fechaTexto }) {
  const saludo = nombreDuenio && !nombreDuenio.includes('@') ? `¡Hola, ${nombreDuenio.split(' ')[0]}!` : '¡Hola!'
  return {
    asunto: `Se acerca la vacuna de ${mascota}`,
    texto: `${saludo} Te escribimos de Veterinaria MICAN: a ${mascota} le toca ${vacuna} el ${fechaTexto}. ` +
      'Podés pedir el turno desde tu cuenta en el sitio. ¡Te esperamos!',
  }
}
