import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import FormularioPaciente from '@/components/FormularioPaciente'
import { obtenerDuenios } from '@/lib/datos'

export const metadata = { title: 'Nuevo paciente' }

// /veterinaria/pacientes/nuevo
// Next.js prioriza esta carpeta fija ("nuevo") antes que la ruta dinámica [id]
// Server Component: trae los dueños/as conocidos para que el formulario los sugiera.
export default async function NuevoPaciente() {
  const duenios = await obtenerDuenios()

  return (
    <>
      <Link href="/veterinaria/pacientes" className="volver">← Pacientes</Link>
      <PageHeader
        titulo="Nuevo paciente"
        descripcion="Cargá la mascota y elegí a su dueño/a. Si es nuevo/a, no hace falta que ya tenga cuenta."
      />
      <div className="card form-card">
        <FormularioPaciente duenios={duenios} />
      </div>
    </>
  )
}
