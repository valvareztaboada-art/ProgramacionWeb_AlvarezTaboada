import PageHeader from '../../components/PageHeader.jsx'
import StatCard from '../../components/StatCard.jsx'
import { mascotas, turnos, vacunas, pagos, clienteActual } from '../../data/mockData.js'

function ClienteInicio() {
  const misMascotas = mascotas.filter((m) => m.duenio === clienteActual)
  const misTurnos = turnos.filter((t) => t.duenio === clienteActual)
  const nombres = misMascotas.map((m) => m.nombre)
  const vacunasPendientes = vacunas.filter((v) => !v.aplicada && nombres.includes(v.mascota))
  const pagosPendientes = pagos.filter((p) => p.duenio === clienteActual && p.estado === 'Pendiente')

  return (
    <>
      <PageHeader titulo={`¡Hola, ${clienteActual.split(' ')[0]}!`} descripcion="Este es el resumen de tus mascotas." />
      <div className="grid-stats">
        <StatCard icono="huella" valor={misMascotas.length} label="Mascotas" />
        <StatCard icono="calendario" valor={misTurnos.length} label="Próximos turnos" />
        <StatCard icono="jeringa" valor={vacunasPendientes.length} label="Vacunas pendientes" />
        <StatCard icono="tarjeta" valor={pagosPendientes.length} label="Pagos pendientes" />
      </div>
    </>
  )
}

export default ClienteInicio
