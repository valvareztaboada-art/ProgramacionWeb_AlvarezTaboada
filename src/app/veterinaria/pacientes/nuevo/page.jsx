import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import FormularioPaciente from '@/components/FormularioPaciente'

export const metadata = { title: 'Nuevo paciente' }

// /veterinaria/pacientes/nuevo
// Next.js prioriza esta carpeta fija ("nuevo") antes que la ruta dinámica [id]
export default function NuevoPaciente() {
  return (
    <>
      <Link href="/veterinaria/pacientes" className="volver">← Pacientes</Link>
      <PageHeader
        titulo="Nuevo paciente"
        descripcion="Cargá la mascota y el email de su dueño/a. No hace falta que ya tenga cuenta."
      />
      <div className="card form-card">
        <FormularioPaciente />
      </div>
    </>
  )
}
