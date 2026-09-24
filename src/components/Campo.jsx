// Campo de formulario: etiqueta + input (children) + mensaje de error o de ayuda.
// No usa hooks: lo usan los formularios (Client Components) para no repetir código.
// El input tiene que tener aria-describedby={`${id}-mensaje`} para que el lector
// de pantalla lea el mensaje de error o de ayuda.
function Campo({ id, label, error, ayuda, children }) {
  return (
    <div className="campo">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <p id={`${id}-mensaje`} className="campo-error">{error}</p>}
      {!error && ayuda && <p id={`${id}-mensaje`} className="campo-ayuda">{ayuda}</p>}
    </div>
  )
}

export default Campo
