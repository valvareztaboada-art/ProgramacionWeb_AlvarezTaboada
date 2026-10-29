import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import Icono from '@/components/Icono'
import { obtenerServicio, obtenerServicios } from '@/lib/datos'
import { FOTOS_DE_SERVICIOS } from '../fotos'
import '../servicios.css'

// Ruta dinámica del catálogo: /servicios/consulta, /servicios/vacunacion...
export async function generateMetadata({ params }) {
  const { id } = await params
  const servicio = await obtenerServicio(id)
  return servicio ? { title: servicio.nombre, description: servicio.resumen } : { title: 'Servicio' }
}

export default async function Servicio({ params }) {
  const { id } = await params
  const [servicio, todos] = await Promise.all([obtenerServicio(id), obtenerServicios()])
  if (!servicio) notFound()

  const foto = FOTOS_DE_SERVICIOS[servicio.id]
  const otros = todos.filter((s) => s.id !== servicio.id)

  return (
    <div className="catalogo">
      <div className="catalogo-ancho">
        <nav aria-label="Ruta de navegación" className="migas">
          <ol>
            <li><Link href="/">Inicio</Link></li>
            <li><Link href="/servicios">Servicios</Link></li>
            <li aria-current="page">{servicio.nombre}</li>
          </ol>
        </nav>

        <article className="servicio-detalle">
          {foto && (
            <div className="servicio-detalle-foto">
              <Image src={foto.foto} alt={foto.alt} fill preload placeholder="blur" sizes="(max-width: 860px) 100vw, 45vw"
                style={{ objectPosition: foto.posicion }} />
            </div>
          )}
          <div className="servicio-detalle-texto">
            <h1><Icono nombre={servicio.icono} size={32} /> {servicio.nombre}</h1>
            <p className="servicio-detalle-resumen">{servicio.resumen}</p>

            <dl className="servicio-datos">
              {servicio.duracion && <div><dt>Duración</dt><dd>{servicio.duracion}</dd></div>}
              {servicio.especies.length > 0 && <div><dt>Para</dt><dd>{servicio.especies.join(', ')}</dd></div>}
            </dl>

            {servicio.incluye.length > 0 && (
              <>
                <h2>Qué incluye</h2>
                <ul className="servicio-incluye">
                  {servicio.incluye.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </>
            )}

            {servicio.consejo && <p className="servicio-consejo"><strong>Antes de venir:</strong> {servicio.consejo}</p>}

            <div className="servicio-acciones">
              {/* Si no hay sesión, primero pide ingresar y después vuelve al formulario */}
              <Link href={`/cliente/turnos/nuevo?especialidad=${servicio.id}`} className="btn btn-primario">
                Sacar turno de {servicio.nombre.toLowerCase()}
              </Link>
              <Link href="/servicios" className="btn btn-secundario">Ver todos los servicios</Link>
            </div>
          </div>
        </article>

        {otros.length > 0 && (
          <section aria-labelledby="titulo-otros" className="servicio-otros">
            <h2 id="titulo-otros">Otros servicios</h2>
            <ul>
              {otros.map((s) => (
                <li key={s.id}><Link href={`/servicios/${s.id}`} className="enlace">{s.nombre}</Link></li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
