import { notFound } from 'next/navigation'
import FichaMascota from '@/components/FichaMascota'
import { obtenerMascota, obtenerTurnos, obtenerVacunas, obtenerEstudios } from '@/lib/datos'

// Ruta dinámica: [id] toma el valor de la URL. Ej: /cliente/mascotas/2 → id = "2"
export async function generateMetadata({ params }) {
  const { id } = await params
  const mascota = await obtenerMascota(id)
  return { title: mascota?.nombre ?? 'Mascota' }
}

export default async function FichaMiMascota({ params }) {
  const { id } = await params
  // Si la mascota no es de este usuario, el RLS no la devuelve → 404
  const mascota = await obtenerMascota(id)
  if (!mascota) notFound()

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
