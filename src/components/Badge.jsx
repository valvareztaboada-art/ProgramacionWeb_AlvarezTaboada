// Etiqueta de color según el estado (Pendiente, Confirmado, Pagado...)
function Badge({ estado }) {
  const clase = estado.toLowerCase()
  return <span className={`badge badge-${clase}`}>{estado}</span>
}

export default Badge
