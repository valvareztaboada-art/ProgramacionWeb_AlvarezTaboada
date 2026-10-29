import PaginaPerfil from '@/components/PaginaPerfil'

export const metadata = { title: 'Mi perfil' }

// La misma página para las dos interfaces (el layout de la sección ya controla el rol)
export default function Perfil() {
  return <PaginaPerfil />
}
