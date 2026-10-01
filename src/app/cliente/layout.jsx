import { redirect } from 'next/navigation'
import PanelLayout from '@/components/PanelLayout'
import { obtenerUsuarioActual } from '@/lib/datos'

const menu = [
  { href: '/cliente', label: 'Inicio', icono: 'inicio', exacto: true },
  { href: '/cliente/mascotas', label: 'Mis mascotas', icono: 'huella' },
  { href: '/cliente/turnos', label: 'Turnos', icono: 'calendario' },
  { href: '/cliente/vacunas', label: 'Vacunas', icono: 'jeringa' },
  { href: '/cliente/estudios', label: 'Estudios', icono: 'documento' },
  { href: '/cliente/pagos', label: 'Pagos', icono: 'tarjeta' },
]

// Layout de la interfaz del dueño. Controla quién puede entrar:
// sin sesión → login · si es la veterinaria → a su panel
export default async function ClienteLayout({ children }) {
  const usuario = await obtenerUsuarioActual()
  if (!usuario) redirect('/login')
  if (usuario.rol === 'veterinaria') redirect('/veterinaria')

  return (
    <PanelLayout titulo="Mi cuenta" rol="cliente" menu={menu} usuario={usuario}>
      {children}
    </PanelLayout>
  )
}
