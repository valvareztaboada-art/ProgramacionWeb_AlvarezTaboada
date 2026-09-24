// Etiqueta de color según el estado (Pendiente, Confirmado, Pagado, Sin registrar...)
function Badge({ estado }) {
  const clase = estado.toLowerCase().replaceAll(' ', '-')
  return <span className={`badge badge-${clase}`}>{estado}</span>
}

export default Badge
