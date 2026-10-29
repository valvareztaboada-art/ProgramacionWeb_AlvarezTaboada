import PageHeader from './PageHeader'
import FormularioPerfil from './FormularioPerfil'
import FormularioContrasena from './FormularioContrasena'
import { obtenerPerfil } from '@/lib/datos'

// Server Component: "Mi perfil", igual para el cliente y la veterinaria
// (/cliente/perfil y /veterinaria/perfil). Cada uno ve y modifica solo lo suyo (RLS).
async function PaginaPerfil() {
  const perfil = await obtenerPerfil()

  return (
    <>
      <PageHeader titulo="Mi perfil" descripcion="Tus datos y tu contraseña." />

      <section className="card form-card" aria-labelledby="titulo-datos">
        <h2 id="titulo-datos">Mis datos</h2>
        <FormularioPerfil perfil={perfil} />
      </section>

      <section className="card form-card" aria-labelledby="titulo-contrasena">
        <h2 id="titulo-contrasena">Cambiar la contraseña</h2>
        <FormularioContrasena />
      </section>
    </>
  )
}

export default PaginaPerfil
