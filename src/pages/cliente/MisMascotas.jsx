import PageHeader from '../../components/PageHeader.jsx'
import { IlustracionMascota } from '../../components/ilustraciones/Ilustraciones.jsx'
import { mascotas, clienteActual } from '../../data/mockData.js'

function MisMascotas() {
  const misMascotas = mascotas.filter((m) => m.duenio === clienteActual)

  return (
    <>
      <PageHeader titulo="Mis mascotas" descripcion="Ficha e historia clínica de cada una." />
      <div className="grid-cards">
        {misMascotas.map((m) => (
          <article key={m.id} className="card card-mascota">
            <IlustracionMascota especie={m.especie} className="card-mascota-ilustracion" />
            <h3>{m.nombre}</h3>
            <p className="texto-suave">{m.raza} · {m.edad} años</p>
          </article>
        ))}
      </div>
    </>
  )
}

export default MisMascotas
