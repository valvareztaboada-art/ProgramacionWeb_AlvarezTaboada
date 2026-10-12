import Link from 'next/link'
import { notFound } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import FormularioEstudio from '@/components/FormularioEstudio'
import { obtenerEstudio, obtenerMascotas } from '@/lib/datos'

export const metadata = { title: 'Editar estudio' }

// Solo se vuelve a páginas internas de la veterinaria (evita redirecciones a otros sitios)
function destinoSeguro(volver) {
  return typeof volver === 'string' && /^\/veterinaria\/[\w/-]*$/.test(volver) ? volver : '/veterinaria/estudios'
}

export default async function EditarEstudio({ params, searchParams }) {
  const { id } = await params
  const { volver } = await searchParams
  const [estudio, pacientes] = await Promise.all([obtenerEstudio(id), obtenerMascotas()])
  if (!estudio) notFound()

  const volverA = destinoSeguro(volver)

  return (
    <>
      <Link href={volverA} className="volver">← Volver</Link>
      <PageHeader titulo="Editar estudio" descripcion={`${estudio.mascota} · ${estudio.titulo}`} />
      <div className="card form-card">
        <FormularioEstudio pacientes={pacientes} estudio={estudio} volverA={volverA} />
      </div>
    </>
  )
}
