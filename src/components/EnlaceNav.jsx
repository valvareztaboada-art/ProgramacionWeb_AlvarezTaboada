'use client'

// Client Component: necesita usePathname (un hook) para saber en qué página estamos
// y marcar el enlace activo. Es una "hoja" del árbol: el contenido (ícono y texto)
// llega desde el servidor como children, así no importamos nada del servidor acá.

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function EnlaceNav({ href, exacto = false, className = '', children }) {
  const pathname = usePathname()
  const activo = exacto ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={`${className} ${activo ? 'active' : ''}`.trim()}
      aria-current={activo ? 'page' : undefined}
    >
      {children}
    </Link>
  )
}

export default EnlaceNav
