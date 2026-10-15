// Dueños/as conocidos para sugerir al cargar un paciente.
// Funciones puras (sin React ni Supabase): tienen tests en tests/duenios.test.js.

// "Gómez" → "gomez" (sin mayúsculas ni acentos, para comparar)
export function normalizar(texto = '') {
  return texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()
}

// Junta en una sola lista a los dueños/as con cuenta (perfiles de clientes) y a los
// que todavía no se registraron pero ya tienen una mascota cargada con su email.
// → [{ email, nombre, registrado, mascotas: ['Luna', 'Michi'] }]
export function armarListaDeDuenios(perfiles, mascotas) {
  const porEmail = new Map()
  for (const p of perfiles) {
    porEmail.set(p.email, { email: p.email, nombre: p.nombre || null, registrado: true, mascotas: [] })
  }
  for (const m of mascotas) {
    if (!porEmail.has(m.email_duenio)) {
      porEmail.set(m.email_duenio, { email: m.email_duenio, nombre: null, registrado: false, mascotas: [] })
    }
    porEmail.get(m.email_duenio).mascotas.push(m.nombre)
  }
  return [...porEmail.values()].sort((a, b) => (a.nombre ?? a.email).localeCompare(b.nombre ?? b.email, 'es'))
}

// Filtra por nombre, email o nombre de alguna de sus mascotas.
// Primero los que EMPIEZAN con lo escrito, después los que lo contienen.
export function filtrarDuenios(duenios, texto, limite = 8) {
  const buscado = normalizar(texto)
  if (buscado === '') return duenios.slice(0, limite)

  const puntaje = (d) => {
    const campos = [d.nombre ?? '', d.email, ...d.mascotas].map(normalizar)
    if (campos.some((c) => c.startsWith(buscado) || c.split(/\s+/).some((palabra) => palabra.startsWith(buscado)))) return 2
    if (campos.some((c) => c.includes(buscado))) return 1
    return 0
  }

  return duenios
    .map((d) => ({ d, p: puntaje(d) }))
    .filter(({ p }) => p > 0)
    .sort((a, b) => b.p - a.p)
    .slice(0, limite)
    .map(({ d }) => d)
}

// Cantidad mínima de cambios (letras agregadas, borradas o cambiadas) para pasar de a a b
export function distancia(a, b) {
  const fila = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    let anterior = fila[0]
    fila[0] = i
    for (let j = 1; j <= b.length; j++) {
      const guardado = fila[j]
      fila[j] = Math.min(fila[j] + 1, fila[j - 1] + 1, anterior + (a[i - 1] === b[j - 1] ? 0 : 1))
      anterior = guardado
    }
  }
  return fila[b.length]
}

// Si el email escrito NO es de nadie pero se parece mucho al de alguien (1 o 2 letras
// de diferencia), probablemente es un error de tipeo: devolvemos a quién se parece.
export function emailParecido(duenios, email) {
  const escrito = normalizar(email)
  if (!escrito.includes('@') || duenios.some((d) => d.email === escrito)) return null

  let mejor = null
  for (const d of duenios) {
    const dist = distancia(escrito, d.email)
    if (dist <= 2 && (!mejor || dist < mejor.dist)) mejor = { duenio: d, dist }
  }
  return mejor?.duenio ?? null
}
