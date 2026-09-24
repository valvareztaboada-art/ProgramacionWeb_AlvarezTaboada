'use client'

// Client Component: usa useState y eventos (onChange, onSubmit).
// Registro de maqueta: valida los datos pero todavía no guarda la cuenta.
// Cuando veamos Supabase Auth, en handleSubmit se crea el usuario de verdad.

import { useState } from 'react'
import Link from 'next/link'
import Campo from './Campo'
import { validarRegistro } from '@/lib/validaciones'

const VACIO = { nombre: '', email: '', telefono: '', password: '', confirmar: '' }

function FormularioRegistro() {
  const [datos, setDatos] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const [enviado, setEnviado] = useState(false)

  // Un solo handler para todos los inputs: usa el "name" del input
  function handleChange(e) {
    setDatos({ ...datos, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    const nuevosErrores = validarRegistro(datos)
    setErrores(nuevosErrores)

    if (Object.keys(nuevosErrores).length === 0) {
      // TODO (Supabase Auth): crear el usuario con datos.email y datos.password
      setEnviado(true)
    }
  }

  if (enviado) {
    return (
      <div className="form-exito" role="status">
        <h2>¡Bienvenido/a, {datos.nombre.split(' ')[0]}!</h2>
        <p>
          Tu cuenta quedó creada con <strong>{datos.email}</strong>. Si la veterinaria ya
          cargó a tu mascota con este email, la vas a encontrar en tu cuenta.
        </p>
        <Link href="/cliente" className="btn btn-primario">Ir a mi cuenta</Link>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <Campo id="nombre" label="Nombre y apellido" error={errores.nombre}>
        <input id="nombre" name="nombre" type="text" autoComplete="name"
          value={datos.nombre} onChange={handleChange}
          aria-invalid={Boolean(errores.nombre)} aria-describedby="nombre-mensaje" />
      </Campo>

      <Campo id="email" label="Email" error={errores.email}
        ayuda="Usá el mismo email que le diste a la veterinaria.">
        <input id="email" name="email" type="email" autoComplete="email" placeholder="tu@email.com"
          value={datos.email} onChange={handleChange}
          aria-invalid={Boolean(errores.email)} aria-describedby="email-mensaje" />
      </Campo>

      <Campo id="telefono" label="Teléfono (opcional)">
        <input id="telefono" name="telefono" type="tel" autoComplete="tel"
          value={datos.telefono} onChange={handleChange} />
      </Campo>

      <Campo id="password" label="Contraseña" error={errores.password} ayuda="Mínimo 8 caracteres.">
        <input id="password" name="password" type="password" autoComplete="new-password"
          value={datos.password} onChange={handleChange}
          aria-invalid={Boolean(errores.password)} aria-describedby="password-mensaje" />
      </Campo>

      <Campo id="confirmar" label="Repetí la contraseña" error={errores.confirmar}>
        <input id="confirmar" name="confirmar" type="password" autoComplete="new-password"
          value={datos.confirmar} onChange={handleChange}
          aria-invalid={Boolean(errores.confirmar)} aria-describedby="confirmar-mensaje" />
      </Campo>

      <button type="submit" className="btn btn-primario">Crear cuenta</button>
    </form>
  )
}

export default FormularioRegistro
