import Link from 'next/link'
import Image from 'next/image'
import Icono from '@/components/Icono'
import CaminosCuenta from '@/components/CaminosCuenta'
import CarruselOpiniones from '@/components/CarruselOpiniones'
import { CONTACTO, HORARIOS } from '@/lib/contacto'
import './portada.css'

// Las fotos se importan: Next.js conoce su tamaño, genera versiones más chicas
// para cada pantalla (en WebP) y un desenfoque mientras cargan.
import fotoPortada from './fotos/portada.jpg'
import fotoTurnos from './fotos/acceso-turnos.jpg'
import fotoVacuna from './fotos/vacuna.jpg'
import fotoEstudios from './fotos/acceso-estudios.jpg'
import fotoConsulta from './fotos/consulta.jpg'
import fotoEcografia from './fotos/ecografia.jpg'
import fotoPeluqueria from './fotos/peluqueria.jpg'
import fotoQuirofano from './fotos/quirofano.jpg'
import fotoCuidados from './fotos/cuidados.jpg'
import fotoRecepcion from './fotos/recepcion.jpg'
import fotoPerro from './fotos/perro.jpg'
import fotoGato from './fotos/gato.jpg'
import fotoAve from './fotos/ave.jpg'
import fotoConejo from './fotos/conejo.jpg'
import fotoRamona from './fotos/ramona.jpg'
import fotoOsiris from './fotos/osiris.jpg'
import fotoHomero from './fotos/homero.jpg'
import fotoFrida from './fotos/frida.jpg'
import fotoCorgi from './fotos/corgi.jpg'

// Página pública: es lo que ve alguien que encuentra MICAN buscando veterinarias.
// Todo el contenido es de ejemplo (MICAN es un proyecto académico).

// Las páginas de /cliente piden ingresar si no hay sesión, y después del login vuelven acá
const accesos = [
  { href: '/cliente/turnos', titulo: 'Turnos', texto: 'Pedí, mirá o cancelá tus turnos', foto: fotoTurnos, posicion: '55% 40%' },
  { href: '/cliente/vacunas', titulo: 'Vacunas', texto: 'Cuánto falta para la próxima', foto: fotoVacuna, posicion: '50% 35%' },
  { href: '/cliente/estudios', titulo: 'Estudios', texto: 'Resultados para ver y descargar', foto: fotoEstudios, posicion: '45% 40%' },
]

const servicios = [
  { titulo: 'Consultas', texto: 'Clínica general y especialidades para perros, gatos y aves.', foto: fotoConsulta, posicion: '50% 20%' },
  { titulo: 'Vacunación', texto: 'Calendario según la especie y aviso antes de cada dosis.', foto: fotoVacuna, posicion: '45% 40%' },
  { titulo: 'Ecografías y análisis', texto: 'El resultado queda guardado en la ficha de tu mascota.', foto: fotoEcografia, posicion: '50% 45%' },
  { titulo: 'Peluquería', texto: 'Baño y corte con paciencia, para que vuelva tranquilo.', foto: fotoPeluqueria, posicion: '50% 12%' },
  { titulo: 'Cirugías', texto: 'Castraciones y cirugías programadas en quirófano propio.', foto: fotoQuirofano, posicion: '50% 50%' },
  { titulo: 'Cuidados', texto: 'Corte de uñas, limpieza de oídos y controles rápidos.', foto: fotoCuidados, posicion: '70% 35%' },
]

const funciones = [
  { icono: 'calendario', titulo: 'Turnos', texto: 'Elegís día y horario. Cancelás hasta 24 h antes.' },
  { icono: 'jeringa', titulo: 'Vacunas', texto: 'Cuenta regresiva y un aviso cuando se acerca la próxima.' },
  { icono: 'tubo', titulo: 'Estudios', texto: 'Análisis y ecografías para ver y descargar.' },
  { icono: 'dinero', titulo: 'Pagos', texto: 'Pagás online con Mercado Pago.' },
]

