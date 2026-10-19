import Link from 'next/link'
import { notFound } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import FormularioPaciente from '@/components/FormularioPaciente'
import BotonEliminarPaciente from '@/components/BotonEliminarPaciente'
import { obtenerMascota, obtenerDuenios, obtenerResumenParaEliminar } from '@/lib/datos'
import { puedeEliminarse, loQueSeBorra } from '@/lib/pacientes'

export async function generateMetadata({ params }) {
  const { id } = await params
  const mascota = await obtenerMascota(id)
  return { title: mascota ? `Editar a ${mascota.nombre}` : 'Editar paciente' }
}

// /veterinaria/pacientes/[id]/editar → corregir los datos o eliminar al paciente.
// Server Component: trae los datos y se los pasa a los dos Client Components.
export default async function EditarPaciente({ params }) {
  const { id } = await params
  const mascota = await obtenerMascota(id)
  if (!mascota) notFound()

  const [duenios, resumen] = await Promise.all([obtenerDuenios(), obtenerResumenParaEliminar(mascota.id)])

  return (
    <>
      <Link href={`/veterinaria/pacientes/${mascota.id}`} className="volver">← {mascota.nombre}</Link>
      <PageHeader titulo={`Editar a ${mascota.nombre}`} descripcion="Corregí lo que se haya cargado mal." />

      <div className="card form-card">
        <FormularioPaciente duenios={duenios} paciente={mascota} />
      </div>

      <section className="card form-card zona-peligro" aria-labelledby="titulo-eliminar">
        <h2 id="titulo-eliminar">Eliminar paciente</h2>
        <p className="texto-suave">
          Usalo solo si el paciente se cargó por error. Se borra con todo su historial.
        </p>
        <BotonEliminarPaciente
          mascota={{ id: mascota.id, nombre: mascota.nombre }}
          seBorra={loQueSeBorra(resumen)}
          archivos={resumen.archivos}
          bloqueo={puedeEliminarse(resumen.pagos)
            ? null
            : `No se puede eliminar: tiene pagos registrados, que se guardan como comprobante.`}
        />
      </section>
    </>
  )
}
