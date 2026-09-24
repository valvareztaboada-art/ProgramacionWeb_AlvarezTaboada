import PageHeader from '@/components/PageHeader'
import StatCard from '@/components/StatCard'
import { CLIENTE_ACTUAL, obtenerMascotas, obtenerTurnos, obtenerVacunas, obtenerPagos } from '@/lib/datos'

export const metadata = { title: 'Mi cuenta' }

export default async function ClienteInicio() {
  // Promise.all pide todos los datos al mismo tiempo (en paralelo)
  const [mascotas, turnos, vacunas, pagos] = await Promise.all([
    obtenerMascotas({ emailDuenio: CLIENTE_ACTUAL.email }),
    obtenerTurnos({ emailDuenio: CLIENTE_ACTUAL.email }),
    obtenerVacunas({ emailDuenio: CLIENTE_ACTUAL.email }),
    obtenerPagos({ emailDuenio: CLIENTE_ACTUAL.email }),
  ])

  const vacunasPendientes = vacunas.filter((v) => !v.aplicada)
  const pagosPendientes = pagos.filter((p) => p.estado === 'Pendiente')

  return (
    <>
      <PageHeader titulo={`¡Hola, ${CLIENTE_ACTUAL.nombre.split(' ')[0]}!`} descripcion="Este es el resumen de tus mascotas." />
      <div className="grid-stats">
        <StatCard icono="huella" valor={mascotas.length} label="Mascotas" />
        <StatCard icono="calendario" valor={turnos.length} label="Próximos turnos" />
        <StatCard icono="jeringa" valor={vacunasPendientes.length} label="Vacunas pendientes" />
        <StatCard icono="tarjeta" valor={pagosPendientes.length} label="Pagos pendientes" />
      </div>
    </>
  )
}
