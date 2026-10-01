import { redirect } from 'next/navigation'
import PanelLayout from '@/components/PanelLayout'
import { obtenerUsuarioActual } from '@/lib/datos'

const menu = [
  { href: '/veterinaria', label: 'Panel', icono: 'grafico', exacto: true },
  { href: '/veterinaria/pacientes', label: 'Pacientes', icono: 'huella' },
  { href: '/veterinaria/agenda', label: 'Agenda', icono: 'calendario' },
  { href: '/veterinaria/estudios', label: 'Estudios', icono: 'tubo' },
  { href: '/veterinaria/cobros', label: 'Cobros', icono: 'dinero' },
]

// Layout de la interfaz de la veterinaria. Solo entra quien tiene rol "veterinaria".
// (Aunque alguien saltee esta pantalla, el RLS no le devolvería datos ajenos.)
export default async function VeterinariaLayout({ children }) {
  const usuario = await obtenerUsuarioActual()
  if (!usuario) redirect('/login')
  if (usuario.rol !== 'veterinaria') redirect('/cliente')

  return (
    <PanelLayout titulo="Veterinaria" rol="veterinaria" menu={menu} usuario={usuario}>
      {children}
    </PanelLayout>
  )
}
