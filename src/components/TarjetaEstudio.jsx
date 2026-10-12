import Link from 'next/link'
import Icono from './Icono'
import { formatearTamanio, esImagen } from '@/lib/archivos'

const formatoFecha = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })

// Un estudio: título, fecha, comentarios y el botón para abrir el archivo.
// La usan el cliente (solo lectura) y la veterinaria (con el botón Editar).
function TarjetaEstudio({ estudio, mostrarMascota = false, esVeterinaria = false, volver = '' }) {
  const fecha = formatoFecha.format(new Date(`${estudio.fecha}T00:00`))
  const editar = `/veterinaria/estudios/${estudio.id}/editar${volver ? `?volver=${encodeURIComponent(volver)}` : ''}`

  return (
    <li className="card estudio">
      <div className="estudio-encabezado">
        <div>
          <strong className="estudio-titulo">{estudio.titulo}</strong>
          <p className="texto-suave">
            {mostrarMascota && <>{estudio.mascota} · </>}{fecha}
          </p>
        </div>
        <div className="estudio-acciones">
          {estudio.archivoUrl && (
            <a href={estudio.archivoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-chico btn-secundario"
              aria-label={`Ver el archivo de ${estudio.titulo} (se abre en otra pestaña)`}>
              <Icono nombre="documento" size={18} />
              {esImagen(estudio.archivo_tipo) ? 'Ver imagen' : 'Ver PDF'}
              {estudio.archivo_tamanio && <span className="estudio-peso">{formatearTamanio(estudio.archivo_tamanio)}</span>}
            </a>
          )}
          {esVeterinaria && (
            <Link href={editar} className="btn btn-chico btn-secundario" aria-label={`Editar ${estudio.titulo}`}>
              Editar
            </Link>
          )}
        </div>
      </div>
      {estudio.comentarios
        ? <p className="estudio-comentarios">{estudio.comentarios}</p>
        : <p className="texto-suave estudio-comentarios">Sin comentarios.</p>}
    </li>
  )
}

export default TarjetaEstudio
