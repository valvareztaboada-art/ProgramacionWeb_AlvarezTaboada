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

import { useState } from 'react'

export function useFormulario(valoresIniciales, validar) {
  const [datos, setDatos] = useState(valoresIniciales)
  const [intentoEnviar, setIntentoEnviar] = useState(false)

  const errores = intentoEnviar ? validar(datos) : {}

  // Un solo handler para todos los inputs: usa el "name" del input
  function handleChange(e) {
    const { name, value } = e.target
    setDatos((anteriores) => ({ ...anteriores, [name]: value }))
  }

  // Para cambiar varios campos a la vez (ej: al cambiar el día, se borra el horario)
  function cambiar(nuevosValores) {
    setDatos((anteriores) => ({ ...anteriores, ...nuevosValores }))
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
  }

  return { datos, errores, handleChange, cambiar, validarAlEnviar, reiniciar }
}
