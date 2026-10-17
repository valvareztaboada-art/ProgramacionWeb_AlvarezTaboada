import { forbidden, redirect } from 'next/navigation'
import PanelLayout from '@/components/PanelLayout'
import { obtenerUsuarioActual, obtenerVacunas } from '@/lib/datos'
import { hayVacunasParaAtender } from '@/lib/vacunas'
import { hoyISO } from '@/lib/horarios'

const menu = [
  { href: '/cliente', label: 'Inicio', icono: 'inicio', exacto: true },
  { href: '/cliente/mascotas', label: 'Mis mascotas', icono: 'huella' },
  { href: '/cliente/turnos', label: 'Turnos', icono: 'calendario' },
  { href: '/cliente/vacunas', label: 'Vacunas', icono: 'jeringa' },
  { href: '/cliente/estudios', label: 'Estudios', icono: 'documento' },
  { href: '/cliente/pagos', label: 'Pagos', icono: 'tarjeta' },
]

// Layout de la interfaz del dueño. Controla quién puede entrar (RBAC):
// sin sesión → login (no está autenticado) · otro rol → 403 (autenticado, pero sin permiso)
export default async function ClienteLayout({ children }) {
  const usuario = await obtenerUsuarioActual()
  if (!usuario) redirect('/login')
  if (usuario.rol !== 'cliente') forbidden()

  // Si alguna vacuna vence en 30 días o menos (o ya venció), "Vacunas" muestra un aviso en el menú
  const alertaVacunas = hayVacunasParaAtender(await obtenerVacunas(), hoyISO())
  const menuConAvisos = menu.map((item) =>
    item.href === '/cliente/vacunas' && alertaVacunas ? { ...item, alerta: 'hay una vacuna próxima' } : item)

  return (
    <PanelLayout titulo="Mi cuenta" rol="cliente" menu={menuConAvisos} usuario={usuario}>
      {children}
    </PanelLayout>
  )
}
