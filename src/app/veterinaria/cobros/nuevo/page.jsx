import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import FormularioCobro from '@/components/FormularioCobro'
import { obtenerMascotas } from '@/lib/datos'

export const metadata = { title: 'Nuevo cobro' }

export default async function NuevoCobro() {
  const pacientes = await obtenerMascotas()

  return (
    <>
      <Link href="/veterinaria/cobros" className="volver">← Cobros</Link>
      <PageHeader titulo="Nuevo cobro" descripcion="El dueño/a lo va a ver en su cuenta y lo puede pagar con Mercado Pago." />
      <div className="card form-card">
        <FormularioCobro pacientes={pacientes} />
      </div>
    </>
  )
}