const especies = [
  { nombre: 'Perros', foto: fotoPerro, alt: 'Perro de pelo corto tricolor', posicion: '50% 50%' },
  { nombre: 'Gatos', foto: fotoGato, alt: 'Gato atigrado mirando hacia arriba', posicion: '50% 40%' },
  { nombre: 'Aves', foto: fotoAve, alt: 'Periquito verde en su jaula', posicion: '50% 50%' },
  { nombre: 'Conejos', foto: fotoConejo, alt: 'Conejo belier sobre una manta', posicion: '50% 40%' },
]

const valores = [
  { icono: 'corazon', titulo: 'Atención sin apuro', texto: 'Cada consulta dura lo que tenga que durar.' },
  { icono: 'escudo', titulo: 'Todo a la vista', texto: 'Diagnósticos, estudios y costos en tu cuenta.' },
  { icono: 'inicio', titulo: 'Somos del barrio', texto: 'Castraciones solidarias y red de adopción.' },
]

const numeros = [
  { valor: '+12', texto: 'años en el barrio' },
  { valor: '+3.000', texto: 'pacientes' },
  { valor: '4', texto: 'profesionales' },
]

// Opiniones de ejemplo (ficticias)
const opiniones = [
  {
    texto: 'Ramona tenía una tos que no se le iba. Me explicaron todo con dibujitos y a la semana estaba persiguiendo palomas de nuevo.',
    autor: 'Valentina', mascota: 'Ramona', especie: 'perra',
    foto: fotoRamona, alt: 'Ramona, perra blanca y negra con la lengua afuera',
  },
  {
    texto: 'Osiris se cree un dios egipcio y odia que lo toquen. Acá le tuvieron una paciencia que ni yo. Volvió ofendido, pero sano.',
    autor: 'Joaquín', mascota: 'Osiris', especie: 'gato',
    foto: fotoOsiris, alt: 'Osiris, gato blanco y negro asomado sobre una tabla',
  },
  {
    texto: 'Homero vuelve de la peluquería como de comercial de champú. Y saco el turno desde el celular en un minuto.',
    autor: 'Agustina', mascota: 'Homero', especie: 'samoyedo',
    foto: fotoHomero, alt: 'Homero, samoyedo blanco sonriendo',
  },
  {
    texto: 'No es fácil encontrar quien sepa de loros. Con Frida fueron atentos y claros, y el análisis lo vi en la cuenta ese mismo día.',
    autor: 'Ernesto', mascota: 'Frida', especie: 'loro gris',
    foto: fotoFrida, alt: 'Frida, loro gris africano sobre un tronco',
  },
]

