import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import Badge from '@/components/Badge'
import { CLIENTE_ACTUAL, obtenerTurnos } from '@/lib/datos'
import { formatearFecha } from '@/lib/formato'

export const metadata = { title: 'Mis turnos' }

export default async function MisTurnos() {
  const turnos = await obtenerTurnos({ emailDuenio: CLIENTE_ACTUAL.email })

  return (
    <>
      <PageHeader titulo="Mis turnos" descripcion="Tus próximas visitas a la veterinaria.">
        <Link href="/cliente/turnos/nuevo" className="btn btn-primario">+ Pedir turno</Link>
      </PageHeader>
      <ul className="lista">
        {turnos.map((t) => (
          <li key={t.id} className="card lista-item">
            <div>
              <strong>{formatearFecha(t.fecha)} · {t.hora} h</strong>
              <p className="texto-suave">{t.mascota} — {t.especialidad} · {t.motivo}</p>
            </div>
            <Badge estado={t.estado} />
          </li>
        ))}
      </ul>
    </>
  )
}
