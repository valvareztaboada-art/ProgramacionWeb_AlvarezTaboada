// Íconos de línea simples (24x24). Se usan en menús, tarjetas y botones.
const trazos = {
  inicio: (
    <>
      <path d="M3 11 12 3.5 21 11" />
      <path d="M5.5 9.5v11h13v-11" />
      <path d="M10 20.5v-5h4v5" />
    </>
  ),
  huella: (
    <>
      <path d="M12 12.5c-3.5 0-6 3.2-6 5.4 0 1.6 1.3 2.6 3 2.6 1.3 0 2-.6 3-.6s1.7.6 3 .6c1.7 0 3-1 3-2.6 0-2.2-2.5-5.4-6-5.4Z" />
      <circle cx="5" cy="10" r="1.8" />
      <circle cx="9" cy="5.5" r="1.8" />
      <circle cx="15" cy="5.5" r="1.8" />
      <circle cx="19" cy="10" r="1.8" />
    </>
  ),
  calendario: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  jeringa: (
    <>
      <path d="m18 3 3 3M19.5 4.5 15 9" />
      <path d="M16.5 7.5 8 16H5v-3l8.5-8.5z" />
      <path d="m5 16-2 2M9.5 9.5l2 2" />
    </>
  ),
  documento: (
    <>
      <path d="M6 2.5h8l5 5v14H6z" />
      <path d="M14 2.5v5h5M9 13h7M9 17h5" />
    </>
  ),
  tarjeta: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="3" />
      <path d="M2.5 10h19M6 15h4" />
    </>
  ),
  grafico: <path d="M3 21h18M7 21v-8M12 21V6M17 21v-5" />,
  dinero: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="3" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  estetoscopio: (
    <>
      <path d="M5 3v5a5 5 0 0 0 10 0V3" />
      <path d="M10 13v2a4 4 0 0 0 8 0v-3" />
      <circle cx="18" cy="10" r="2" />
    </>
  ),
  tubo: (
    <>
      <path d="M8.5 2.5h7M10 2.5V17a2 2 0 0 0 4 0V2.5" />
      <path d="M10 11h4" />
    </>
  ),
  tijera: (
    <>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M8.5 7.8 20 18M8.5 16.2 20 6" />
    </>
  ),
  corazon: <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z" />,
  mapa: (
    <>
      <path d="M12 21s-6.5-5.7-6.5-11a6.5 6.5 0 0 1 13 0c0 5.3-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  reloj: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  telefono: <path d="M5 3.5h3.5l1.5 4-2 1.3a11 11 0 0 0 5.2 5.2l1.3-2 4 1.5V17a2 2 0 0 1-2 2A15 15 0 0 1 3 5.5a2 2 0 0 1 2-2Z" />,
  salir: (
    <>
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
      <path d="M9 17l-5-5 5-5M4 12h11" />
    </>
  ),
  escudo: (
    <>
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  flecha: <path d="M5 12h14M13 6l6 6-6 6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  usuario: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  cerrar: <path d="M6 6l12 12M18 6 6 18" />,
}

function Icono({ nombre, size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {trazos[nombre]}
    </svg>
  )
}

export default Icono
