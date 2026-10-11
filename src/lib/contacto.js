// Datos de contacto de la veterinaria: se usan en la portada y en el footer.
// Para cambiar la dirección o el mapa, alcanza con editar este archivo.
// (MICAN es un proyecto académico: la ubicación es ilustrativa, a nivel barrio.)

const UBICACION_EN_MAPA = 'Vélez Sarsfield, Ciudad Autónoma de Buenos Aires'

export const CONTACTO = {
  direccion: 'Vélez Sarsfield, Ciudad de Buenos Aires',
  telefono: '(011) 1234-5678',
  telefonoLink: 'tel:+541112345678',
  whatsapp: '+54 9 11 1234-5678',
  email: 'hola@mican.vet',
  // Mapa embebido de Google Maps (no necesita clave de API)
  mapaEmbebido: `https://maps.google.com/maps?q=${encodeURIComponent(UBICACION_EN_MAPA)}&z=15&output=embed`,
  // Enlace para abrir la ubicación en la app / sitio de Google Maps
  mapaEnlace: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(UBICACION_EN_MAPA)}`,
}

export const HORARIOS = [
  { dias: 'Lunes a viernes', horas: '9 a 18 h' },
  { dias: 'Sábados', horas: '9 a 13 h' },
  { dias: 'Domingos y feriados', horas: 'Cerrado' },
]
