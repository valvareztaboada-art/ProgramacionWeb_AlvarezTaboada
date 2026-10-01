'use client'

// Client Component: cierra la sesión de Supabase (borra las cookies) y vuelve al login.

import { useRouter } from 'next/navigation'
import { crearClienteNavegador } from '@/lib/supabase/navegador'

function BotonCerrarSesion({ children }) {
  const router = useRouter()

  async function cerrarSesion() {
    await crearClienteNavegador().auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button type="button" className="sidebar-salir" onClick={cerrarSesion}>
      {children}
    </button>
  )
}

export default BotonCerrarSesion
