// Etiqueta de color según el estado.
// Recibe el estado como viene de la base ("pendiente", "ausente"...) o un texto ("Sin registrar").
function Badge({ estado }) {
  const clase = estado.toLowerCase().replaceAll(' ', '-')
  const texto = estado.charAt(0).toUpperCase() + estado.slice(1)
  return <span className={`badge badge-${clase}`}>{texto}</span>
}

export default Badge
