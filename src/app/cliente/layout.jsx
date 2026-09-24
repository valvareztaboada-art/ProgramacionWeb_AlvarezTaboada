import PanelLayout from '@/components/PanelLayout'

const menu = [
  { href: '/cliente', label: 'Inicio', icono: 'inicio', exacto: true },
  { href: '/cliente/mascotas', label: 'Mis mascotas', icono: 'huella' },
  { href: '/cliente/turnos', label: 'Turnos', icono: 'calendario' },
  { href: '/cliente/vacunas', label: 'Vacunas', icono: 'jeringa' },
  { href: '/cliente/estudios', label: 'Estudios', icono: 'documento' },
  { href: '/cliente/pagos', label: 'Pagos', icono: 'tarjeta' },
]

// Layout de la interfaz del dueño: el menú lateral se comparte entre todas sus páginas
export default function ClienteLayout({ children }) {
  return (
    <PanelLayout titulo="Mi cuenta" rol="cliente" menu={menu}>
      {children}
    </PanelLayout>
  )
}
