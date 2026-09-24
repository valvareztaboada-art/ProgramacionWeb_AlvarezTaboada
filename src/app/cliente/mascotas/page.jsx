import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import { formatearEdad } from '@/lib/formato'
import { IlustracionMascota } from '@/components/ilustraciones/Ilustraciones'
import { CLIENTE_ACTUAL, obtenerMascotas } from '@/lib/datos'

export const metadata = { title: 'Mis mascotas' }

export default async function MisMascotas() {
  const mascotas = await obtenerMascotas({ emailDuenio: CLIENTE_ACTUAL.email })

  return (
    <>
      <PageHeader titulo="Mis mascotas" descripcion="Tocá una mascota para ver su ficha completa." />
      <div className="grid-cards">
        {mascotas.map((m) => (
          <Link key={m.id} href={`/cliente/mascotas/${m.id}`} className="card card-mascota">
            <IlustracionMascota especie={m.especie} className="card-mascota-ilustracion" />
            <h3>{m.nombre}</h3>
            <p className="texto-suave">{m.raza} · {formatearEdad(m.edad)}</p>
          </Link>
        ))}
      </div>
    </>
  )
}
