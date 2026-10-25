import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import FormularioTurno from '@/components/FormularioTurno'
import { obtenerMascotas, obtenerEspecialidades, obtenerHorariosOcupados } from '@/lib/datos'

export const metadata = { title: 'Agendar turno' }

// /veterinaria/agenda/nuevo → la veterinaria agenda un turno (ej: alguien llamó por teléfono).
// ?mascota=12 → viene elegido el paciente (desde su ficha).
export default async function AgendarTurno({ searchParams }) {
  const [{ mascota }, mascotas, especialidades, ocupados] = await Promise.all([
    searchParams,
    obtenerMascotas(),
    obtenerEspecialidades(),
    obtenerHorariosOcupados(),
  ])
  const mascotaInicial = mascotas.some((m) => String(m.id) === mascota) ? mascota : ''

  return (
    <>
      <Link href="/veterinaria/agenda" className="volver">← Agenda</Link>
      <PageHeader titulo="Agendar turno" descripcion="El turno queda confirmado y el dueño/a lo ve en su cuenta." />
      <div className="card form-card">
        {mascotas.length === 0
          ? <p>Primero cargá al paciente en <Link href="/veterinaria/pacientes/nuevo" className="enlace">Nuevo paciente</Link>.</p>
          : <FormularioTurno mascotas={mascotas} especialidades={especialidades} ocupados={ocupados}
              paraVeterinaria mascotaInicial={mascotaInicial} />}
      </div>
    </>
  )
}
