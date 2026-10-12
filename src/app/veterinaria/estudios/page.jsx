import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import TarjetaEstudio from '@/components/TarjetaEstudio'
import { obtenerEstudios } from '@/lib/datos'

export const metadata = { title: 'Estudios' }

export default async function Estudios() {
  const estudios = await obtenerEstudios()

  return (
    <>
      <PageHeader titulo="Estudios" descripcion="Los dueños/as ven los estudios y comentarios de sus mascotas en su cuenta.">
        <Link href="/veterinaria/estudios/nuevo" className="btn btn-primario">+ Subir estudio</Link>
      </PageHeader>

      {estudios.length === 0
        ? <p className="texto-suave">Todavía no hay estudios cargados.</p>
        : (
          <ul className="lista">
            {estudios.map((e) => (
              <TarjetaEstudio key={e.id} estudio={e} mostrarMascota esVeterinaria volver="/veterinaria/estudios" />
            ))}
          </ul>
        )}
    </>
  )
}
