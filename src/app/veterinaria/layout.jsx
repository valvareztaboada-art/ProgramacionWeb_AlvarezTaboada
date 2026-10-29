import { forbidden, redirect } from 'next/navigation'
import PanelLayout from '@/components/PanelLayout'
import { obtenerUsuarioActual, obtenerVacunas } from '@/lib/datos'
import { vacunasAVencer } from '@/lib/vacunas'
import { hoyISO } from '@/lib/horarios'

const menu = [
  { href: '/veterinaria', label: 'Panel', icono: 'grafico', exacto: true },
  { href: '/veterinaria/pacientes', label: 'Pacientes', icono: 'huella' },
  { href: '/veterinaria/agenda', label: 'Agenda', icono: 'calendario' },
  { href: '/veterinaria/vacunas', label: 'Vacunas', icono: 'jeringa' },
  { href: '/veterinaria/estudios', label: 'Estudios', icono: 'tubo' },
  { href: '/veterinaria/cobros', label: 'Cobros', icono: 'dinero' },
  { href: '/veterinaria/perfil', label: 'Mi perfil', icono: 'usuario' },
]

// Layout de la interfaz de la veterinaria. Solo entra quien tiene rol "veterinaria" (RBAC):
// sin sesión → login (no está autenticado) · otro rol → 403 (autenticado, pero sin permiso).
// (Aunque alguien saltee esta pantalla, el RLS no le devolvería datos ajenos.)
export default async function VeterinariaLayout({ children }) {
  const usuario = await obtenerUsuarioActual()
  if (!usuario) redirect('/login')
  if (usuario.rol !== 'veterinaria') forbidden()

  // Si hay vacunas a vencer sin avisar, "Vacunas" muestra un aviso en el menú
  const porAvisar = vacunasAVencer(await obtenerVacunas(), hoyISO()).length
  const menuConAvisos = menu.map((item) =>
    item.href === '/veterinaria/vacunas' && porAvisar > 0
      ? { ...item, alerta: `${porAvisar} ${porAvisar === 1 ? 'vacuna' : 'vacunas'} por avisar` }
      : item)

  return (
    <PanelLayout titulo="Veterinaria" rol="veterinaria" menu={menuConAvisos} usuario={usuario}>
      {children}
    </PanelLayout>
  )
}
