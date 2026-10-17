import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import ProximasVacunas from '@/components/ProximasVacunas'
import HistorialVacunas from '@/components/HistorialVacunas'
import { obtenerVacunas } from '@/lib/datos'
import { proximasVacunas } from '@/lib/vacunas'
import { hoyISO } from '@/lib/horarios'

export const metadata = { title: 'Vacunas' }

export default async function Vacunas() {
  // El RLS hace que solo vengan las vacunas de sus mascotas
  const vacunas = await obtenerVacunas()
  const proximas = proximasVacunas(vacunas, hoyISO())
  const hayQuePedirTurno = proximas.some((v) => v.estado !== 'al_dia')

  return (
    <>
      <PageHeader titulo="Vacunas" descripcion="Cuando se acerque una vacuna, la veterinaria te va a avisar.">
        <Link href="/cliente/turnos/nuevo" className={`btn ${hayQuePedirTurno ? 'btn-primario' : 'btn-secundario'}`}>
          Pedir turno de vacunación
        </Link>
      </PageHeader>

      <section className="seccion-panel" aria-labelledby="titulo-proximas">
        <h2 id="titulo-proximas">Próximas</h2>
        <ProximasVacunas proximas={proximas} vacio="No hay vacunas programadas por ahora." />
      </section>

      <section className="seccion-panel" aria-labelledby="titulo-historial-vacunas">
        <h2 id="titulo-historial-vacunas">Historial</h2>
        <HistorialVacunas vacunas={vacunas} mostrarMascota />
      </section>
    </>
  )
}
