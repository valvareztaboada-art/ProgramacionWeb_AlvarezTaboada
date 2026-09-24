'use client'

// Client Component: el buscador necesita useState y el evento onChange.
// Los datos NO se buscan acá: los trae la página (Server Component) y llegan por props.

import { useState } from 'react'
import Link from 'next/link'

function TablaPacientes({ pacientes }) {
  const [busqueda, setBusqueda] = useState('')

  const texto = busqueda.toLowerCase()
  const filtrados = pacientes.filter(
    (p) => p.nombre.toLowerCase().includes(texto) || p.duenio.toLowerCase().includes(texto),
  )

  return (
    <>
      <label className="buscador">
        <span className="visualmente-oculto">Buscar paciente</span>
        <input
          type="search"
          placeholder="Buscar por mascota o dueño/a…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </label>

      <div className="tabla-contenedor">
        <table className="tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Especie</th>
              <th>Raza</th>
              <th>Edad</th>
              <th>Dueño/a</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/veterinaria/pacientes/${p.id}`} className="enlace">{p.nombre}</Link>
                </td>
                <td>{p.especie}</td>
                <td>{p.raza}</td>
                <td>{p.edad}</td>
                <td>{p.duenio}</td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={5} className="texto-suave">No hay pacientes que coincidan con “{busqueda}”.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default TablaPacientes
