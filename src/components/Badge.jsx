// Etiqueta de color según el estado.
// Recibe el estado como viene de la base ("pendiente", "ausente"...) o un texto ("Sin registrar").
function Badge({ estado }) {
  const clase = estado.toLowerCase().replaceAll(' ', '-')
  const legible = estado.replaceAll('_', ' ')
  const texto = legible.charAt(0).toUpperCase() + legible.slice(1)
  return <span className={`badge badge-${clase}`}>{texto}</span>
}

export default Badge
