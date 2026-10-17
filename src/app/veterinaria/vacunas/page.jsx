import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import BotonCopiar from '@/components/BotonCopiar'
import CasillaAvisado from '@/components/CasillaAvisado'
import MostrarMas from '@/components/MostrarMas'
import { obtenerVacunas } from '@/lib/datos'
import { vacunasAVencer, vacunasYaAvisadas, mensajeDeAviso } from '@/lib/vacunas'
import { formatearFecha } from '@/lib/formato'
import { hoyISO } from '@/lib/horarios'

export const metadata = { title: 'Vacunas a vencer' }

function cuandoVence(dias) {
  if (dias < 0) return `venció hace ${-dias} ${-dias === 1 ? 'día' : 'días'}`
  if (dias === 0) return 'vence hoy'
  return `faltan ${dias} ${dias === 1 ? 'día' : 'días'}`
}

function TarjetaAviso({ v, avisada }) {
  const fechaTexto = formatearFecha(v.proxima_dosis)
  const mensaje = mensajeDeAviso({ nombreDuenio: v.duenio, mascota: v.mascota, vacuna: v.vacuna, fechaTexto })
  const descripcion = `${v.vacuna} de ${v.mascota}`

  return (
    <li className={`card aviso-vacuna aviso-${v.estado}`}>
      <div className="aviso-vacuna-datos">
        <p className="aviso-vacuna-titulo">
          <Link href={`/veterinaria/pacientes/${v.mascotaId}`} className="enlace">{v.mascota}</Link> · {v.vacuna}
        </p>
        <p>
          <span className={`etiqueta-dias etiqueta-${v.estado}`}>{cuandoVence(v.dias)}</span>{' '}
          <span className="texto-suave">{fechaTexto}</span>
        </p>
        <p className="aviso-vacuna-duenio">
          <span>{v.duenio !== v.emailDuenio ? `${v.duenio} · ` : ''}</span>
          <span className="aviso-email">{v.emailDuenio}</span>
        </p>
      </div>
      <div className="aviso-vacuna-acciones">
        <BotonCopiar texto={v.emailDuenio} etiqueta="Copiar email" descripcion={v.duenio} />
        <BotonCopiar texto={mensaje.texto} etiqueta="Copiar mensaje" descripcion={descripcion} />
        <CasillaAvisado vacunaId={v.id} avisado={avisada} descripcion={descripcion} />
      </div>
    </li>
  )
}

export default async function VacunasAVencer() {
  const vacunas = await obtenerVacunas()
  const hoy = hoyISO()
  const pendientes = vacunasAVencer(vacunas, hoy)
  const avisadas = vacunasYaAvisadas(vacunas, hoy)

  return (
    <>
      <PageHeader titulo="Vacunas a vencer"
        descripcion="Vacunas que vencen en los próximos 30 días (o ya vencieron). Avisale al dueño/a y tildá “Ya le avisé”." />

      <section className="seccion-panel" aria-labelledby="titulo-por-avisar">
        <h2 id="titulo-por-avisar">Por avisar ({pendientes.length})</h2>
        {pendientes.length === 0
          ? <p className="texto-suave">No hay vacunas por avisar. 🎉</p>
          : (
            <ul className="lista">
              {pendientes.map((v) => <TarjetaAviso key={v.id} v={v} avisada={false} />)}
            </ul>
          )}
      </section>

      {avisadas.length > 0 && (
        <section className="seccion-panel" aria-labelledby="titulo-avisadas">
          <h2 id="titulo-avisadas">Ya avisadas</h2>
          <p className="texto-suave">Siguen acá hasta que se registre la nueva dosis. Si tildaste alguna por error, destildala.</p>
          <MostrarMas total={avisadas.length} que="avisadas más">
            <ul className="lista">
              {avisadas.map((v) => <TarjetaAviso key={v.id} v={v} avisada />)}
            </ul>
          </MostrarMas>
        </section>
      )}
    </>
  )
}
