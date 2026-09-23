// Ilustraciones de línea (estilo dibujado a mano).
// El trazo usa "currentColor", así que toman el color del CSS (propiedad color).
// --relleno: color de fondo de las figuras / --acento: detalles de color.

function Svg({ viewBox, className, children }) {
  return (
    <svg
      viewBox={viewBox}
      className={`ilustracion ${className ?? ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

const relleno = 'var(--relleno, #fffdf8)'
const acento = 'var(--acento, #f2a531)'

export function PerroSentado({ className }) {
  return (
    <Svg viewBox="0 0 120 140" className={className}>
      <path d="M84 114 Q102 112 104 94" />
      <path d="M46 56 Q34 82 38 112 Q39 125 50 125 L72 125 Q84 125 84 111 Q86 82 74 56" fill={relleno} />
      <path d="M53 90 Q52 108 52 125" />
      <path d="M67 90 Q68 108 68 125" />
      <path d="M44 60 Q60 70 76 60" />
      <circle cx="60" cy="68" r="3.5" fill={acento} />
      <path d="M38 38 Q38 16 60 16 Q82 16 82 38 Q82 57 60 58 Q38 57 38 38 Z" fill={relleno} />
      <path d="M43 23 Q28 19 26 36 Q25 49 34 51 Q41 49 41 40" fill={acento} />
      <path d="M77 23 Q92 19 94 36 Q95 49 86 51 Q79 49 79 40" fill={acento} />
      <circle cx="51" cy="36" r="2.6" fill="currentColor" stroke="none" />
      <circle cx="69" cy="36" r="2.6" fill="currentColor" stroke="none" />
      <ellipse cx="60" cy="45" rx="5" ry="3.5" fill="currentColor" />
      <path d="M60 48.5 Q60 53 55 54 M60 48.5 Q60 53 65 54" strokeWidth="2.4" />
    </Svg>
  )
}

export function GatoSentado({ className }) {
  return (
    <Svg viewBox="0 0 120 140" className={className}>
      <path d="M80 120 Q108 118 104 90 Q102 78 94 82" />
      <path d="M44 64 Q34 90 38 116 Q40 126 52 126 L70 126 Q82 126 82 114 Q84 88 74 64" fill={relleno} />
      <path d="M71 82 Q80 86 78 100 Q70 95 71 82 Z" fill={acento} />
      <path d="M53 96 L53 126 M66 96 L66 126" />
      <path d="M40 46 L38 20 L54 33 Q60 31 66 33 L82 20 L80 46 Q84 56 78 64 Q70 72 60 72 Q50 72 42 64 Q36 56 40 46 Z" fill={relleno} />
      <path d="M71 34 L79 27 L78 39 Z" fill={acento} strokeWidth="2" />
      <path d="M48 48 Q51 45 54 48 M66 48 Q69 45 72 48" strokeWidth="2.6" />
      <path d="M57.5 55 L62.5 55 L60 58 Z" fill="currentColor" strokeWidth="2" />
      <path d="M60 58 Q60 62 56 62 M60 58 Q60 62 64 62" strokeWidth="2.2" />
      <path d="M46 56 L32 53 M46 59.5 L33 62 M74 56 L88 53 M74 59.5 L87 62" strokeWidth="1.8" />
    </Svg>
  )
}

export function GatoDurmiendo({ className }) {
  return (
    <Svg viewBox="0 0 120 84" className={className}>
      <path d="M20 62 Q18 30 56 26 Q96 22 100 52 Q102 70 84 72 L34 72 Q22 72 20 62 Z" fill={relleno} />
      <path d="M62 29 Q78 27 86 37 Q72 43 62 29 Z" fill={acento} strokeWidth="2.4" />
      <path d="M99 56 Q108 78 80 78 L44 78" />
      <path d="M18 56 Q16 42 29 39 L27 26 L38 34 Q44 33 48 36 L57 28 L56 43 Q60 53 52 61 Q44 68 32 66 Q20 64 18 56 Z" fill={relleno} />
      <path d="M27 50 Q30 53 33 50 M41 50 Q44 53 47 50" strokeWidth="2.4" />
      <path d="M36.5 56 L40.5 56 L38.5 58.5 Z" fill="currentColor" strokeWidth="1.8" />
      <path d="M76 8 H84 L76 16 H84 M92 2 H97 L92 7 H97" strokeWidth="2.2" />
    </Svg>
  )
}

export function PerroCara({ className }) {
  return (
    <Svg viewBox="0 0 100 100" className={className}>
      <path d="M30 42 Q30 22 50 22 Q70 22 70 42 L70 58 Q70 78 50 78 Q30 78 30 58 Z" fill={relleno} />
      <path d="M33 30 Q18 27 16 46 Q15 59 24 61 Q31 59 31 49" fill={acento} />
      <path d="M67 30 Q82 27 84 46 Q85 59 76 61 Q69 59 69 49" fill={acento} />
      <circle cx="42" cy="46" r="2.6" fill="currentColor" stroke="none" />
      <circle cx="58" cy="46" r="2.6" fill="currentColor" stroke="none" />
      <ellipse cx="50" cy="57" rx="5" ry="3.5" fill="currentColor" />
      <path d="M50 60.5 Q50 65 45 66 M50 60.5 Q50 65 55 66" strokeWidth="2.4" />
    </Svg>
  )
}

export function GatoCara({ className }) {
  return (
    <Svg viewBox="0 0 100 100" className={className}>
      <path d="M30 46 L29 20 L46 34 Q50 33 54 34 L71 20 L70 46 Q74 56 70 66 Q62 80 50 80 Q38 80 30 66 Q26 56 30 46 Z" fill={relleno} />
      <path d="M62 33 L69 27 L68 39 Z" fill={acento} strokeWidth="2" />
      <path d="M38 52 Q42 48 46 52 M54 52 Q58 48 62 52" strokeWidth="2.6" />
      <path d="M47 59 L53 59 L50 62 Z" fill="currentColor" strokeWidth="2" />
      <path d="M50 62 Q50 66 46 67 M50 62 Q50 66 54 67" strokeWidth="2.2" />
      <path d="M36 61 L20 58 M36 64.5 L21 67 M64 61 L80 58 M64 64.5 L79 67" strokeWidth="1.8" />
    </Svg>
  )
}

export function Pajaro({ className }) {
  return (
    <Svg viewBox="0 0 100 100" className={className}>
      <path d="M46 80 L44 90 M56 79 L58 90" strokeWidth="2.4" />
      <path d="M28 70 Q22 40 50 32 Q70 28 74 50 Q78 72 56 80 Q36 84 28 70 Z" fill={relleno} />
      <path d="M73 43 L86 48 L73 53" fill={acento} />
      <path d="M36 56 Q50 48 60 64 Q46 72 36 56 Z" fill={acento} strokeWidth="2.4" />
      <circle cx="60" cy="45" r="2.6" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function Corazon({ className }) {
  return (
    <Svg viewBox="0 0 100 100" className={className}>
      <path d="M50 82 Q14 58 18 36 Q22 18 40 22 Q48 24 50 34 Q52 24 60 22 Q78 18 82 36 Q86 58 50 82 Z" fill={acento} />
    </Svg>
  )
}

// Elige la ilustración según la especie de la mascota
export function IlustracionMascota({ especie, className }) {
  if (especie === 'Gato') return <GatoCara className={className} />
  if (especie === 'Ave') return <Pajaro className={className} />
  return <PerroCara className={className} />
}
