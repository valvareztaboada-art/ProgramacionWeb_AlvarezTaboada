import PageHeader from '@/components/PageHeader'
import TablaPacientes from '@/components/TablaPacientes'
import { obtenerMascotas } from '@/lib/datos'

export const metadata = { title: 'Pacientes' }

// Server Component: busca los datos en el servidor y se los pasa por props
// a TablaPacientes (Client Component), que agrega el buscador interactivo.
export default async function Pacientes() {
  const pacientes = await obtenerMascotas()

  return (
    <>
      <PageHeader titulo="Pacientes" descripcion="Registro de todos los pacientes. Tocá un nombre para ver su ficha.">
        <button className="btn btn-primario">+ Nuevo paciente</button>
      </PageHeader>
      <TablaPacientes pacientes={pacientes} />
    </>
  )
}
