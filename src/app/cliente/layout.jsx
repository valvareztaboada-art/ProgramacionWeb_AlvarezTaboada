import { headers } from 'next/headers'
import { forbidden, redirect } from 'next/navigation'
import PanelLayout from '@/components/PanelLayout'
import { obtenerUsuarioActual, obtenerVacunas } from '@/lib/datos'
import { hayVacunasParaAtender } from '@/lib/vacunas'
import { hoyISO } from '@/lib/horarios'
import { pantallaDeVeterinaria } from '@/lib/destino'

const menu = [
  { href: '/cliente', label: 'Inicio', icono: 'inicio', exacto: true },
  { href: '/cliente/mascotas', label: 'Mis mascotas', icono: 'huella' },
  { href: '/cliente/turnos', label: 'Turnos', icono: 'calendario' },
  { href: '/cliente/vacunas', label: 'Vacunas', icono: 'jeringa' },
  { href: '/cliente/estudios', label: 'Estudios', icono: 'documento' },
  { href: '/cliente/pagos', label: 'Pagos', icono: 'tarjeta' },
  { href: '/cliente/perfil', label: 'Mi perfil', icono: 'usuario' },
]

// Layout de la interfaz del dueño. Controla quién puede entrar (RBAC):
// sin sesión → login (no está autenticado).
// La veterinaria va directo a su pantalla equivalente: la portada y el catálogo enlazan a
// pantallas de cliente ("Turnos", "Sacar turno") y a ella no le sirve ver un aviso.
export default async function ClienteLayout({ children }) {
  const usuario = await obtenerUsuarioActual()
  if (!usuario) redirect('/login')
  if (usuario.rol === 'veterinaria') redirect(pantallaDeVeterinaria((await headers()).get('x-mican-ruta')))
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
