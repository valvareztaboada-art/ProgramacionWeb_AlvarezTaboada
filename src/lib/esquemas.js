// Esquemas de validación del SERVIDOR (con Zod), para los Route Handlers de la API.
// "Nunca confiar en los datos del cliente": aunque el formulario ya valida en el navegador,
// cualquiera puede mandarle un pedido directo a la API. El esquema es el contrato:
// tipo de dato, largo mínimo/máximo, formato y obligatoriedad de cada campo.
// Los mensajes son los mismos que muestra el formulario (validaciones.js).
//
// Además, los textos se SANITIZAN: se les sacan etiquetas HTML y caracteres de control.

import { z } from 'zod'
import { errorDeFechaNacimiento, errorDeNombre, errorDeTelefono } from './validaciones.js'
import { hoyISO } from './horarios.js'
import { textoDeEdad } from './formato.js'

export const ESPECIES = ['Perro', 'Gato', 'Ave', 'Otro']

// Saca etiquetas HTML (<script>…), caracteres de control y espacios de más
export function sanitizar(texto) {
  return texto
    .replace(/<[^>]*>/g, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const textoLimpio = z.string({ error: 'Tiene que ser un texto.' }).transform(sanitizar)

// Un id de la URL (/api/v1/pacientes/12): solo números
export const esquemaId = z.string().regex(/^\d+$/, 'El identificador no es válido.').transform(Number)

const camposPaciente = {
  nombre: textoLimpio.pipe(z.string()
    .min(1, 'Ingresá el nombre de la mascota.')
    .max(40, 'El nombre puede tener hasta 40 caracteres.')),
  especie: z.enum(ESPECIES, { error: 'Elegí la especie.' }),
  raza: textoLimpio.pipe(z.string().max(40, 'La raza puede tener hasta 40 caracteres.'))
    .transform((r) => r || null)
    .nullish(),
  // "AAAA-MM-DD" o null. Misma regla que el formulario: no futura ni de hace más de 40 años.
  // "hoy" se calcula en cada pedido (en la hora de Argentina)
  fechaNacimiento: z.string({ error: 'Ingresá una fecha válida.' })
    .superRefine((fecha, contexto) => {
      const error = errorDeFechaNacimiento(fecha, hoyISO())
      if (error) contexto.addIssue({ code: 'custom', message: error })
    })
    .nullish(),
  emailDuenio: z.string({ error: 'Ingresá el email del dueño/a.' })
    .trim()
    .toLowerCase()
    .pipe(z.email('Ingresá un email válido (ej: nombre@mail.com).').max(254)),
}

// POST /api/v1/pacientes → todos los campos obligatorios salvo raza y fecha de nacimiento
// strict(): si mandan campos que no existen (ej: "id" o "rol"), se rechaza
export const esquemaNuevoPaciente = z.strictObject(camposPaciente)

// PATCH /api/v1/pacientes/:id → modificación PARCIAL: cada campo es opcional,
// pero tiene que venir al menos uno
export const esquemaCambiosPaciente = z.strictObject(camposPaciente).partial()
  .refine((cambios) => Object.keys(cambios).length > 0, { message: 'No hay cambios para guardar.' })

// GET /api/v1/pacientes?buscar=luna&especie=Perro → filtros opcionales (query params)
export const esquemaFiltroPacientes = z.object({
  // Solo letras, números, espacios y lo que aparece en un email: así el texto
  // no puede alterar el filtro de la consulta (ni comas, ni paréntesis, ni comillas)
  buscar: textoLimpio.pipe(z.string()
    .max(60, 'La búsqueda es demasiado larga.')
    .regex(/^[\p{L}\p{N} @._+-]*$/u, 'Buscá solo con letras, números o un email.')).optional(),
  especie: z.enum(ESPECIES, { error: 'Esa especie no existe.' }).optional(),
})

// De una fila de la base a lo que devuelve la API (camelCase, sin columnas internas)
export function aPacienteDeLaApi(fila) {
  return {
    id: fila.id,
    nombre: fila.nombre,
    especie: fila.especie,
    raza: fila.raza,
    fechaNacimiento: fila.fecha_nacimiento,
    // Se calcula cada vez (o es la edad vieja, si no tiene fecha): "4 años", "8 meses"...
    edad: textoDeEdad({ fechaNacimiento: fila.fecha_nacimiento, edad: fila.edad }, hoyISO()) || null,
    emailDuenio: fila.email_duenio,
  }
}

// De los nombres de la API (camelCase) a las columnas de la base
export function aFilaDeMascota(datos) {
  const fila = {}
  if ('nombre' in datos) fila.nombre = datos.nombre
  if ('especie' in datos) fila.especie = datos.especie
  if ('raza' in datos) fila.raza = datos.raza ?? null
  if ('fechaNacimiento' in datos) {
    fila.fecha_nacimiento = datos.fechaNacimiento || null
    // Con la fecha cargada, la edad vieja (fija) ya no hace falta
    if (fila.fecha_nacimiento) fila.edad = null
  }
  if ('emailDuenio' in datos) fila.email_duenio = datos.emailDuenio
  return fila
}

// ---------- Cobros ----------

// POST /api/v1/cobros → un cobro nuevo. turnoId (opcional): de qué turno sale.
// enEfectivo: si ya lo pagó en el mostrador, queda pagado en el mismo paso.
export const esquemaNuevoCobro = z.strictObject({
  mascotaId: z.number({ error: 'Elegí el paciente.' }).int().positive('Elegí el paciente.'),
  concepto: textoLimpio.pipe(z.string()
    .min(3, 'Escribí el concepto (ej: Consulta de control).')
    .max(80, 'El concepto puede tener hasta 80 caracteres.')),
  monto: z.number({ error: 'Ingresá el monto.' })
    .positive('El monto tiene que ser mayor a 0.')
    .max(10000000, 'El monto es demasiado alto.')
    // Centavos enteros (con un margen por cómo se guardan los decimales en JavaScript)
    .refine((m) => Math.abs(m * 100 - Math.round(m * 100)) < 1e-6, 'Usá hasta 2 decimales (ej: 15000 o 15000,50).'),
  turnoId: z.number().int().positive().nullish(),
  enEfectivo: z.boolean().optional(),
})

// ---------- Turnos ----------

export const ESTADOS_DE_TURNO_VETERINARIA = ['confirmado', 'atendido', 'ausente', 'cancelado']

// PATCH /api/v1/turnos/:id → cambiar el estado y/o marcar que no se cobra
export const esquemaCambiosTurno = z.strictObject({
  estado: z.enum(ESTADOS_DE_TURNO_VETERINARIA, { error: 'Ese estado no existe.' }).optional(),
  sinCargo: z.boolean().optional(),
}).refine((cambios) => Object.keys(cambios).length > 0, { message: 'No hay cambios para guardar.' })

// PATCH /api/v1/cobros/:id → por ahora, solo anular un cobro pendiente cargado por error
export const esquemaCambiosCobro = z.strictObject({
  estado: z.literal('anulado', { error: 'Solo se puede anular el cobro.' }),
})

// ---------- Mi perfil ----------

// Convierte una regla de validaciones.js (que devuelve el mensaje o null) en una validación de Zod
const conRegla = (regla) => (valor, contexto) => {
  const error = regla(valor)
  if (error) contexto.addIssue({ code: 'custom', message: error })
}

// PATCH /api/v1/perfil → nombre y teléfono propios (el email y el rol NO se cambian acá)
export const esquemaPerfil = z.strictObject({
  nombre: textoLimpio.superRefine(conRegla(errorDeNombre)),
  telefono: textoLimpio.superRefine(conRegla(errorDeTelefono)).transform((t) => t || null),
})
