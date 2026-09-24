import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import Badge from '@/components/Badge'
import { obtenerTurnos } from '@/lib/datos'

export const metadata = { title: 'Agenda' }

export default async function Agenda() {
  const turnos = await obtenerTurnos()

  return (
    <>
      <PageHeader titulo="Agenda" descripcion="Turnos de la semana." />
      <div className="tabla-contenedor">
        <table className="tabla">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Paciente</th>
              <th>Dueño/a</th>
              <th>Motivo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {turnos.map((t) => (
              <tr key={t.id}>
                <td>{t.fecha}</td>
                <td>{t.hora}</td>
                <td><Link href={`/veterinaria/pacientes/${t.mascotaId}`} className="enlace">{t.mascota}</Link></td>
                <td>{t.duenio}</td>
                <td>{t.motivo}</td>
                <td><Badge estado={t.estado} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
