import Link from 'next/link'
import Badge from './Badge'
import { IlustracionMascota } from './ilustraciones/Ilustraciones'

// Ficha completa de una mascota. La usan las dos interfaces:
// /cliente/mascotas/[id] y /veterinaria/pacientes/[id]
function FichaMascota({ mascota, turnos, vacunas, estudios, volver }) {
  return (
    <>
      <Link href={volver.href} className="volver">← {volver.label}</Link>

      <section className="card ficha">
        <IlustracionMascota especie={mascota.especie} className="ficha-ilustracion" />
        <div>
          <h1>{mascota.nombre}</h1>
          <p className="texto-suave">{mascota.especie} · {mascota.raza} · {mascota.edad} años</p>
          <p>Dueño/a: <strong>{mascota.duenio}</strong></p>
        </div>
      </section>

      <div className="grid-ficha">
        <section>
          <h2>Turnos</h2>
          <ul className="lista">
            {turnos.map((t) => (
              <li key={t.id} className="card lista-item">
                <div>
                  <strong>{t.fecha} · {t.hora}</strong>
                  <p className="texto-suave">{t.motivo}</p>
                </div>
                <Badge estado={t.estado} />
              </li>
            ))}
          </ul>
          {turnos.length === 0 && <p className="texto-suave">Sin turnos próximos.</p>}
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
