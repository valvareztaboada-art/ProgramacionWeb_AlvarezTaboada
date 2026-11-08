import Link from 'next/link'
import { notFound } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import FormularioVacunasAntiguas from '@/components/FormularioVacunasAntiguas'
import { obtenerMascota } from '@/lib/datos'
import { hoyISO } from '@/lib/horarios'

export const metadata = { title: 'Cargar vacunas anteriores' }

// /veterinaria/pacientes/:id/vacunas/anteriores → antecedentes (ej: vacunas de la infancia)
export default async function VacunasAnteriores({ params }) {
  const { id } = await params
  const mascota = await obtenerMascota(id)
  if (!mascota) notFound()

  const volverA = `/veterinaria/pacientes/${mascota.id}`

  return (
    <>
      <Link href={volverA} className="volver">← {mascota.nombre}</Link>
      <PageHeader titulo="Cargar vacunas anteriores"
        descripcion={`${mascota.nombre} · ${mascota.especie}. Para vacunas que ya tenía antes de venir (ej: las de la infancia).`} />
      <div className="card form-card">
        <p className="aviso-informativo">
          Quedan en el historial como <strong>antecedente</strong>: no calculan la próxima dosis ni aparecen
          en rojo como atrasadas. Si querés que te avisemos la próxima de alguna, cargá la última con{' '}
          <Link href={`${volverA}/vacunas/nueva`} className="enlace">Registrar vacuna</Link>.
        </p>
        <FormularioVacunasAntiguas mascota={{ id: mascota.id, nombre: mascota.nombre, especie: mascota.especie }}
          volverA={volverA} hoy={hoyISO()} />
      </div>
    </>
  )
}
