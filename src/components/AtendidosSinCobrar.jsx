import Link from 'next/link'
import BotonCobrarTurno from './BotonCobrarTurno'
import MostrarMas from './MostrarMas'
import { formatearFecha } from '@/lib/formato'
import { DIAS_PARA_COBRAR } from '@/lib/cobros'

// Server Component: turnos atendidos que todavía no se cobraron (ni se marcaron "no se cobra").
// Así, si al marcar "Atendido" se eligió "Ahora no", el cobro no se olvida.
// turnos: el resultado de atendidosSinCobrar() · montos: obtenerMontosSugeridos()
function AtendidosSinCobrar({ turnos, montos }) {
  if (turnos.length === 0) return null

  return (
    <section className="seccion-panel" aria-labelledby="titulo-sin-cobrar">
      <h2 id="titulo-sin-cobrar">Atendidos sin cobrar ({turnos.length})</h2>
      <p className="texto-suave">
        Turnos de los últimos {DIAS_PARA_COBRAR} días que ya se atendieron y todavía no tienen cobro.
      </p>
      <MostrarMas total={turnos.length} que="turnos más">
        <ul className="lista">
          {turnos.map((t) => {
            const fechaTexto = `${formatearFecha(t.fecha)} · ${t.hora} h`
            return (
              <li key={t.id} className="card lista-item">
                <div>
                  <strong>
                    <Link href={`/veterinaria/pacientes/${t.mascotaId}`} className="enlace">{t.mascota}</Link> · {t.especialidad}
                  </strong>
                  <p className="texto-suave">{fechaTexto} · {t.duenio}</p>
                </div>
                <BotonCobrarTurno turno={{ ...t, fechaTexto }} montoSugerido={montos[t.especialidadId]} />
              </li>
            )
          })}
        </ul>
      </MostrarMas>
    </section>
  )
}

export default AtendidosSinCobrar
