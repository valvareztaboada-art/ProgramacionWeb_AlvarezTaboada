import Link from 'next/link'
import Icono from '@/components/Icono'
import {
  PerroSentado, GatoSentado, Corazon, PerroCara, GatoCara, Pajaro, GatoDurmiendo,
} from '@/components/ilustraciones/Ilustraciones'
import { CONTACTO, HORARIOS } from '@/lib/contacto'

// Página pública: es lo que ve alguien que encuentra MICAN buscando veterinarias.
// Todo el contenido es de ejemplo (MICAN es un proyecto académico).

const principios = [
  {
    icono: 'corazon',
    titulo: 'Atención sin apuro',
    texto: 'Cada consulta dura lo que tenga que durar. Escuchamos, explicamos y respondemos todas las preguntas.',
  },
  {
    icono: 'documento',
    titulo: 'Todo a la vista',
    texto: 'Diagnósticos, estudios, vacunas y costos quedan en tu cuenta. Sin sorpresas ni letra chica.',
  },
  {
    icono: 'jeringa',
    titulo: 'Prevenir es cuidar',
    texto: 'Te recordamos vacunas y controles para llegar antes que los problemas, no después.',
  },
  {
    icono: 'inicio',
    titulo: 'Somos del barrio',
    texto: 'Castraciones solidarias una vez al mes, red de adopción con refugios de la zona y colecta de alimento.',
  },
]

const numeros = [
  { valor: '+12', texto: 'años en Vélez Sarsfield' },
  { valor: '+3.000', texto: 'pacientes atendidos' },
  { valor: '4', texto: 'profesionales a tu lado' },
]

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

// Opiniones de ejemplo (ficticias)
const opiniones = [
  {
    texto: 'Pachu llegó con una tos que no se le iba y lo atendieron con una paciencia increíble. Me explicaron todo y a la semana estaba como nuevo.',
    autor: 'Lucía',
    mascota: 'Pachu',
    especie: 'Perro',
  },
  {
    texto: 'Lo mejor es la peluquería: Mora vuelve impecable y tranquila. Y poder sacar el turno desde el celular me salvó la vida.',
    autor: 'Martín',
    mascota: 'Mora',
    especie: 'Perro',
  },
  {
    texto: 'Michi odia salir de casa, pero acá lo tratan con tanto cuidado que ni se queja. Los recordatorios de vacunas son un golazo.',
    autor: 'Carla',
    mascota: 'Michi',
    especie: 'Gato',
  },
  {
    texto: 'No es fácil encontrar quien sepa de aves. Con Kiwi fueron atentos y claros, y los estudios los vi en la app ese mismo día.',
    autor: 'Sofía',
    mascota: 'Kiwi',
    especie: 'Ave',
  },
]

const preguntas = [
  {
    pregunta: '¿Cómo saco un turno?',
    respuesta: 'Si ya sos cliente, ingresá a tu cuenta y elegí día, horario y tipo de turno. Si es tu primera vez, escribinos o acercate: en la primera visita cargamos a tu mascota y después podés manejar todo online.',
  },
  {
    pregunta: '¿Atienden urgencias?',
    respuesta: `En horario de atención, sí: llamanos al ${CONTACTO.telefono} y te damos prioridad. Fuera de horario te indicamos la guardia veterinaria más cercana.`,
  },
  {
    pregunta: '¿Qué animales atienden?',
    respuesta: 'Perros, gatos y aves. Para otras especies, consultanos y te orientamos.',
  },
  {
    pregunta: '¿Cómo puedo pagar?',
    respuesta: 'En la veterinaria con efectivo o tarjeta, y online desde tu cuenta con Mercado Pago (tarjeta, débito o dinero en cuenta).',
  },
  {
    pregunta: '¿Puedo cancelar un turno?',
    respuesta: 'Sí, desde tu cuenta, hasta 24 horas antes. Si falta menos, llamanos así le damos el horario a otra mascota.',
  },
]

const ILUSTRACION_POR_ESPECIE = { Perro: PerroCara, Gato: GatoCara, Ave: Pajaro }

