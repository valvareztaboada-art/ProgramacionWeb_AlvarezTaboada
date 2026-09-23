function PageHeader({ titulo, descripcion, children }) {
  return (
    <div className="page-header">
      <div>
        <h1>{titulo}</h1>
        {descripcion && <p className="texto-suave">{descripcion}</p>}
      </div>
      {children}
    </div>
  )
}

export default PageHeader
