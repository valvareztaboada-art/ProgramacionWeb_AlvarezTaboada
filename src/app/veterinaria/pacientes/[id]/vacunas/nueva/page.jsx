import Link from 'next/link'
import { notFound } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import FormularioVacuna from '@/components/FormularioVacuna'
import { obtenerMascota } from '@/lib/datos'

export const metadata = { title: 'Registrar vacuna' }

// /veterinaria/pacientes/:id/vacunas/nueva → ruta anidada dentro de la ficha del paciente
export default async function NuevaVacuna({ params }) {
  const { id } = await params
  const mascota = await obtenerMascota(id)
  if (!mascota) notFound()

  const volverA = `/veterinaria/pacientes/${mascota.id}`

  return (
    <>
      <Link href={volverA} className="volver">← {mascota.nombre}</Link>
      <PageHeader titulo="Registrar vacuna" descripcion={`${mascota.nombre} · ${mascota.especie}`} />
      <div className="card form-card">
        <FormularioVacuna mascota={{ id: mascota.id, nombre: mascota.nombre, especie: mascota.especie }} volverA={volverA} />
      </div>
    </>
  )
}
