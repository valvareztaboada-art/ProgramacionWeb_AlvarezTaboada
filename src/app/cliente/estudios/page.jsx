import PageHeader from '@/components/PageHeader'
import TarjetaEstudio from '@/components/TarjetaEstudio'
import { obtenerEstudios } from '@/lib/datos'

export const metadata = { title: 'Estudios' }

export default async function MisEstudios() {
  // El RLS de la base (y el de Storage para los archivos) hace que solo vengan los de sus mascotas
  const estudios = await obtenerEstudios()

  return (
    <>
      <PageHeader titulo="Estudios" descripcion="Resultados y comentarios que cargó la veterinaria." />
      {estudios.length === 0
        ? <p className="texto-suave">Todavía no hay estudios de tus mascotas.</p>
        : (
          <ul className="lista">
            {estudios.map((e) => <TarjetaEstudio key={e.id} estudio={e} mostrarMascota />)}
          </ul>
        )}
    </>
  )
}
