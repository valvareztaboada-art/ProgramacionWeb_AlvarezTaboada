// Catálogo de servicios (funciones puras: tienen tests en tests/servicios.test.js).
// Los servicios que se pueden reservar son las "especialidades" de la base (id, nombre, descripción).
// Acá se agrega la información para mostrar en el catálogo: qué incluye, cuánto dura, para quién.

const DETALLES = {
  consulta: {
    resumen: 'Control general o cualquier cosa que te preocupe: revisamos, explicamos y te llevás un plan claro.',
    incluye: ['Revisión clínica completa', 'Peso y control de signos vitales', 'Indicaciones por escrito en tu cuenta'],
    duracion: '30 minutos',
    especies: ['Perros', 'Gatos', 'Aves', 'Conejos'],
    consejo: 'Si podés, traé la libreta sanitaria y anotá desde cuándo notás lo que te preocupa.',
  },
  vacunacion: {
    resumen: 'Vacunas del calendario según la especie, con la próxima dosis calculada y el aviso cuando se acerca.',
    incluye: ['Revisión antes de vacunar', 'Registro de la dosis en tu cuenta', 'Cuenta regresiva para la próxima dosis'],
    duracion: '20 minutos',
    especies: ['Perros', 'Gatos'],
    consejo: 'Vacunamos solo a mascotas sanas: si está decaída o con diarrea, mejor reprogramar.',
  },
  estudios: {
    resumen: 'Análisis de sangre, radiografías y ecografías. El resultado queda guardado en la ficha de tu mascota.',
    incluye: ['Toma de muestras o imágenes', 'Informe del profesional', 'Archivo para ver y descargar desde tu cuenta'],
    duracion: '30 a 60 minutos',
    especies: ['Perros', 'Gatos', 'Conejos'],
    consejo: 'Para análisis de sangre, en general hacen falta 8 horas de ayuno. Consultanos antes.',
  },
  peluqueria: {
    resumen: 'Baño y corte con paciencia y productos suaves, para que vuelva limpio y tranquilo.',
    incluye: ['Baño y secado', 'Corte según la raza o a pedido', 'Corte de uñas y limpieza de oídos'],
    duracion: '1 a 2 horas',
    especies: ['Perros', 'Gatos'],
    consejo: 'Contanos si le molesta algo en particular (secador, patas): lo tenemos en cuenta.',
  },
}

// Une lo que viene de la base con el detalle. Un servicio nuevo en la base (sin detalle) igual se muestra.
export function armarServicio(especialidad) {
  const detalle = DETALLES[especialidad.id] ?? {}
  return {
    id: especialidad.id,
    nombre: especialidad.nombre,
    icono: especialidad.icono,
    descripcion: especialidad.descripcion,
    resumen: detalle.resumen ?? especialidad.descripcion,
    incluye: detalle.incluye ?? [],
    duracion: detalle.duracion ?? null,
    especies: detalle.especies ?? [],
    consejo: detalle.consejo ?? null,
  }
}

// Filtro del catálogo por especie (?especie=Gatos). Sin filtro, todos.
export function filtrarServicios(servicios, especie) {
  if (!especie) return servicios
  return servicios.filter((s) => s.especies.includes(especie))
}

export const ESPECIES_DEL_CATALOGO = ['Perros', 'Gatos', 'Aves', 'Conejos']
