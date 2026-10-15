// Indicador visual de fortaleza de la contraseña (lo pide la clase de seguridad).
// Muestra una barra de 5 partes y la lista de requisitos, que se van tildando mientras se escribe.
// No usa hooks: lo dibuja el formulario de registro con la contraseña actual.

import { evaluarContrasena } from '@/lib/contrasena'

const ETIQUETAS = {
  vacia: 'Escribí una contraseña',
  debil: 'Débil',
  media: 'Buena',
  fuerte: 'Muy buena',
}

function MedidorContrasena({ contrasena }) {
  const { requisitos, cumplidos, total, nivel, esComun } = evaluarContrasena(contrasena)

  return (
    <div className={`medidor medidor-${nivel}`}>
      <div className="medidor-barra" aria-hidden="true">
        {requisitos.map((r, i) => <span key={r.id} className={i < cumplidos ? 'lleno' : ''} />)}
      </div>
      {/* aria-live: el lector de pantalla anuncia el cambio de nivel mientras se escribe */}
      <p className="medidor-nivel" aria-live="polite">
        Seguridad: <strong>{ETIQUETAS[nivel]}</strong>
        <span className="visualmente-oculto"> ({cumplidos} de {total} requisitos)</span>
      </p>
      <ul className="medidor-requisitos">
        {requisitos.map((r) => (
          <li key={r.id} className={r.cumple ? 'cumple' : ''}>
            <span aria-hidden="true">{r.cumple ? '✓' : '·'}</span> {r.texto}
            <span className="visualmente-oculto">{r.cumple ? ' (cumplido)' : ' (falta)'}</span>
          </li>
        ))}
        {esComun && <li className="comun">Evitá palabras obvias como &ldquo;password&rdquo; o &ldquo;mican&rdquo;</li>}
      </ul>
    </div>
  )
}

export default MedidorContrasena
