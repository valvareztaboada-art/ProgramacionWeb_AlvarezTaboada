import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import { obtenerEstudios } from '@/lib/datos'

export const metadata = { title: 'Estudios' }

export default async function Estudios() {
  const estudios = await obtenerEstudios()

  return (
    <>
      <PageHeader titulo="Estudios" descripcion="Estudios organizados por paciente.">
        <button className="btn btn-primario">+ Subir estudio</button>
      </PageHeader>
      <div className="tabla-contenedor">
        <table className="tabla">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Tipo</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {estudios.map((e) => (
              <tr key={e.id}>
                <td><Link href={`/veterinaria/pacientes/${e.mascotaId}`} className="enlace">{e.mascota}</Link></td>
                <td>{e.tipo}</td>
                <td>{e.fecha}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
