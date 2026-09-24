import PanelLayout from '@/components/PanelLayout'

const menu = [
  { href: '/veterinaria', label: 'Panel', icono: 'grafico', exacto: true },
  { href: '/veterinaria/pacientes', label: 'Pacientes', icono: 'huella' },
  { href: '/veterinaria/agenda', label: 'Agenda', icono: 'calendario' },
  { href: '/veterinaria/estudios', label: 'Estudios', icono: 'tubo' },
  { href: '/veterinaria/cobros', label: 'Cobros', icono: 'dinero' },
]

// Layout de la interfaz de la veterinaria
export default function VeterinariaLayout({ children }) {
  return (
    <PanelLayout titulo="Veterinaria" rol="veterinaria" menu={menu}>
      {children}
    </PanelLayout>
  )
}
