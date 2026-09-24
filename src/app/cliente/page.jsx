import PageHeader from '@/components/PageHeader'
import StatCard from '@/components/StatCard'
import { CLIENTE_ACTUAL, obtenerMascotas, obtenerTurnos, obtenerVacunas, obtenerPagos } from '@/lib/datos'

export const metadata = { title: 'Mi cuenta' }

export default async function ClienteInicio() {
  // Promise.all pide todos los datos al mismo tiempo (en paralelo)
  const [mascotas, turnos, vacunas, pagos] = await Promise.all([
    obtenerMascotas({ duenio: CLIENTE_ACTUAL }),
    obtenerTurnos({ duenio: CLIENTE_ACTUAL }),
    obtenerVacunas({ duenio: CLIENTE_ACTUAL }),
    obtenerPagos({ duenio: CLIENTE_ACTUAL }),
  ])

  const vacunasPendientes = vacunas.filter((v) => !v.aplicada)
  const pagosPendientes = pagos.filter((p) => p.estado === 'Pendiente')

  return (
    <>
      <PageHeader titulo={`¡Hola, ${CLIENTE_ACTUAL.split(' ')[0]}!`} descripcion="Este es el resumen de tus mascotas." />
      <div className="grid-stats">
        <StatCard icono="huella" valor={mascotas.length} label="Mascotas" />
        <StatCard icono="calendario" valor={turnos.length} label="Próximos turnos" />
        <StatCard icono="jeringa" valor={vacunasPendientes.length} label="Vacunas pendientes" />
        <StatCard icono="tarjeta" valor={pagosPendientes.length} label="Pagos pendientes" />
      </div>
    </>
  )
}
