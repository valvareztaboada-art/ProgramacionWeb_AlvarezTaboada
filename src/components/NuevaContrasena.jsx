'use client'

// Client Component: decide qué mostrar en /nueva-contrasena.
// El email por defecto de Supabase vuelve con la sesión de recuperación en la parte "#…" del enlace
// (#access_token=…&refresh_token=…&type=recovery, o #error=… si venció). Esa parte NO llega al
// servidor: solo se puede leer acá, en el navegador. Se lee una vez y se borra de la barra de
// direcciones (así no queda en el historial). Se usa recién al tocar "Guardar".

import { useEffect, useState } from 'react'
import Link from 'next/link'
import FormularioContrasena from './FormularioContrasena'
import { leerEnlaceDelHash } from '@/lib/recuperacion'

// enlaceDelServidor: si el enlace vino en la URL (?token_hash o ?code) · email: si ya hay sesión
function NuevaContrasena({ enlaceDelServidor, email, destino }) {
  const [estado, setEstado] = useState({ revisando: true })

  useEffect(() => {
    const delHash = leerEnlaceDelHash(window.location.hash)
    if (window.location.hash) window.history.replaceState(null, '', window.location.pathname)
    // Sincroniza con algo externo a React (la dirección del navegador): corresponde un efecto
    // oxlint-disable-next-line react/set-state-in-effect
    setEstado(delHash ?? (enlaceDelServidor ? { enlace: enlaceDelServidor } : email ? { conSesion: true } : { vencido: true }))
  }, [enlaceDelServidor, email])

  if (estado.revisando) return <p className="texto-suave login-intro" role="status">Revisando el enlace…</p>

  if (estado.vencido) {
    return (
      <p className="login-intro">
        El enlace venció o ya se usó (cada enlace sirve una sola vez y dura una hora).{' '}
        <Link href="/recuperar" className="enlace">Pedí uno nuevo</Link>.
      </p>
    )
  }

  return (
    <>
      {estado.conSesion && <p className="texto-suave login-intro">Para la cuenta <strong>{email}</strong>.</p>}
      <FormularioContrasena enlace={estado.enlace ?? null} destino={destino} />
    </>
  )
}

export default NuevaContrasena
