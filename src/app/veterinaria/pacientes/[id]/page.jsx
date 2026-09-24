import { notFound } from 'next/navigation'
import FichaMascota from '@/components/FichaMascota'
import { obtenerMascota, obtenerTurnos, obtenerVacunas, obtenerEstudios } from '@/lib/datos'

// Ruta dinámica: cada paciente tiene su propia página. Ej: /veterinaria/pacientes/3
export async function generateMetadata({ params }) {
  const { id } = await params
  const mascota = await obtenerMascota(id)
  return { title: mascota?.nombre ?? 'Paciente' }
}

export default async function FichaPaciente({ params }) {
  const { id } = await params
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
      volver={{ href: '/veterinaria/pacientes', label: 'Pacientes' }}
    />
  )
}
