import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import FormularioEstudio from '@/components/FormularioEstudio'
import { obtenerMascotas } from '@/lib/datos'

export const metadata = { title: 'Subir estudio' }

// /veterinaria/estudios/nuevo            → elige el paciente en el formulario
// /veterinaria/estudios/nuevo?mascota=3  → viene desde la ficha del paciente (ya elegido)
export default async function NuevoEstudio({ searchParams }) {
  const { mascota } = await searchParams
  const pacientes = await obtenerMascotas()
  const preseleccionada = pacientes.some((p) => String(p.id) === mascota) ? mascota : ''
  const volverA = preseleccionada ? `/veterinaria/pacientes/${preseleccionada}` : '/veterinaria/estudios'

  return (
    <>
      <Link href={volverA} className="volver">← Volver</Link>
      <PageHeader titulo="Subir estudio" descripcion="Cargá el resultado y sumá tus comentarios para el dueño/a." />
      <div className="card form-card">
        <FormularioEstudio pacientes={pacientes} mascotaInicial={preseleccionada} volverA={volverA} />
      </div>
    </>
  )
}
