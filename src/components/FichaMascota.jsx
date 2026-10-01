import Link from 'next/link'
import Badge from './Badge'
import AccionesTurno from './AccionesTurno'
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
          {turnos.length === 0 && <p className="texto-suave">Sin turnos registrados.</p>}
        </section>

        <section>
          <h2>Vacunas</h2>
          <ul className="lista">
            {vacunas.map((v) => (
              <li key={v.id} className="card lista-item">
                <div>
                  <strong>{v.vacuna}</strong>
                  <p className="texto-suave">{v.fecha}</p>
                </div>
                <Badge estado={v.aplicada ? 'Aplicada' : 'Pendiente'} />
              </li>
            ))}
          </ul>
          {vacunas.length === 0 && <p className="texto-suave">Sin vacunas registradas.</p>}
        </section>

        <section>
          <h2>Estudios</h2>
          <ul className="lista">
            {estudios.map((e) => (
              <li key={e.id} className="card lista-item">
                <div>
                  <strong>{e.tipo}</strong>
                  <p className="texto-suave">{e.fecha}</p>
                </div>
              </li>
            ))}
          </ul>
          {estudios.length === 0 && <p className="texto-suave">Sin estudios cargados.</p>}
        </section>
      </div>
    </>
  )
}

export default FichaMascota
