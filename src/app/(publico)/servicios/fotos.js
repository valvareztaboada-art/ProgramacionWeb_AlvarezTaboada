// Foto de cada servicio del catálogo (las mismas fotos optimizadas de la portada)
import fotoConsulta from '../fotos/consulta.jpg'
import fotoVacuna from '../fotos/vacuna.jpg'
import fotoEcografia from '../fotos/ecografia.jpg'
import fotoPeluqueria from '../fotos/peluqueria.jpg'

export const FOTOS_DE_SERVICIOS = {
  consulta: { foto: fotoConsulta, posicion: '50% 20%', alt: 'Veterinario revisando a un salchicha' },
  vacunacion: { foto: fotoVacuna, posicion: '45% 40%', alt: 'Aplicación de una vacuna a un perro' },
  estudios: { foto: fotoEcografia, posicion: '50% 45%', alt: 'Veterinario haciendo una ecografía' },
  peluqueria: { foto: fotoPeluqueria, posicion: '50% 12%', alt: 'Perro blanco peludo después del baño' },
}
