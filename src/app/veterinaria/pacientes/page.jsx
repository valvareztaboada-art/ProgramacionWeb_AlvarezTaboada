import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import TablaPacientes from '@/components/TablaPacientes'
import { obtenerMascotas } from '@/lib/datos'

export const metadata = { title: 'Pacientes' }

// Server Component: busca los datos en el servidor y se los pasa por props
// a TablaPacientes (Client Component), que agrega el buscador interactivo.
// ?eliminado=Nombre llega después de eliminar un paciente (desde su página de edición)
export default async function Pacientes({ searchParams }) {
  const [pacientes, { eliminado }] = await Promise.all([obtenerMascotas(), searchParams])

  return (
    <>
      <PageHeader titulo="Pacientes" descripcion="Registro de todos los pacientes. Tocá un nombre para ver su ficha.">
        <Link href="/veterinaria/pacientes/nuevo" className="btn btn-primario">+ Nuevo paciente</Link>
      </PageHeader>
      {eliminado && <p className="aviso-exito" role="status">Se eliminó a {eliminado} y todo su historial.</p>}
      <TablaPacientes pacientes={pacientes} />
    </>
  )
}