export default function Home() {
  return (
    <>
      {/* ---------- Portada ---------- */}
      <section className="hero">
        <div className="hero-contenido">
          <div className="hero-texto">
            <span className="etiqueta">Veterinaria en Vélez Sarsfield</span>
            <h1>
              La salud de tu mascota, <span className="resaltado">toda en un solo lugar</span>
            </h1>
            <p>
              Atención con cariño y, además, tu cuenta online: sacá turnos, consultá la historia
              clínica, recibí recordatorios de vacunas y pagá desde tu casa.
            </p>
            <div className="hero-botones">
              <Link href="/login" className="btn btn-primario">Sacá un turno</Link>
              <Link href="/registro" className="btn btn-secundario">Crear mi cuenta</Link>
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

      {/* ---------- Quiénes somos ---------- */}
      <section className="seccion" id="nosotros" aria-labelledby="titulo-nosotros">
        <div className="nosotros">
          <div className="nosotros-texto">
            <span className="etiqueta">Quiénes somos</span>
            <h2 id="titulo-nosotros">Una veterinaria de barrio, con la puerta abierta</h2>
            <p>
              MICAN nació hace más de doce años en Vélez Sarsfield, cuando dos veterinarias que
              se conocieron en la facultad decidieron abrir el lugar al que les hubiera gustado
              llevar a sus propios animales: cercano, honesto y sin apuros.
            </p>
            <p>
              El nombre lo dice todo: <strong>&ldquo;mi can&rdquo;</strong>, mi perro. Porque para nosotras
              cada paciente es el animal de alguien que lo quiere, y lo tratamos así. Hoy somos un
              equipo de cuatro profesionales y seguimos conociendo a cada mascota por su nombre.
            </p>
          </div>
          <div className="nosotros-ilustracion" aria-hidden="true">
            <div className="nosotros-circulo" />
            <GatoDurmiendo className="nosotros-gato" />
          </div>
        </div>

        <ul className="numeros" aria-label="MICAN en números">
          {numeros.map((n) => (
            <li key={n.texto}>
              <strong>{n.valor}</strong>
              <span>{n.texto}</span>
            </li>
          ))}
        </ul>

        <h3 className="subtitulo-seccion">Nuestros principios</h3>
        <div className="grid-cards">
          {principios.map((p) => (
            <article key={p.titulo} className="card card-principio">
              <span className="card-icono"><Icono nombre={p.icono} size={28} /></span>
              <h4>{p.titulo}</h4>
              <p className="texto-suave">{p.texto}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- Servicios ---------- */}
      <section className="seccion-color" id="servicios" aria-labelledby="titulo-servicios">
        <div className="seccion">
          <h2 id="titulo-servicios">Nuestros servicios</h2>
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
        </div>
      </section>

      {/* ---------- Cómo funciona la cuenta online ---------- */}
      <section className="seccion" id="como-funciona" aria-labelledby="titulo-como-funciona">
        <h2 id="titulo-como-funciona">Tu cuenta online, en 3 pasos</h2>
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
      </section>

      {/* ---------- Opiniones ---------- */}
      <section className="seccion-color seccion-opiniones" id="opiniones" aria-labelledby="titulo-opiniones">
        <div className="seccion">
          <h2 id="titulo-opiniones">Lo que dicen de nosotros</h2>
          <div className="opiniones">
            {opiniones.map((o) => {
              const Avatar = ILUSTRACION_POR_ESPECIE[o.especie]
              return (
                <figure key={o.autor} className="opinion">
                  <blockquote className="opinion-globo">
                    <p className="opinion-estrellas">
                      <span aria-hidden="true">★★★★★</span>
                      <span className="visualmente-oculto">5 de 5 estrellas</span>
                    </p>
                    <p>{o.texto}</p>
                  </blockquote>
                  <figcaption className="opinion-autor">
                    <span className="opinion-avatar" aria-hidden="true"><Avatar /></span>
                    <span>
                      <strong>{o.autor}</strong>
                      <span className="texto-suave">con {o.mascota}</span>
                    </span>
                  </figcaption>
                </figure>
              )
            })}
          </div>
          <p className="aclaracion">Opiniones ilustrativas: MICAN es un proyecto académico.</p>
        </div>
      </section>

      {/* ---------- Preguntas frecuentes ---------- */}
      <section className="seccion" id="preguntas" aria-labelledby="titulo-preguntas">
        <h2 id="titulo-preguntas">Preguntas frecuentes</h2>
        <div className="preguntas">
          {preguntas.map((p) => (
            <details key={p.pregunta} className="pregunta">
              <summary>{p.pregunta}</summary>
              <p>{p.respuesta}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ---------- Contacto y mapa ---------- */}
      <section className="seccion-color" id="contacto" aria-labelledby="titulo-contacto">
        <div className="seccion">
          <h2 id="titulo-contacto">Visitanos</h2>
          <div className="contacto">
            <div className="contacto-datos">
              <div className="card">
                <h3><Icono nombre="reloj" /> Horarios</h3>
                <dl className="horarios-atencion">
                  {HORARIOS.map((h) => (
                    <div key={h.dias} className="horario-fila">
                      <dt>{h.dias}</dt>
                      <dd>{h.horas}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="card">
                <h3><Icono nombre="mapa" /> Dónde estamos</h3>
                <address>
                  {CONTACTO.direccion}
                  <br />
                  Tel: <a href={CONTACTO.telefonoLink} className="enlace">{CONTACTO.telefono}</a>
                  <br />
                  Email: <a href={`mailto:${CONTACTO.email}`} className="enlace">{CONTACTO.email}</a>
                </address>
                <a href={CONTACTO.mapaEnlace} className="btn btn-secundario btn-chico boton-mapa"
                  target="_blank" rel="noopener noreferrer">
                  Abrir en Google Maps ↗
                </a>
              </div>
            </div>
            <div className="mapa">
              <iframe
                src={CONTACTO.mapaEmbebido}
                title={`Mapa de Google Maps: ${CONTACTO.direccion}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
