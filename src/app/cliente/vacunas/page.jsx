import PageHeader from '@/components/PageHeader'
import Badge from '@/components/Badge'
import { CLIENTE_ACTUAL, obtenerVacunas } from '@/lib/datos'

export const metadata = { title: 'Vacunas' }

export default async function Vacunas() {
  const vacunas = await obtenerVacunas({ emailDuenio: CLIENTE_ACTUAL.email })

  return (
    <>
      <PageHeader titulo="Vacunas" descripcion="Calendario de vacunación de tus mascotas." />
      <ul className="lista">
        {vacunas.map((v) => (
          <li key={v.id} className="card lista-item">
            <div>
              <strong>{v.vacuna}</strong>
              <p className="texto-suave">{v.mascota} · {v.fecha}</p>
            </div>
            <Badge estado={v.aplicada ? 'Aplicada' : 'Pendiente'} />
          </li>
        ))}
      </ul>
    </>
  )
}
