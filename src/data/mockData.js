// Datos de ejemplo (mock), organizados como tablas de una base de datos.
// Más adelante esto se reemplaza por tablas en Supabase.
//
// Cómo se relacionan:
// - Cada mascota guarda el EMAIL de su dueño/a (emailDuenio).
// - La veterinaria puede cargar una mascota aunque el dueño/a todavía no tenga cuenta.
// - Cuando esa persona se registra con ese email, ve automáticamente sus mascotas.
// - Turnos, vacunas y estudios se relacionan con la mascota por "mascotaId".

export const usuarios = [
  { id: 1, nombre: 'Ana Gómez', email: 'ana.gomez@mail.com', rol: 'cliente' },
  { id: 2, nombre: 'Juan Pérez', email: 'juan.perez@mail.com', rol: 'cliente' },
  { id: 3, nombre: 'Laura Ríos', email: 'laura@mican.vet', rol: 'veterinaria' },
]

export const mascotas = [
  { id: 1, nombre: 'Luna', especie: 'Perro', raza: 'Golden Retriever', edad: 4, emailDuenio: 'ana.gomez@mail.com' },
  { id: 2, nombre: 'Michi', especie: 'Gato', raza: 'Siamés', edad: 2, emailDuenio: 'ana.gomez@mail.com' },
  { id: 3, nombre: 'Rocco', especie: 'Perro', raza: 'Bulldog Francés', edad: 6, emailDuenio: 'juan.perez@mail.com' },
  // Kiwi fue cargada por la veterinaria, pero su dueña todavía no se registró
  { id: 4, nombre: 'Kiwi', especie: 'Ave', raza: 'Cotorra', edad: 1, emailDuenio: 'sofia.diaz@mail.com' },
]

export const especialidades = [
  { id: 'consulta', nombre: 'Consulta', icono: 'estetoscopio', descripcion: 'Control general o algo que te preocupa' },
  { id: 'vacunacion', nombre: 'Vacunación', icono: 'jeringa', descripcion: 'Vacunas del calendario' },
  { id: 'estudios', nombre: 'Estudios', icono: 'tubo', descripcion: 'Análisis, radiografías, ecografías' },
  { id: 'peluqueria', nombre: 'Peluquería', icono: 'tijera', descripcion: 'Baño y corte' },
]

export const turnos = [
  { id: 1, mascotaId: 1, fecha: '2026-09-28', hora: '10:00', especialidad: 'Consulta', motivo: 'Control anual', estado: 'Confirmado' },
  { id: 2, mascotaId: 3, fecha: '2026-09-28', hora: '11:30', especialidad: 'Consulta', motivo: 'Dermatitis', estado: 'Pendiente' },
  { id: 3, mascotaId: 2, fecha: '2026-09-30', hora: '16:00', especialidad: 'Vacunación', motivo: 'Triple felina', estado: 'Confirmado' },
  { id: 4, mascotaId: 4, fecha: '2026-10-02', hora: '09:00', especialidad: 'Consulta', motivo: 'Revisión de pico', estado: 'Pendiente' },
]

export const vacunas = [
  { id: 1, mascotaId: 1, vacuna: 'Antirrábica', fecha: '2026-10-15', aplicada: false },
  { id: 2, mascotaId: 2, vacuna: 'Triple felina', fecha: '2026-09-30', aplicada: false },
  { id: 3, mascotaId: 1, vacuna: 'Séxtuple', fecha: '2026-03-10', aplicada: true },
  { id: 4, mascotaId: 3, vacuna: 'Antirrábica', fecha: '2026-11-02', aplicada: false },
]

export const estudios = [
  { id: 1, mascotaId: 1, tipo: 'Análisis de sangre', fecha: '2026-08-20' },
  { id: 2, mascotaId: 3, tipo: 'Radiografía de cadera', fecha: '2026-09-05' },
  { id: 3, mascotaId: 2, tipo: 'Ecografía abdominal', fecha: '2026-09-12' },
]

export const pagos = [
  { id: 1, emailDuenio: 'ana.gomez@mail.com', concepto: 'Consulta Luna', monto: 25000, estado: 'Pendiente' },
  { id: 2, emailDuenio: 'juan.perez@mail.com', concepto: 'Radiografía Rocco', monto: 40000, estado: 'Pagado' },
  { id: 3, emailDuenio: 'ana.gomez@mail.com', concepto: 'Ecografía Michi', monto: 35000, estado: 'Pendiente' },
]
