import PageHeader from '@/components/PageHeader'
import StatCard from '@/components/StatCard'
import { obtenerUsuarioActual, obtenerMascotas, obtenerTurnos, obtenerVacunas, obtenerPagos } from '@/lib/datos'
import { separarTurnos } from '@/lib/turnos'

export const metadata = { title: 'Mi cuenta' }

export default async function ClienteInicio() {
  // Promise.all pide todos los datos al mismo tiempo (en paralelo).
  // El RLS hace que solo vengan los datos de las mascotas de este usuario.
  const [usuario, mascotas, turnos, vacunas, pagos] = await Promise.all([
    obtenerUsuarioActual(),
    obtenerMascotas(),
    obtenerTurnos(),
    obtenerVacunas(),
    obtenerPagos(),
  ])

  const { proximos } = separarTurnos(turnos)
  const vacunasPendientes = vacunas.filter((v) => !v.aplicada)
  const pagosPendientes = pagos.filter((p) => p.estado === 'pendiente')

  return (
    <>
      <PageHeader titulo={`¡Hola, ${usuario.nombre.split(' ')[0]}!`} descripcion="Este es el resumen de tus mascotas." />

      {mascotas.length === 0 && (
        <p className="card aviso">
          Todavía no tenés mascotas en tu cuenta. Cuando la veterinaria cargue a tu mascota
          con <strong>{usuario.email}</strong>, la vas a ver acá.
        </p>
      )}

      <div className="grid-stats">
        <StatCard icono="huella" valor={mascotas.length} label="Mascotas" />
        <StatCard icono="calendario" valor={proximos.length} label="Próximos turnos" />
        <StatCard icono="jeringa" valor={vacunasPendientes.length} label="Vacunas pendientes" />
        <StatCard icono="tarjeta" valor={pagosPendientes.length} label="Pagos pendientes" />
      </div>
    </>
  )
}
