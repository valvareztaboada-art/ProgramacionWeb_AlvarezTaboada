import Link from 'next/link'
import Badge from './Badge'
import AccionesTurno from './AccionesTurno'
import TarjetaEstudio from './TarjetaEstudio'
import ProximasVacunas from './ProximasVacunas'
import HistorialVacunas from './HistorialVacunas'
import MostrarMas from './MostrarMas'
import { proximasVacunas } from '@/lib/vacunas'
import { hoyISO } from '@/lib/horarios'
import { formatearEdad, formatearFecha } from '@/lib/formato'
import { IlustracionMascota } from './ilustraciones/Ilustraciones'

// Ficha completa de una mascota. La usan las dos interfaces:
// /cliente/mascotas/[id] y /veterinaria/pacientes/[id]
// Si la ve la veterinaria (esVeterinaria), cada turno activo muestra sus acciones.
function FichaMascota({ mascota, turnos, vacunas, estudios, volver, esVeterinaria = false }) {
  const detalle = [mascota.especie, mascota.raza, formatearEdad(mascota.edad)].filter(Boolean).join(' · ')
  // Los turnos más nuevos primero
  const turnosOrdenados = [...turnos].reverse()

  return (
    <>
      <Link href={volver.href} className="volver">← {volver.label}</Link>

      <section className="card ficha">
        <IlustracionMascota especie={mascota.especie} className="ficha-ilustracion" />
        <div>
          <h1>{mascota.nombre}</h1>
          <p className="texto-suave">{detalle}</p>
          <p>
            Dueño/a: <strong>{mascota.duenio}</strong>
            {mascota.registrado && <span className="texto-suave"> · {mascota.emailDuenio}</span>}
            {!mascota.registrado && <> <Badge estado="Sin registrar" /></>}
          </p>
        </div>
      </section>

      <div className="grid-ficha">
        <section>
          <h2>Turnos</h2>
          <MostrarMas total={turnosOrdenados.length} que="turnos anteriores">
          <ul className="lista">
            {turnosOrdenados.map((t) => (
              <li key={t.id} className="card lista-item">
                <div>
                  <strong>{formatearFecha(t.fecha)} · {t.hora} h</strong>
                  <p className="texto-suave">{t.especialidad}{t.motivo && ` · ${t.motivo}`}</p>
                </div>
                <div className="lista-item-derecha">
                  <Badge estado={t.estado} />
                  {esVeterinaria && (
                    <AccionesTurno turnoId={t.id} estado={t.estado} descripcion={`${mascota.nombre} del ${formatearFecha(t.fecha)}`} />
                  )}
                </div>
              </li>
            ))}
          </ul>
          </MostrarMas>
          {turnos.length === 0 && <p className="texto-suave">Sin turnos registrados.</p>}
        </section>

        <section>
          <div className="ficha-seccion-encabezado">
            <h2>Vacunas</h2>
            {esVeterinaria && (
              <Link href={`/veterinaria/pacientes/${mascota.id}/vacunas/nueva`} className="btn btn-chico btn-primario">
                + Registrar vacuna
              </Link>
            )}
          </div>
          <ProximasVacunas proximas={proximasVacunas(vacunas, hoyISO())} mostrarMascota={false}
            vacio="No tiene vacunas programadas." />
          <h3 className="subtitulo-ficha">Historial</h3>
          <HistorialVacunas vacunas={vacunas} />
        </section>

        <section>
          <div className="ficha-seccion-encabezado">
            <h2>Estudios</h2>
            {esVeterinaria && (
              <Link href={`/veterinaria/estudios/nuevo?mascota=${mascota.id}`} className="btn btn-chico btn-primario">
                + Subir estudio
              </Link>
            )}
          </div>
          <MostrarMas total={estudios.length} que="estudios anteriores">
            <ul className="lista">
              {estudios.map((e) => (
                <TarjetaEstudio key={e.id} estudio={e} esVeterinaria={esVeterinaria}
                  volver={esVeterinaria ? `/veterinaria/pacientes/${mascota.id}` : ''} />
              ))}
            </ul>
          </MostrarMas>
          {estudios.length === 0 && <p className="texto-suave">Sin estudios cargados.</p>}
        </section>
      </div>
    </>
  )
}

export default FichaMascota
