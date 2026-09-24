import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import StatCard from '@/components/StatCard'
import Badge from '@/components/Badge'
import { obtenerMascotas, obtenerTurnos, obtenerEstudios, obtenerPagos } from '@/lib/datos'

export const metadata = { title: 'Panel' }

export default async function VetInicio() {
  const [mascotas, turnos, estudios, pagos] = await Promise.all([
    obtenerMascotas(),
    obtenerTurnos(),
    obtenerEstudios(),
    obtenerPagos(),
  ])

  const pendientes = pagos.filter((p) => p.estado === 'Pendiente')

  return (
    <>
      <PageHeader titulo="Panel de la veterinaria" descripcion="Resumen de la semana." />
      <div className="grid-stats">
        <StatCard icono="huella" valor={mascotas.length} label="Pacientes" />
        <StatCard icono="calendario" valor={turnos.length} label="Turnos esta semana" />
        <StatCard icono="tubo" valor={estudios.length} label="Estudios cargados" />
        <StatCard icono="dinero" valor={pendientes.length} label="Cobros pendientes" />
      </div>

      <section className="seccion-panel">
        <h2>Próximos turnos</h2>
        <ul className="lista">
          {turnos.slice(0, 3).map((t) => (
            <li key={t.id} className="card lista-item">
              <div>
                <strong>
                  {t.fecha} · {t.hora} —{' '}
                  <Link href={`/veterinaria/pacientes/${t.mascotaId}`} className="enlace">{t.mascota}</Link>
                </strong>
                <p className="texto-suave">{t.duenio} · {t.motivo}</p>
              </div>
              <Badge estado={t.estado} />
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
