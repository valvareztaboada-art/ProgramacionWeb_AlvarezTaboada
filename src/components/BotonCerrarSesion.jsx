'use client'

// Client Component: cierra la sesión de Supabase (borra las cookies) y vuelve al login.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearClienteNavegador } from '@/lib/supabase/navegador'

function BotonCerrarSesion({ children }) {
  const [cargando, setCargando] = useState(false)
  const router = useRouter()

  async function cerrarSesion() {
    setCargando(true)
    try {
      // scope 'local': cierra la sesión en este navegador aunque no haya conexión
      await crearClienteNavegador().auth.signOut({ scope: 'local' })
    } finally {
      router.push('/login')
      router.refresh()
    }
  }

  return (
    <button type="button" className="sidebar-salir" onClick={cerrarSesion} disabled={cargando}>
      {children}
    </button>
  )
}

export default BotonCerrarSesion
