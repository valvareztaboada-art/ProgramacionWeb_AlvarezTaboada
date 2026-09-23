import Icono from './Icono.jsx'

function StatCard({ icono, valor, label }) {
  return (
    <div className="card stat-card">
      <span className="stat-icono">
        <Icono nombre={icono} size={26} />
      </span>
      <div>
        <p className="stat-valor">{valor}</p>
        <p className="texto-suave">{label}</p>
      </div>
    </div>
  )
}

export default StatCard
