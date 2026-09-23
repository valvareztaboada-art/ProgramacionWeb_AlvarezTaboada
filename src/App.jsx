import { Routes, Route } from 'react-router-dom'

import PublicLayout from './layouts/PublicLayout.jsx'
import PanelLayout from './layouts/PanelLayout.jsx'

import Home from './pages/publico/Home.jsx'
import Login from './pages/publico/Login.jsx'
import NotFound from './pages/publico/NotFound.jsx'

import ClienteInicio from './pages/cliente/ClienteInicio.jsx'
import MisMascotas from './pages/cliente/MisMascotas.jsx'
import MisTurnos from './pages/cliente/MisTurnos.jsx'
import Vacunas from './pages/cliente/Vacunas.jsx'
import MisEstudios from './pages/cliente/MisEstudios.jsx'
import MisPagos from './pages/cliente/MisPagos.jsx'

import VetInicio from './pages/veterinaria/VetInicio.jsx'
import Pacientes from './pages/veterinaria/Pacientes.jsx'
import Agenda from './pages/veterinaria/Agenda.jsx'
import Estudios from './pages/veterinaria/Estudios.jsx'
import Cobros from './pages/veterinaria/Cobros.jsx'

// Menús laterales de cada interfaz
const menuCliente = [
  { to: '/cliente', label: 'Inicio', icon: 'inicio', end: true },
  { to: '/cliente/mascotas', label: 'Mis mascotas', icon: 'huella' },
  { to: '/cliente/turnos', label: 'Turnos', icon: 'calendario' },
  { to: '/cliente/vacunas', label: 'Vacunas', icon: 'jeringa' },
  { to: '/cliente/estudios', label: 'Estudios', icon: 'documento' },
  { to: '/cliente/pagos', label: 'Pagos', icon: 'tarjeta' },
]

const menuVeterinaria = [
  { to: '/veterinaria', label: 'Panel', icon: 'grafico', end: true },
  { to: '/veterinaria/pacientes', label: 'Pacientes', icon: 'huella' },
  { to: '/veterinaria/agenda', label: 'Agenda', icon: 'calendario' },
  { to: '/veterinaria/estudios', label: 'Estudios', icon: 'tubo' },
  { to: '/veterinaria/cobros', label: 'Cobros', icon: 'dinero' },
]

function App() {
  return (
    <Routes>
      {/* Sitio público */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Interfaz del dueño de la mascota */}
      <Route
        path="/cliente"
        element={<PanelLayout titulo="Mi cuenta" rol="cliente" menu={menuCliente} />}
      >
        <Route index element={<ClienteInicio />} />
        <Route path="mascotas" element={<MisMascotas />} />
        <Route path="turnos" element={<MisTurnos />} />
        <Route path="vacunas" element={<Vacunas />} />
        <Route path="estudios" element={<MisEstudios />} />
        <Route path="pagos" element={<MisPagos />} />
      </Route>

      {/* Interfaz de la veterinaria */}
      <Route
        path="/veterinaria"
        element={<PanelLayout titulo="Veterinaria" rol="veterinaria" menu={menuVeterinaria} />}
      >
        <Route index element={<VetInicio />} />
        <Route path="pacientes" element={<Pacientes />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="estudios" element={<Estudios />} />
        <Route path="cobros" element={<Cobros />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
