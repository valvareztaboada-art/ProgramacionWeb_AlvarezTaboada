import { Bricolage_Grotesque, Figtree } from 'next/font/google'
import './globals.css'

// next/font descarga las tipografías en el build y las sirve desde nuestro dominio.
// Las dos son "variables": un solo archivo trae todos los grosores.
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  axes: ['opsz'], // tamaño óptico: los títulos grandes se dibujan más ajustados
  variable: '--font-bricolage',
})

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-figtree',
})

export const metadata = {
  title: {
    default: 'MICAN · Veterinaria',
    template: '%s · MICAN',
  },
  description: 'Veterinaria MICAN: turnos, historia clínica, vacunas, estudios y pagos en un solo lugar.',
}

// Layout raíz: envuelve TODAS las páginas del sitio
export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${bricolage.variable} ${figtree.variable}`}>
      <body>{children}</body>
    </html>
  )
}
