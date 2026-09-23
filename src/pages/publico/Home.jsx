import { Link } from 'react-router-dom'
import Icono from '../../components/Icono.jsx'
import { PerroSentado, GatoSentado, Corazon } from '../../components/ilustraciones/Ilustraciones.jsx'

const servicios = [
  { icono: 'estetoscopio', titulo: 'Consultas', texto: 'Controles generales y atención de especialidades.' },
  { icono: 'jeringa', titulo: 'Vacunación', texto: 'Calendario de vacunas y recordatorios para no olvidarte.' },
  { icono: 'tubo', titulo: 'Estudios', texto: 'Análisis, radiografías y ecografías, siempre a mano.' },
  { icono: 'tijera', titulo: 'Peluquería', texto: 'Baño y corte para perros y gatos.' },
]

function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-contenido">
          <div className="hero-texto">
            <span className="etiqueta">Veterinaria MICAN</span>
            <h1>
              La salud de tu mascota, <span className="resaltado">toda en un solo lugar</span>
            </h1>
            <p>
              Sacá turnos, consultá la historia clínica, recibí recordatorios de vacunas
              y pagá online. Todo desde tu cuenta.
            </p>
            <div className="hero-botones">
              <Link to="/cliente" className="btn btn-primario">Soy dueño/a</Link>
              <Link to="/veterinaria" className="btn btn-secundario">Soy veterinaria</Link>
            </div>
          </div>

          <div className="hero-ilustracion">
            <div className="hero-circulo" />
            <Corazon className="hero-corazon" />
            <PerroSentado className="hero-perro" />
            <GatoSentado className="hero-gato" />
          </div>
        </div>
      </section>

      <section className="seccion" id="servicios">
        <h2>Nuestros servicios</h2>
        <div className="grid-cards">
          {servicios.map((s) => (
            <article key={s.titulo} className="card card-servicio">
              <span className="card-icono">
                <Icono nombre={s.icono} size={28} />
              </span>
              <h3>{s.titulo}</h3>
              <p className="texto-suave">{s.texto}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

export default Home
