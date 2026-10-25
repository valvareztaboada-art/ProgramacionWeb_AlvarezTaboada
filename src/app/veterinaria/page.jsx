import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import StatCard from '@/components/StatCard'
import Badge from '@/components/Badge'
import AccionesTurno from '@/components/AccionesTurno'
import AtendidosSinCobrar from '@/components/AtendidosSinCobrar'
import { obtenerUsuarioActual, obtenerMascotas, obtenerTurnos, obtenerEstudios, obtenerPagos, obtenerVacunas, obtenerMontosSugeridos } from '@/lib/datos'
import { atendidosSinCobrar } from '@/lib/cobros'
import { vacunasAVencer } from '@/lib/vacunas'
import { hoyISO } from '@/lib/horarios'
import { formatearFecha } from '@/lib/formato'
import { separarTurnos, turnosDeLaSemana } from '@/lib/turnos'

export const metadata = { title: 'Panel' }

export default async function VetInicio() {
  const [usuario, mascotas, turnos, estudios, pagos, vacunas, montos] = await Promise.all([
    obtenerUsuarioActual(),
    obtenerMascotas(),
    obtenerTurnos(),
    obtenerEstudios(),
    obtenerPagos(),
    obtenerVacunas(),
    obtenerMontosSugeridos(),
  ])

  const { proximos } = separarTurnos(turnos)
  const estaSemana = turnosDeLaSemana(turnos)
  const cobrosPendientes = pagos.filter((p) => p.estado === 'pendiente')
  // Vacunas que vencen en 30 días o menos (o ya vencieron) y todavía no se avisaron
  const porAvisar = vacunasAVencer(vacunas, hoyISO())
  const sinCobrar = atendidosSinCobrar(turnos, hoyISO())

  return (
    <>
      <PageHeader titulo={`¡Hola, ${usuario.nombre.split(' ')[0]}!`} descripcion="Resumen de la semana." />
      <div className="grid-stats">
        <StatCard icono="huella" valor={mascotas.length} label="Pacientes" />
        <StatCard icono="calendario" valor={estaSemana.length} label="Turnos esta semana" />
        <StatCard icono="tubo" valor={estudios.length} label="Estudios cargados" />
        <StatCard icono="dinero" valor={cobrosPendientes.length} label="Cobros pendientes" />
      </div>

      <section className="seccion-panel" aria-labelledby="titulo-proximos">
        <h2 id="titulo-proximos">Próximos turnos</h2>
        {proximos.length === 0 && <p className="texto-suave">No hay turnos próximos.</p>}
        <ul className="lista">
          {proximos.slice(0, 5).map((t) => (
            <li key={t.id} className="card lista-item">
              <div>
                <strong>
                  {formatearFecha(t.fecha)} · {t.hora} h —{' '}
                  <Link href={`/veterinaria/pacientes/${t.mascotaId}`} className="enlace">{t.mascota}</Link>
                </strong>
                <p className="texto-suave">{t.duenio} · {t.especialidad}{t.motivo && ` · ${t.motivo}`}</p>
              </div>
              <div className="lista-item-derecha">
                <Badge estado={t.estado} />
                <AccionesTurno turno={t} montoSugerido={montos[t.especialidadId]} />
              </div>
            </li>
          ))}
        </ul>
        <Link href="/veterinaria/agenda" className="enlace">Ver la agenda completa →</Link>
      </section>

      <AtendidosSinCobrar turnos={sinCobrar} montos={montos} />

      {porAvisar.length > 0 && (
        <p className="card aviso-panel">
          <strong>Tenés {porAvisar.length} {porAvisar.length === 1 ? 'vacuna' : 'vacunas'} por avisar</strong>
          {' '}(vencen en los próximos 30 días).{' '}
          <Link href="/veterinaria/vacunas" className="enlace">Ver vacunas a vencer →</Link>
        </p>
      )}
    </>
  )
}
