'use client'

// Client Component: campo de email del dueño/a con sugerencias ("combobox" accesible).
//
//   · Mientras se escribe (nombre, email o mascota) muestra los dueños/as que ya existen.
//   · El botón ▾ despliega la lista completa.
//   · Teclado: ↓ ↑ para moverse, Enter para elegir, Escape para cerrar.
//   · Si el email no es de nadie, se toma como dueño/a NUEVO/A (se puede escribir libremente).
//   · Si se parece mucho a uno existente, pregunta "¿Quisiste decir…?" (error de tipeo).

import { useState } from 'react'
import { filtrarDuenios, emailParecido, normalizar } from '@/lib/duenios'

function SelectorDuenio({ id, duenios, valor, onCambiar, invalido }) {
  const [abierto, setAbierto] = useState(false)
  const [activo, setActivo] = useState(-1)

  const opciones = filtrarDuenios(duenios, valor)
  const elegido = duenios.find((d) => d.email === normalizar(valor))
  const parecido = elegido ? null : emailParecido(duenios, valor)
  const listaId = `${id}-opciones`
  const mostrarLista = abierto && opciones.length > 0

  function elegir(duenio) {
    onCambiar(duenio.email)
    setAbierto(false)
    setActivo(-1)
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setAbierto(true)
      setActivo((i) => Math.min(i + 1, opciones.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActivo((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && mostrarLista && activo >= 0) {
      e.preventDefault() // elige la opción en vez de enviar el formulario
      elegir(opciones[activo])
    } else if (e.key === 'Escape') {
      setAbierto(false)
    }
  }

  return (
    <div className="selector">
      <div className="selector-campo">
        <input
          id={id}
          name={id}
          type="email"
          role="combobox"
          autoComplete="off"
          placeholder="Buscá por nombre, email o mascota"
          aria-autocomplete="list"
          aria-expanded={mostrarLista}
          aria-controls={listaId}
          aria-activedescendant={mostrarLista && activo >= 0 ? `${listaId}-${activo}` : undefined}
          aria-invalid={invalido}
          aria-describedby={`${id}-mensaje ${id}-estado`}
          value={valor}
          onChange={(e) => { onCambiar(e.target.value); setAbierto(true); setActivo(-1) }}
          onFocus={() => setAbierto(true)}
          onBlur={() => setAbierto(false)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          className="selector-desplegar"
          tabIndex={-1}
          aria-label={mostrarLista ? 'Cerrar la lista de dueños' : 'Ver todos los dueños'}
          onMouseDown={(e) => e.preventDefault()} // no le saca el foco al campo
          onClick={() => { setAbierto(!abierto); document.getElementById(id)?.focus() }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {mostrarLista && (
        <div id={listaId} role="listbox" className="selector-lista" aria-label="Dueños/as conocidos">
          {opciones.map((d, i) => (
            // El teclado se maneja desde el campo (patrón combobox): la opción solo responde al mouse
            // oxlint-disable-next-line jsx-a11y/click-events-have-key-events
            <div
              tabIndex={-1}
              key={d.email}
              id={`${listaId}-${i}`}
              role="option"
              aria-selected={i === activo}
              className={i === activo ? 'activo' : ''}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActivo(i)}
              onClick={() => elegir(d)}
            >
              <strong>{d.nombre ?? d.email}</strong>
              <span>
                {d.nombre ? d.email : 'todavía sin cuenta'}
                {d.mascotas.length > 0 && ` · ${d.mascotas.join(', ')}`}
              </span>
            </div>
          ))}
        </div>
      )}

      <div id={`${id}-estado`} aria-live="polite">
        {elegido && (
          <p className="selector-estado selector-elegido">
            ✓ {elegido.nombre ?? 'Dueño/a sin cuenta'}
            {elegido.registrado ? ' · ya tiene cuenta' : ' · todavía no se registró'}
            {elegido.mascotas.length > 0 && ` · ${elegido.mascotas.length} mascota${elegido.mascotas.length === 1 ? '' : 's'}`}
          </p>
        )}
        {parecido && (
          <p className="selector-estado selector-parecido">
            ¿Quisiste decir{' '}
            <button type="button" className="boton-enlace" onClick={() => elegir(parecido)}>{parecido.email}</button>
            {parecido.nombre && ` (${parecido.nombre})`}?
          </p>
        )}
      </div>
    </div>
  )
}

export default SelectorDuenio
