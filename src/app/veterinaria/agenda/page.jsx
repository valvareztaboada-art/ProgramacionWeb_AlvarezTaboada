import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import Badge from '@/components/Badge'
import AccionesTurno from '@/components/AccionesTurno'
import MostrarMas from '@/components/MostrarMas'
import { obtenerTurnos, obtenerMontosSugeridos } from '@/lib/datos'
import { formatearFecha } from '@/lib/formato'
import { separarTurnos } from '@/lib/turnos'

export const metadata = { title: 'Agenda' }

function TablaTurnos({ turnos, conAcciones, montos = {} }) {
  return (
    <div className="tabla-contenedor">
      <table className="tabla">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Paciente</th>
            <th>Dueño/a</th>
            <th>Especialidad</th>
            <th>Motivo</th>
            <th>Estado</th>
            {conAcciones && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {turnos.map((t) => (
            <tr key={t.id}>
              <td>{formatearFecha(t.fecha)}</td>
              <td>{t.hora}</td>
              <td><Link href={`/veterinaria/pacientes/${t.mascotaId}`} className="enlace">{t.mascota}</Link></td>
              <td>{t.duenio}</td>
              <td>{t.especialidad}</td>
              <td>{t.motivo ?? '—'}</td>
              <td><Badge estado={t.estado} /></td>
              {conAcciones && (
                <td><AccionesTurno turno={t} montoSugerido={montos[t.especialidadId]} /></td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default async function Agenda() {
  const [turnos, montos] = await Promise.all([obtenerTurnos(), obtenerMontosSugeridos()])
  const { proximos, historial } = separarTurnos(turnos)
  // Turnos que ya pasaron pero siguen activos: hay que marcarlos como atendido o ausente
  const sinCerrar = historial.filter((t) => t.estado === 'pendiente' || t.estado === 'confirmado')
  const cerrados = historial.filter((t) => !sinCerrar.includes(t))

  return (
    <>
      <PageHeader titulo="Agenda" descripcion="Confirmá, cancelá o marcá la asistencia de cada turno.">
        <Link href="/veterinaria/agenda/nuevo" className="btn btn-primario">+ Agendar turno</Link>
      </PageHeader>

      {sinCerrar.length > 0 && (
        <section className="seccion-panel" aria-labelledby="titulo-sin-cerrar">
          <h2 id="titulo-sin-cerrar">Para cerrar ({sinCerrar.length})</h2>
          <p className="texto-suave">Turnos que ya pasaron: marcá si el paciente vino o no.</p>
          <TablaTurnos turnos={sinCerrar} conAcciones montos={montos} />
        </section>
      )}

      <section className="seccion-panel" aria-labelledby="titulo-proximos">
        <h2 id="titulo-proximos">Próximos turnos</h2>
        {proximos.length === 0
          ? <p className="texto-suave">No hay turnos próximos.</p>
          : <TablaTurnos turnos={proximos} conAcciones montos={montos} />}
      </section>

      <section className="seccion-panel" aria-labelledby="titulo-historial">
        <h2 id="titulo-historial">Historial</h2>
        {cerrados.length === 0
          ? <p className="texto-suave">Todavía no hay turnos anteriores.</p>
          : <MostrarMas total={cerrados.length} que="turnos anteriores"><TablaTurnos turnos={cerrados} /></MostrarMas>}
      </section>
    </>
  )
}
