import { Fredoka, Nunito } from 'next/font/google'
import './globals.css'

// next/font descarga las tipografías en el build y las sirve desde nuestro dominio
const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-fredoka',
})

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-nunito',
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
    <html lang="es" className={`${fredoka.variable} ${nunito.variable}`}>
      <body>{children}</body>
    </html>
  )
}
