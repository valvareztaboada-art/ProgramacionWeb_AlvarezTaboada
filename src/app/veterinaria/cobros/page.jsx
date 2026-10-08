import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import Badge from '@/components/Badge'
import { obtenerPagos, obtenerEventosDePago } from '@/lib/datos'
import { conciliarCobros } from '@/lib/mercadopago/conciliar'

export const metadata = { title: 'Cobros' }

const formatoFechaHora = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Argentina/Buenos_Aires',
})
const pesos = (monto) => `$${Number(monto).toLocaleString('es-AR')}`

export default async function Cobros() {
  // Primero conciliamos con Mercado Pago (por si algún webhook no llegó) y después leemos
  await conciliarCobros(await obtenerPagos())
  const [pagos, eventos] = await Promise.all([obtenerPagos(), obtenerEventosDePago()])
  const totalPendiente = pagos
    .filter((p) => p.estado === 'pendiente' || p.estado === 'en_proceso')
    .reduce((total, p) => total + Number(p.monto), 0)

  return (
    <>
      <PageHeader titulo="Cobros" descripcion={`Pendiente de cobro: ${pesos(totalPendiente)}`}>
        <Link href="/veterinaria/cobros/nuevo" className="btn btn-primario">+ Nuevo cobro</Link>
      </PageHeader>

      <div className="tabla-contenedor">
        <table className="tabla">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Dueño/a</th>
              <th>Concepto</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Pagado el</th>
              <th>N° de pago (MP)</th>
            </tr>
          </thead>
          <tbody>
            {pagos.map((p) => (
              <tr key={p.id}>
                <td><Link href={`/veterinaria/pacientes/${p.mascotaId}`} className="enlace">{p.mascota}</Link></td>
                <td>{p.duenio}</td>
                <td>{p.concepto}</td>
                <td>{pesos(p.monto)}</td>
                <td><Badge estado={p.estado} /></td>
                <td>{p.pagado_en ? formatoFechaHora.format(new Date(p.pagado_en)) : '—'}</td>
                <td>{p.mp_payment_id ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="seccion-panel" aria-labelledby="titulo-eventos">
        <h2 id="titulo-eventos">Notificaciones de Mercado Pago</h2>
        <p className="texto-suave">
          Cada aviso que llega por webhook (ya validado con la firma) y qué hizo el sistema con él.
        </p>
        {eventos.length === 0
          ? <p className="texto-suave">Todavía no llegó ninguna notificación.</p>
          : (
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
          )}
      </section>
    </>
  )
}
