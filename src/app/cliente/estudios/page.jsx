import PageHeader from '@/components/PageHeader'
import { CLIENTE_ACTUAL, obtenerEstudios } from '@/lib/datos'

export const metadata = { title: 'Estudios' }

export default async function MisEstudios() {
  const estudios = await obtenerEstudios({ duenio: CLIENTE_ACTUAL })

  return (
    <>
      <PageHeader titulo="Estudios" descripcion="Resultados subidos por la veterinaria." />
      <ul className="lista">
        {estudios.map((e) => (
          <li key={e.id} className="card lista-item">
            <div>
              <strong>{e.tipo}</strong>
              <p className="texto-suave">{e.mascota} · {e.fecha}</p>
            </div>
            <button className="btn btn-secundario">Ver</button>
          </li>
        ))}
      </ul>
    </>
  )
}
