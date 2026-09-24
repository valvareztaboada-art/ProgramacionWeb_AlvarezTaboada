// Datos de ejemplo (mock), organizados como tablas de una base de datos.
// Los turnos, vacunas y estudios se relacionan con la mascota por "mascotaId".
// Más adelante esto se reemplaza por tablas en Supabase.

export const mascotas = [
  { id: 1, nombre: 'Luna', especie: 'Perro', raza: 'Golden Retriever', edad: 4, duenio: 'Ana Gómez' },
  { id: 2, nombre: 'Michi', especie: 'Gato', raza: 'Siamés', edad: 2, duenio: 'Ana Gómez' },
  { id: 3, nombre: 'Rocco', especie: 'Perro', raza: 'Bulldog Francés', edad: 6, duenio: 'Juan Pérez' },
  { id: 4, nombre: 'Kiwi', especie: 'Ave', raza: 'Cotorra', edad: 1, duenio: 'Sofía Díaz' },
]

export const turnos = [
  { id: 1, mascotaId: 1, fecha: '2026-09-28', hora: '10:00', motivo: 'Control anual', estado: 'Confirmado' },
  { id: 2, mascotaId: 3, fecha: '2026-09-28', hora: '11:30', motivo: 'Dermatitis', estado: 'Pendiente' },
  { id: 3, mascotaId: 2, fecha: '2026-09-30', hora: '16:00', motivo: 'Vacunación', estado: 'Confirmado' },
  { id: 4, mascotaId: 4, fecha: '2026-10-02', hora: '09:00', motivo: 'Revisión de pico', estado: 'Pendiente' },
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
  { id: 1, duenio: 'Ana Gómez', concepto: 'Consulta Luna', monto: 25000, estado: 'Pendiente' },
  { id: 2, duenio: 'Juan Pérez', concepto: 'Radiografía Rocco', monto: 40000, estado: 'Pagado' },
  { id: 3, duenio: 'Ana Gómez', concepto: 'Ecografía Michi', monto: 35000, estado: 'Pendiente' },
]
