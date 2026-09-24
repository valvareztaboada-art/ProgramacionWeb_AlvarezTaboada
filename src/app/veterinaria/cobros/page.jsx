import PageHeader from '@/components/PageHeader'
import Badge from '@/components/Badge'
import { obtenerPagos } from '@/lib/datos'

export const metadata = { title: 'Cobros' }

export default async function Cobros() {
  const pagos = await obtenerPagos()

  return (
    <>
      <PageHeader titulo="Cobros" descripcion="Pagos pendientes y realizados." />
      <div className="tabla-contenedor">
        <table className="tabla">
          <thead>
            <tr>
              <th>Dueño/a</th>
              <th>Concepto</th>
              <th>Monto</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {pagos.map((p) => (
              <tr key={p.id}>
                <td>{p.duenio}</td>
                <td>{p.concepto}</td>
                <td>${p.monto.toLocaleString('es-AR')}</td>
                <td><Badge estado={p.estado} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
