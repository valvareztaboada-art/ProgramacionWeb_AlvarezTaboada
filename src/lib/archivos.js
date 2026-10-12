// Reglas de los archivos de estudios. Son las mismas que configura la base
// (bucket "estudios"): acá sirven para avisarle al usuario ANTES de subir.

export const TAMANIO_MAXIMO = 10 * 1024 * 1024 // 10 MB

// Tipo de archivo (MIME) → extensión con la que lo guardamos
export const TIPOS_PERMITIDOS = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

// Para el atributo accept del <input type="file">
export const ACEPTA = Object.keys(TIPOS_PERMITIDOS).join(',')

// Dónde se guarda en Storage: "<id de la mascota>/<nombre único>.<ext>".
// La primera carpeta es la mascota: así la base sabe de quién es el archivo (RLS).
// No usamos el nombre original (puede tener espacios, acentos o caracteres raros).
export function rutaDeArchivo(mascotaId, tipo, idUnico) {
  return `${mascotaId}/${idUnico}.${TIPOS_PERMITIDOS[tipo]}`
}

// 2411724 → "2,3 MB"
export function formatearTamanio(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}

export function esImagen(tipo) {
  return typeof tipo === 'string' && tipo.startsWith('image/')
}
