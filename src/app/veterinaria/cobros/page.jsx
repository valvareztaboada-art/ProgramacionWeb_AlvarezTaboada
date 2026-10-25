import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import Badge from '@/components/Badge'
import BotonPagoEfectivo from '@/components/BotonPagoEfectivo'
import AtendidosSinCobrar from '@/components/AtendidosSinCobrar'
import { obtenerPagos, obtenerEventosDePago, obtenerTurnos, obtenerMontosSugeridos } from '@/lib/datos'
import { atendidosSinCobrar } from '@/lib/cobros'
import { hoyISO } from '@/lib/horarios'
import { conciliarCobros } from '@/lib/mercadopago/conciliar'
import MostrarMas from '@/components/MostrarMas'

export const metadata = { title: 'Cobros' }

const formatoFechaHora = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Argentina/Buenos_Aires',
})
const pesos = (monto) => `$${Number(monto).toLocaleString('es-AR')}`
const MEDIOS = { mercado_pago: 'Mercado Pago', efectivo: 'Efectivo' }

export default async function Cobros() {
  // Primero conciliamos con Mercado Pago (por si algún webhook no llegó) y después leemos
  await conciliarCobros(await obtenerPagos())
  const [pagos, eventos, turnos, montos] = await Promise.all([
    obtenerPagos(), obtenerEventosDePago(), obtenerTurnos(), obtenerMontosSugeridos(),
  ])
  const totalPendiente = pagos
    .filter((p) => p.estado === 'pendiente' || p.estado === 'en_proceso')
    .reduce((total, p) => total + Number(p.monto), 0)

  return (
    <>
      <PageHeader titulo="Cobros" descripcion={`Pendiente de cobro: ${pesos(totalPendiente)}`}>
        <Link href="/veterinaria/cobros/nuevo" className="btn btn-primario">+ Nuevo cobro</Link>
      </PageHeader>

      <AtendidosSinCobrar turnos={atendidosSinCobrar(turnos, hoyISO())} montos={montos} />

      <MostrarMas total={pagos.length} que="cobros anteriores">
      <div className="tabla-contenedor">
        {/* 5 columnas: los datos relacionados van juntos en una celda (dato principal + detalle abajo),
            así la tabla entra en pantalla y el botón de acción siempre queda a la vista */}
        <table className="tabla tabla-cobros">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Concepto</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {pagos.map((p) => (
              <tr key={p.id}>
                <td data-label="Paciente">
                  <Link href={`/veterinaria/pacientes/${p.mascotaId}`} className="enlace">{p.mascota}</Link>
                  <span className="celda-detalle">{p.duenio}</span>
                </td>
                <td data-label="Concepto">{p.concepto}</td>
                <td data-label="Monto" className="celda-monto">{pesos(p.monto)}</td>
                <td data-label="Estado">
                  <Badge estado={p.estado} />
                  {p.pagado_en && (
                    <span className="celda-detalle">
                      {MEDIOS[p.metodo] ?? 'Pagado'} · {formatoFechaHora.format(new Date(p.pagado_en))}
                    </span>
                  )}
                  {p.mp_payment_id && <span className="celda-detalle">N° MP {p.mp_payment_id}</span>}
                </td>
                <td data-label="Acción">
                  {p.estado === 'pendiente'
                    ? <BotonPagoEfectivo pagoId={p.id} descripcion={`"${p.concepto}" de ${p.mascota} (${pesos(p.monto)})`} />
                    : <span className="texto-suave">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </MostrarMas>

      <section className="seccion-panel" aria-labelledby="titulo-eventos">
        <h2 id="titulo-eventos">Notificaciones de Mercado Pago</h2>
        <p className="texto-suave">
          Cada aviso que llega por webhook (ya validado con la firma) y qué hizo el sistema con él.
        </p>
        {eventos.length === 0
          ? <p className="texto-suave">Todavía no llegó ninguna notificación.</p>
          : (
            <MostrarMas total={eventos.length} que="notificaciones anteriores">
            <div className="tabla-contenedor">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Recibido</th>
                    <th>Cobro</th>
                    <th>N° de pago (MP)</th>
                    <th>Estado en MP</th>
                    <th>Monto</th>
                    <th>Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {eventos.map((e) => (
                    <tr key={e.id} className={e.resultado.includes('DUPLICADO') ? 'fila-alerta' : undefined}>
                      <td>{formatoFechaHora.format(new Date(e.recibido_en))}</td>
                      <td>{e.pago_id ? `#${e.pago_id}` : '—'}</td>
                      <td>{e.mp_payment_id}</td>
                      <td><code>{e.mp_estado}</code></td>
                      <td>{e.monto ? pesos(e.monto) : '—'}</td>
                      <td>{e.resultado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </MostrarMas>
          )}
      </section>
    </>
  )
}
