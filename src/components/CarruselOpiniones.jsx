'use client'

// Client Component: muestra una opinión por vez y se cambia con las flechas o los puntos.
// Las fotos llegan como imágenes importadas (objetos con src, ancho, alto y blur),
// que se pueden pasar del servidor al cliente sin problema.

import { useState } from 'react'
import Image from 'next/image'

function CarruselOpiniones({ opiniones }) {
  const [actual, setActual] = useState(0)
  const opinion = opiniones[actual]

  function ir(indice) {
    setActual((indice + opiniones.length) % opiniones.length)
  }

  return (
    <div className="carrusel" aria-roledescription="carrusel" aria-label="Opiniones de ejemplo">
      <div className="carrusel-foto">
        <Image key={opinion.mascota} src={opinion.foto} alt={opinion.alt} fill sizes="230px" placeholder="blur" />
      </div>
      <div className="carrusel-cuerpo">
        <p className="portada-eyebrow carrusel-eyebrow">Lo que nos cuentan · opiniones de ejemplo</p>
        <blockquote aria-live="polite">
          <p>“{opinion.texto}”</p>
          <footer>{opinion.autor}, con {opinion.mascota} ({opinion.especie})</footer>
        </blockquote>
        <div className="carrusel-controles">
          <button type="button" className="carrusel-flecha" onClick={() => ir(actual - 1)} aria-label="Opinión anterior">←</button>
          <button type="button" className="carrusel-flecha" onClick={() => ir(actual + 1)} aria-label="Opinión siguiente">→</button>
          <div className="carrusel-puntos">
            {opiniones.map((o, i) => (
              <button key={o.mascota} type="button" onClick={() => ir(i)}
                aria-label={`Opinión ${i + 1} de ${opiniones.length}`} aria-current={i === actual} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CarruselOpiniones
