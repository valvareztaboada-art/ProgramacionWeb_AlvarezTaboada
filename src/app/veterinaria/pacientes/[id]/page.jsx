import { notFound } from 'next/navigation'
import FichaMascota from '@/components/FichaMascota'
import { obtenerMascota, obtenerTurnos, obtenerVacunas, obtenerEstudios, obtenerMontosSugeridos } from '@/lib/datos'

// Ruta dinámica: cada paciente tiene su propia página. Ej: /veterinaria/pacientes/3
export async function generateMetadata({ params }) {
  const { id } = await params
  const mascota = await obtenerMascota(id)
  return { title: mascota?.nombre ?? 'Paciente' }
}

// ?editado=1 llega después de guardar cambios en /editar · ?antiguas=3 después de cargar vacunas anteriores
export default async function FichaPaciente({ params, searchParams }) {
  const [{ id }, { editado, antiguas }] = await Promise.all([params, searchParams])
  const mascota = await obtenerMascota(id)

  if (!mascota) notFound()

  const [turnos, vacunas, estudios, montos] = await Promise.all([
    obtenerTurnos({ mascotaId: mascota.id }),
    obtenerVacunas({ mascotaId: mascota.id }),
    obtenerEstudios({ mascotaId: mascota.id }),
    obtenerMontosSugeridos(),
  ])

  return (
    <FichaMascota
      mascota={mascota}
      turnos={turnos}
      vacunas={vacunas}
      estudios={estudios}
      volver={{ href: '/veterinaria/pacientes', label: 'Pacientes' }}
      esVeterinaria
      montos={montos}
      aviso={editado ? 'Listo, los datos quedaron guardados.'
        : /^\d+$/.test(antiguas ?? '') ? `Listo, se cargaron ${antiguas === '1' ? '1 vacuna anterior' : `${Number(antiguas)} vacunas anteriores`} al historial.`
        : null}
    />
  )
}