const preguntas = [
  {
    pregunta: '¿Cómo saco un turno?',
    respuesta: 'Si ya tenés cuenta, ingresá y elegí día, horario y tipo de turno. Si es tu primera vez, llamanos o acercate: en la primera visita cargamos a tu mascota y después manejás todo online.',
  },
  {
    pregunta: 'Ya fui a la veterinaria, ¿por qué no veo a mi mascota?',
    respuesta: 'Fijate de haber creado la cuenta con el mismo email que dejaste en la consulta. Si usaste otro, avisanos y lo corregimos.',
  },
  {
    pregunta: '¿Atienden urgencias?',
    respuesta: `En horario de atención, sí: llamanos al ${CONTACTO.telefono} y te damos prioridad. Fuera de horario te indicamos la guardia veterinaria más cercana.`,
  },
  {
    pregunta: '¿Qué animales atienden?',
    respuesta: 'Perros, gatos, aves y conejos. Para otras especies, consultanos y te orientamos.',
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

// Un paso de "Cómo funciona": título, texto y un dibujito de cómo se ve en el sitio
function Paso({ titulo, children, muestra }) {
  return (
    <li className="paso-cuenta">
      <h3>{titulo}</h3>
      <p>{children}</p>
      <div className="muestra" aria-hidden="true">{muestra}</div>
    </li>
  )
}

function MuestraMascota({ foto, nombre, detalle }) {
  return (
    <div className="muestra-mascota">
      <Image src={foto} alt="" width={42} height={42} />
      <div><strong>{nombre}</strong>{detalle}</div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="portada-pagina">
      {/* ---------- Portada ---------- */}
      <section className="portada" aria-labelledby="titulo-portada">
        <div className="portada-foto">
          <Image src={fotoPortada} alt="Veterinario revisando a un ovejero alemán en la camilla"
            fill preload placeholder="blur" sizes="(max-width: 860px) 100vw, 60vw" />
        </div>
        <div className="ancho portada-texto">
          <p className="portada-eyebrow entra">Veterinaria en Vélez Sarsfield</p>
          <h1 id="titulo-portada" className="entra">Medicina de verdad, a la vuelta de casa.</h1>
          <p className="portada-bajada entra">
            Consultas, vacunas, estudios y peluquería. Y una cuenta online para tener todo a mano.
          </p>
          <div className="portada-botones entra">
            <Link href="/cliente/turnos/nuevo" className="btn btn-acento">Sacá un turno</Link>
            <Link href="#como-funciona" className="btn btn-claro">¿Primera vez? Cómo funciona</Link>
          </div>
          <p className="portada-datos entra">
            <span><Icono nombre="reloj" size={18} /> Lun a vie 9 a 18 h · Sáb 9 a 13 h</span>
            <span><Icono nombre="telefono" size={18} /> {CONTACTO.telefono}</span>
          </p>
        </div>
      </section>

      <nav className="ancho accesos" aria-label="Accesos a tu cuenta">
        {accesos.map((a) => (
          <Link key={a.href} href={a.href} className="acceso">
            <Image src={a.foto} alt="" fill sizes="(max-width: 600px) 100vw, 33vw" style={{ objectPosition: a.posicion }} />
            <strong>{a.titulo} <Icono nombre="flecha" size={20} /></strong>
            <span>{a.texto}</span>
          </Link>
        ))}
      </nav>

      <div className="cinta" aria-hidden="true">
        <div>
          {[0, 1].map((vuelta) => (
            ['Consultas', 'Vacunación', 'Ecografías', 'Análisis', 'Peluquería', 'Cirugías', 'Castraciones'].map((s) => (
              <span key={`${vuelta}-${s}`}>{s}<i>●</i></span>
            ))
          ))}
        </div>
      </div>

      {/* ---------- Servicios ---------- */}
      <section className="ancho bloque" id="servicios" aria-labelledby="titulo-servicios">
        <div className="bloque-titulo revela">
          <p className="portada-eyebrow">Servicios</p>
          <h2 id="titulo-servicios">Todo lo que tu mascota necesita, en un solo lugar</h2>
        </div>
        <ul className="servicios">
          {servicios.map((s) => (
            <li key={s.titulo} className="servicio revela">
              <Image src={s.foto} alt="" fill sizes="(max-width: 600px) 100vw, (max-width: 860px) 50vw, 33vw"
                style={{ objectPosition: s.posicion }} />
              <div>
                <h3>{s.titulo}</h3>
                <p>{s.texto}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="servicios-mas">
          <Link href="/servicios" className="btn btn-primario">Ver los servicios y sacar turno</Link>
        </p>
      </section>

      {/* ---------- Cómo funciona ---------- */}
      <section className="bloque-color" id="como-funciona" aria-labelledby="titulo-como-funciona">
        <div className="ancho bloque">
          <div className="bloque-titulo revela">
            <p className="portada-eyebrow">Cómo funciona</p>
            <h2 id="titulo-como-funciona">¿Primera vez en MICAN? Te explicamos</h2>
            <p>Tu cuenta se arma con lo que cargamos en la veterinaria. Elegí tu caso:</p>
          </div>

          <CaminosCuenta
            yaVino={
              <ol className="pasos-cuenta">
                <Paso titulo="Creá tu cuenta" muestra={<>
                  <span className="muestra-campo lleno">valentina@gmail.com</span>
                  <span className="muestra-campo">••••••••••</span>
                  <span className="muestra-boton">Crear mi cuenta</span>
                </>}>
                  Usá <strong>el mismo email</strong> que dejaste en la veterinaria.
                </Paso>
                <Paso titulo="Tu mascota ya aparece" muestra={<MuestraMascota foto={fotoRamona} nombre="Ramona" detalle="Perra · 4 años" />}>
                  No tenés que cargar nada: ves su ficha, vacunas y estudios.
                </Paso>
                <Paso titulo="Manejá todo online" muestra={
                  <span className="muestra-contador"><span><strong>Antirrábica</strong> · Ramona</span><span className="muestra-dias">faltan 12 días</span></span>
                }>
                  Pedí turnos, mirá cuánto falta para cada vacuna y pagá con Mercado Pago.
                </Paso>
              </ol>
            }
            nuevo={
              <ol className="pasos-cuenta">
                <Paso titulo="Pedí el primer turno" muestra={<>
                  <span className="muestra-telefono">{CONTACTO.telefono}</span>
                  <span>Lun a vie 9 a 18 h · Sáb 9 a 13 h</span>
                </>}>
                  Llamanos o acercate a la veterinaria.
                </Paso>
                <Paso titulo="Cargamos a tu mascota" muestra={<MuestraMascota foto={fotoOsiris} nombre="Osiris" detalle="Gato · 2 años" />}>
                  En la consulta la registramos con <strong>tu email</strong>. Anotalo bien: es el de tu cuenta.
                </Paso>
                <Paso titulo="Creá tu cuenta" muestra={<>
                  <span className="muestra-campo lleno">joaquin@hotmail.com</span>
                  <span className="muestra-boton">Crear mi cuenta</span>
                </>}>
                  Con ese mismo email. Tu mascota ya te va a estar esperando.
                </Paso>
              </ol>
            }
          />

          <div className="tu-cuenta">
            <div className="revela">
              <h3>Lo que podés hacer desde tu cuenta</h3>
              <p>Desde el celular o la compu, sin llamar ni esperar.</p>
              <div className="portada-botones">
                <Link href="/registro" className="btn btn-primario">Crear mi cuenta</Link>
                <Link href="/login" className="btn btn-secundario">Ya tengo cuenta</Link>
              </div>
            </div>
            <ul className="funciones">
              {funciones.map((f) => (
                <li key={f.titulo} className="funcion revela">
                  <Icono nombre={f.icono} size={24} />
                  <strong>{f.titulo}</strong>
                  <span>{f.texto}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- A quiénes atendemos ---------- */}
      <section className="ancho bloque" aria-labelledby="titulo-especies">
        <div className="bloque-titulo revela">
          <p className="portada-eyebrow">Pacientes</p>
          <h2 id="titulo-especies">A quiénes atendemos</h2>
        </div>
        <ul className="especies">
          {especies.map((e) => (
            <li key={e.nombre} className="especie revela">
              <Image src={e.foto} alt={e.alt} fill sizes="(max-width: 860px) 50vw, 25vw" style={{ objectPosition: e.posicion }} />
              <strong>{e.nombre}</strong>
            </li>
          ))}
        </ul>
        <p className="especies-nota">¿Tenés otra especie? Consultanos y te orientamos.</p>
      </section>

      {/* ---------- Quiénes somos ---------- */}
      <section className="bloque-color" id="nosotros" aria-labelledby="titulo-nosotros">
        <div className="ancho bloque nosotros-bloque">
          <div className="nosotros-hoja revela">
            <Image src={fotoRecepcion} alt="Una veterinaria saluda a un salchicha en la sala de espera mientras otra familia espera en la recepción"
              fill sizes="(max-width: 860px) 90vw, 45vw" style={{ objectPosition: '20% 50%' }} placeholder="blur" />
          </div>
          <div className="revela">
            <div className="bloque-titulo">
              <p className="portada-eyebrow">Quiénes somos</p>
              <h2 id="titulo-nosotros">Una veterinaria de barrio, con la puerta abierta</h2>
              <p>
                MICAN viene de <strong>“mi can”</strong>, mi perro. Nació hace más de doce años, cuando dos
                veterinarias que se conocieron en la facultad abrieron el lugar al que les hubiera gustado
                llevar a sus propios animales. Hoy somos cuatro y conocemos a cada paciente por su nombre.
              </p>
            </div>
            <ul className="numeros-portada" aria-label="MICAN en números">
              {numeros.map((n) => <li key={n.texto}><strong>{n.valor}</strong>{n.texto}</li>)}
            </ul>
            <ul className="valores">
              {valores.map((v) => (
                <li key={v.titulo} className="valor">
                  <Icono nombre={v.icono} size={22} />
                  <strong>{v.titulo}</strong>
                  <span>{v.texto}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- Opiniones ---------- */}
      <section className="opiniones-banda" aria-label="Opiniones">
        <div className="ancho">
          <CarruselOpiniones opiniones={opiniones} />
        </div>
      </section>

      {/* ---------- Preguntas frecuentes ---------- */}
      <section className="ancho bloque" id="preguntas" aria-labelledby="titulo-preguntas">
        <div className="bloque-titulo revela">
          <p className="portada-eyebrow">Preguntas frecuentes</p>
          <h2 id="titulo-preguntas">Antes de venir</h2>
        </div>
        <div className="preguntas-lista">
          {preguntas.map((p) => (
            <details key={p.pregunta} className="pregunta">
              <summary>{p.pregunta}</summary>
              <p>{p.respuesta}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ---------- Llamado final ---------- */}
      <section className="ancho" aria-labelledby="titulo-llamado">
        <div className="llamado revela">
          <div className="llamado-texto">
            <h2 id="titulo-llamado">¿Ya nos visitaste? Creá tu cuenta en un minuto.</h2>
            <p>Usá el mismo email que dejaste en la veterinaria y tu mascota va a estar ahí.</p>
            <div className="portada-botones">
              <Link href="/registro" className="btn btn-oscuro">Crear mi cuenta</Link>
              <Link href="#como-funciona" className="btn btn-borde-oscuro">Ver cómo funciona</Link>
            </div>
          </div>
          <div className="llamado-foto">
            <Image src={fotoCorgi} alt="Cachorro corgi sentado sobre fondo naranja" fill sizes="(max-width: 860px) 100vw, 35vw"
              style={{ objectPosition: '50% 60%' }} />
          </div>
        </div>
      </section>

      {/* ---------- Contacto y mapa ---------- */}
      <section className="ancho bloque" id="contacto" aria-labelledby="titulo-contacto">
        <div className="bloque-titulo">
          <p className="portada-eyebrow">Visitanos</p>
          <h2 id="titulo-contacto">Estamos cerca</h2>
        </div>
        <div className="contacto-grilla">
          <div className="contacto-datos">
            <div className="contacto-dato">
              <Icono nombre="mapa" />
              <strong>Dónde</strong>
              <span>{CONTACTO.direccion}</span>
              <a href={CONTACTO.mapaEnlace} className="enlace" target="_blank" rel="noopener noreferrer">Abrir en Google Maps ↗</a>
            </div>
            <div className="contacto-dato">
              <Icono nombre="reloj" />
              <strong>Cuándo</strong>
              {HORARIOS.map((h) => <span key={h.dias}>{h.dias}: {h.horas}</span>)}
            </div>
            <div className="contacto-dato">
              <Icono nombre="telefono" />
              <strong>Llamanos o escribinos</strong>
              <a href={CONTACTO.telefonoLink} className="enlace">{CONTACTO.telefono}</a>
              <a href={`mailto:${CONTACTO.email}`} className="enlace">{CONTACTO.email}</a>
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
      </section>

      {/* En el celular: botones fijos abajo para lo más usado */}
      <div className="barra-movil">
        <Link href="/cliente/turnos/nuevo">Sacar turno</Link>
        <a href={CONTACTO.telefonoLink}>Llamar</a>
      </div>
    </div>
  )
}
