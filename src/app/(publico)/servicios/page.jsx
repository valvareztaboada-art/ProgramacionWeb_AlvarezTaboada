import Link from 'next/link'
import Image from 'next/image'
import Icono from '@/components/Icono'
import { obtenerServicios } from '@/lib/datos'
import { filtrarServicios, ESPECIES_DEL_CATALOGO } from '@/lib/servicios'
import { FOTOS_DE_SERVICIOS } from './fotos'
import './servicios.css'

export const metadata = {
  title: 'Servicios',
  description: 'Consultas, vacunación, estudios y peluquería en MICAN. Elegí un servicio y sacá turno online.',
}

// Catálogo navegable de servicios: /servicios y /servicios?especie=Gatos
// Server Component: el filtro es un enlace (query param), así funciona sin JavaScript
// y cada filtro tiene su propia URL para compartir.
export default async function Servicios({ searchParams }) {
  const { especie } = await searchParams
  const elegida = ESPECIES_DEL_CATALOGO.includes(especie) ? especie : null
  const servicios = filtrarServicios(await obtenerServicios(), elegida)

  return (
    <div className="catalogo">
      <div className="catalogo-ancho">
        <header className="catalogo-encabezado">
          <p className="catalogo-eyebrow">Servicios</p>
          <h1>Todo lo que tu mascota necesita</h1>
          <p>Elegí un servicio para ver qué incluye y sacar turno online.</p>
        </header>

        <nav className="catalogo-filtros" aria-label="Filtrar por especie">
          <Link href="/servicios" className={!elegida ? 'activo' : undefined} aria-current={!elegida ? 'page' : undefined}>
            Todos
          </Link>
          {ESPECIES_DEL_CATALOGO.map((e) => (
            <Link key={e} href={`/servicios?especie=${e}`} className={elegida === e ? 'activo' : undefined}
              aria-current={elegida === e ? 'page' : undefined}>
              {e}
            </Link>
          ))}
        </nav>

        {servicios.length === 0
          ? <p className="catalogo-vacio">No hay servicios para esa especie. Consultanos y te orientamos.</p>
          : (
            <ul className="catalogo-lista">
              {servicios.map((s) => (
                <li key={s.id}>
                  <Link href={`/servicios/${s.id}`} className="catalogo-tarjeta">
                    <div className="catalogo-foto">
                      {FOTOS_DE_SERVICIOS[s.id] && (
                        <Image src={FOTOS_DE_SERVICIOS[s.id].foto} alt="" fill sizes="(max-width: 700px) 100vw, 50vw"
                          style={{ objectPosition: FOTOS_DE_SERVICIOS[s.id].posicion }} />
                      )}
                    </div>
                    <div className="catalogo-texto">
                      <h2><Icono nombre={s.icono} size={24} /> {s.nombre}</h2>
                      <p>{s.resumen}</p>
                      <span className="catalogo-ver">Ver el servicio <Icono nombre="flecha" size={18} /></span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
      </div>
    </div>
  )
}
