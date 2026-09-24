import Link from 'next/link'
import Icono from '@/components/Icono'
import { PerroSentado, GatoSentado, Corazon } from '@/components/ilustraciones/Ilustraciones'

const servicios = [
  { icono: 'estetoscopio', titulo: 'Consultas', texto: 'Controles generales y atención de especialidades.' },
  { icono: 'jeringa', titulo: 'Vacunación', texto: 'Calendario de vacunas y recordatorios para no olvidarte.' },
  { icono: 'tubo', titulo: 'Estudios', texto: 'Análisis, radiografías y ecografías, siempre a mano.' },
  { icono: 'tijera', titulo: 'Peluquería', texto: 'Baño y corte para perros y gatos.' },
]

const pasos = [
  { icono: 'huella', titulo: 'Cargamos a tu mascota', texto: 'En la primera visita, la veterinaria la registra con tu email.' },
  { icono: 'documento', titulo: 'Creás tu cuenta', texto: 'Registrate con ese mismo email y tu mascota ya te va a estar esperando.' },
  { icono: 'calendario', titulo: 'Gestionás todo online', texto: 'Pedí turnos, mirá vacunas y estudios, y pagá desde tu casa.' },
]

export default function Home() {
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
              <Link href="/cliente" className="btn btn-primario">Soy dueño/a</Link>
              <Link href="/veterinaria" className="btn btn-secundario">Soy veterinaria</Link>
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

      <section className="seccion-color" id="como-funciona" aria-labelledby="titulo-como-funciona">
        <div className="seccion">
          <h2 id="titulo-como-funciona">Cómo funciona</h2>
          <ol className="pasos">
            {pasos.map((paso, i) => (
              <li key={paso.titulo} className="paso">
                <span className="paso-numero" aria-hidden="true">{i + 1}</span>
                <span className="paso-icono"><Icono nombre={paso.icono} size={30} /></span>
                <h3>{paso.titulo}</h3>
                <p className="texto-suave">{paso.texto}</p>
              </li>
            ))}
          </ol>
          <Link href="/registro" className="btn btn-primario">Crear mi cuenta</Link>
        </div>
      </section>

      <section className="seccion" id="contacto" aria-labelledby="titulo-contacto">
        <h2 id="titulo-contacto">Visitanos</h2>
        <div className="grid-contacto">
          <div className="card">
            <h3>Horarios</h3>
            <dl className="horarios-atencion">
              <dt>Lunes a viernes</dt>
              <dd>9 a 18 h</dd>
              <dt>Sábados</dt>
              <dd>9 a 13 h</dd>
              <dt>Domingos</dt>
              <dd>Cerrado</dd>
            </dl>
          </div>
          <div className="card">
            <h3>Dónde estamos</h3>
            <address>
              Av. Siempre Viva 742, CABA
              <br />
              Tel: <a href="tel:+541112345678" className="enlace">(011) 1234-5678</a>
              <br />
              Email: <a href="mailto:hola@mican.vet" className="enlace">hola@mican.vet</a>
            </address>
          </div>
        </div>
      </section>
    </>
  )
}
