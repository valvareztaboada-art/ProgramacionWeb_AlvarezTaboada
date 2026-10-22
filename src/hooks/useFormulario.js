// Hook propio (custom hook) que comparten todos los formularios.
//
// Cómo funciona la validación:
//  · Antes de tocar "Enviar" no se muestra ningún error (no retamos a nadie mientras completa).
//  · Al tocar "Enviar" se valida todo y, si hay errores, el foco va al primer campo con problemas.
//  · Desde ese momento los errores se recalculan MIENTRAS escribe: apenas corrige un campo,
//    el mensaje desaparece (y si lo vuelve a romper, aparece).
//
// Los errores no se guardan en un estado aparte: se CALCULAN a partir de los datos en cada render.
// Así nunca quedan desactualizados.
//
// Además, si la API responde 400 con errores por campo (validación del servidor),
// se muestran con mostrarErroresDelServidor() y cada uno se borra cuando se edita ese campo.

import { useState } from 'react'

export function useFormulario(valoresIniciales, validar) {
  const [datos, setDatos] = useState(valoresIniciales)
  const [intentoEnviar, setIntentoEnviar] = useState(false)
  const [erroresDelServidor, setErroresDelServidor] = useState({})

  // Los del navegador tienen prioridad: son los que se actualizan mientras escribe
  const errores = intentoEnviar ? { ...erroresDelServidor, ...validar(datos) } : {}

  function olvidarErroresDelServidor(campos) {
    setErroresDelServidor((anteriores) => {
      const quedan = { ...anteriores }
      campos.forEach((campo) => delete quedan[campo])
      return quedan
    })
  }

  // Un solo handler para todos los inputs: usa el "name" del input
  function handleChange(e) {
    const { name, value } = e.target
    setDatos((anteriores) => ({ ...anteriores, [name]: value }))
    olvidarErroresDelServidor([name])
  }

  // Para cambiar varios campos a la vez (ej: al cambiar el día, se borra el horario)
  function cambiar(nuevosValores) {
    setDatos((anteriores) => ({ ...anteriores, ...nuevosValores }))
    olvidarErroresDelServidor(Object.keys(nuevosValores))
  }

  // detalles: { campo: 'mensaje' } tal como los devuelve la API con un 400
  function mostrarErroresDelServidor(detalles = {}) {
    setIntentoEnviar(true)
    setErroresDelServidor(detalles)
    const [primero] = Object.keys(detalles)
    if (primero) document.querySelector(`[name="${primero}"]`)?.focus()
  }

  // Se llama al enviar. Devuelve true si el formulario está bien.
  function validarAlEnviar() {
    setIntentoEnviar(true)
    const erroresActuales = validar(datos)
    const campos = Object.keys(erroresActuales)

    if (campos.length > 0) {
      // Lleva el foco (y la pantalla) al primer campo con error
      document.querySelector(`[name="${campos[0]}"]`)?.focus()
      return false
    }
    return true
  }

  function reiniciar() {
    setDatos(valoresIniciales)
    setIntentoEnviar(false)
    setErroresDelServidor({})
  }

  return { datos, errores, handleChange, cambiar, validarAlEnviar, reiniciar, mostrarErroresDelServidor }
}
