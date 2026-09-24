import { notFound } from 'next/navigation'
import FichaMascota from '@/components/FichaMascota'
import { CLIENTE_ACTUAL, obtenerMascota, obtenerTurnos, obtenerVacunas, obtenerEstudios } from '@/lib/datos'

// Ruta dinámica: [id] toma el valor de la URL. Ej: /cliente/mascotas/2 → id = "2"
export async function generateMetadata({ params }) {
  const { id } = await params
  const mascota = await obtenerMascota(id)
  const esSuya = mascota?.duenio === CLIENTE_ACTUAL
  return { title: esSuya ? mascota.nombre : 'Mascota' }
}

export default async function FichaMiMascota({ params }) {
  const { id } = await params
  const mascota = await obtenerMascota(id)

  // Si no existe, o no es de este cliente, mostramos la página 404
  if (!mascota || mascota.duenio !== CLIENTE_ACTUAL) notFound()

  const [turnos, vacunas, estudios] = await Promise.all([
    obtenerTurnos({ mascotaId: mascota.id }),
    obtenerVacunas({ mascotaId: mascota.id }),
    obtenerEstudios({ mascotaId: mascota.id }),
  ])

  return (
    <FichaMascota
      mascota={mascota}
      turnos={turnos}
      vacunas={vacunas}
      estudios={estudios}
      volver={{ href: '/cliente/mascotas', label: 'Mis mascotas' }}
    />
  )
}
