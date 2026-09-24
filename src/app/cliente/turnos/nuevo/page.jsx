import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import FormularioTurno from '@/components/FormularioTurno'
import { CLIENTE_ACTUAL, obtenerMascotas, obtenerEspecialidades, obtenerHorariosOcupados } from '@/lib/datos'

export const metadata = { title: 'Pedir turno' }

// Server Component: busca los datos en el servidor y se los pasa al formulario (Client Component)
export default async function PedirTurno() {
  const [mascotas, especialidades, ocupados] = await Promise.all([
    obtenerMascotas({ emailDuenio: CLIENTE_ACTUAL.email }),
    obtenerEspecialidades(),
    obtenerHorariosOcupados(),
  ])

  return (
    <>
      <Link href="/cliente/turnos" className="volver">← Mis turnos</Link>
      <PageHeader titulo="Pedir turno" descripcion="Elegí la mascota, qué necesita y cuándo." />

      <div className="card form-card">
        {mascotas.length === 0 ? (
          <p>
            Todavía no tenés mascotas en tu cuenta. Cuando la veterinaria cargue a tu mascota
            con tu email, vas a poder pedirle turnos desde acá.
          </p>
        ) : (
          <FormularioTurno mascotas={mascotas} especialidades={especialidades} ocupados={ocupados} />
        )}
      </div>
    </>
  )
}
