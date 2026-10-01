import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import Badge from '@/components/Badge'
import BotonCancelarTurno from '@/components/BotonCancelarTurno'
import { obtenerTurnos } from '@/lib/datos'
import { formatearFecha } from '@/lib/formato'
import { separarTurnos, clientePuedeCancelar } from '@/lib/turnos'

export const metadata = { title: 'Mis turnos' }

export default async function MisTurnos() {
  const turnos = await obtenerTurnos()
  const { proximos, historial } = separarTurnos(turnos)

  return (
    <>
      <PageHeader titulo="Mis turnos" descripcion="Podés cancelar un turno hasta 24 horas antes.">
        <Link href="/cliente/turnos/nuevo" className="btn btn-primario">+ Pedir turno</Link>
      </PageHeader>

      <section className="seccion-panel" aria-labelledby="titulo-proximos">
        <h2 id="titulo-proximos">Próximos</h2>
        {proximos.length === 0 && <p className="texto-suave">No tenés turnos próximos.</p>}
        <ul className="lista">
          {proximos.map((t) => (
            <li key={t.id} className="card lista-item">
              <div>
                <strong>{formatearFecha(t.fecha)} · {t.hora} h</strong>
                <p className="texto-suave">{t.mascota} — {t.especialidad}{t.motivo && ` · ${t.motivo}`}</p>
              </div>
              <div className="lista-item-derecha">
                <Badge estado={t.estado} />
                {clientePuedeCancelar(t)
                  ? <BotonCancelarTurno turnoId={t.id} descripcion={`${t.mascota} del ${formatearFecha(t.fecha)}`} />
                  : <p className="texto-chico">Faltan menos de 24 h: para cancelar, llamanos.</p>}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="seccion-panel" aria-labelledby="titulo-historial">
        <h2 id="titulo-historial">Historial</h2>
        {historial.length === 0 && <p className="texto-suave">Todavía no hay turnos anteriores.</p>}
        <ul className="lista">
          {historial.map((t) => (
            <li key={t.id} className="card lista-item lista-item-historial">
              <div>
                <strong>{formatearFecha(t.fecha)} · {t.hora} h</strong>
                <p className="texto-suave">{t.mascota} — {t.especialidad}{t.motivo && ` · ${t.motivo}`}</p>
              </div>
              <Badge estado={t.estado} />
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
