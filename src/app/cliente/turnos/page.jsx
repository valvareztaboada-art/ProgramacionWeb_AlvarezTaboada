import PageHeader from '@/components/PageHeader'
import Badge from '@/components/Badge'
import { CLIENTE_ACTUAL, obtenerTurnos } from '@/lib/datos'

export const metadata = { title: 'Mis turnos' }

export default async function MisTurnos() {
  const turnos = await obtenerTurnos({ duenio: CLIENTE_ACTUAL })

  return (
    <>
      <PageHeader titulo="Mis turnos" descripcion="Tus próximas visitas a la veterinaria.">
        <button className="btn btn-primario">+ Pedir turno</button>
      </PageHeader>
      <ul className="lista">
        {turnos.map((t) => (
          <li key={t.id} className="card lista-item">
            <div>
              <strong>{t.fecha} · {t.hora}</strong>
              <p className="texto-suave">{t.mascota} — {t.motivo}</p>
            </div>
            <Badge estado={t.estado} />
          </li>
        ))}
      </ul>
    </>
  )
}
