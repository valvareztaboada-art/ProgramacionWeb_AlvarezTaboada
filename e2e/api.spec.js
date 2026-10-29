// Pruebas E2E de la API REST (/api/v1): pedidos HTTP reales al servidor, sin navegador.
// Comprueban los códigos de estado y que los errores vengan en JSON sin detalles internos.

import { test, expect } from '@playwright/test'

// La API no depende del tamaño de pantalla: alcanza con correrla una vez
test.skip(({ isMobile }) => isMobile, 'La API se prueba solo en el proyecto de escritorio')

test('sin sesión, la API privada responde 401 en JSON', async ({ request }) => {
  for (const [metodo, url] of [
    ['get', '/api/v1/pacientes'],
    ['post', '/api/v1/pacientes'],
    ['patch', '/api/v1/pacientes/1'],
    ['delete', '/api/v1/pacientes/1'],
    ['post', '/api/v1/cobros'],
    ['patch', '/api/v1/cobros/1'],
    ['patch', '/api/v1/turnos/1'],
    ['delete', '/api/v1/vacunas/1'],
    ['delete', '/api/v1/estudios/1'],
    ['patch', '/api/v1/perfil'],
  ]) {
    const respuesta = await request[metodo](url, { data: {} })
    expect(respuesta.status(), `${metodo.toUpperCase()} ${url}`).toBe(401)
    expect(await respuesta.json()).toEqual({ error: 'Tu sesión venció. Volvé a ingresar.' })
  }
})

test('un método que no existe en el recurso responde 405', async ({ request }) => {
  const respuesta = await request.put('/api/v1/pacientes/1', { data: {} })
  expect(respuesta.status()).toBe(405)
})

test('el webhook rechaza avisos sin firma válida (401), también en la dirección vieja', async ({ request }) => {
  for (const url of ['/api/v1/webhooks/mercadopago', '/api/webhooks/mercadopago']) {
    const respuesta = await request.post(`${url}?type=payment&data.id=123`, { data: {} })
    expect(respuesta.status(), url).toBe(401)
    expect(await respuesta.json()).toEqual({ error: 'Firma inválida' })
  }
})

test('el chequeo de salud responde (y no se guarda en caché)', async ({ request }) => {
  const respuesta = await request.get('/api/v1/salud')
  // 200 si la base responde; 503 si no (por ejemplo, sin conexión a Supabase)
  expect([200, 503]).toContain(respuesta.status())
  expect(respuesta.headers()['content-type']).toContain('application/json')
  if (respuesta.status() === 200) {
    expect(await respuesta.json()).toMatchObject({ estado: 'ok', base: 'ok' })
    expect(respuesta.headers()['cache-control']).toBe('no-store')
  }
})

test('el catálogo de servicios es público, se filtra por especie y valida el filtro', async ({ request }) => {
  const todos = await request.get('/api/v1/servicios')
  expect(todos.status()).toBe(200)
  const { servicios } = await todos.json()
  expect(servicios.map((s) => s.id)).toEqual(['consulta', 'vacunacion', 'estudios', 'peluqueria'])

  const aves = await (await request.get('/api/v1/servicios?especie=Aves')).json()
  expect(aves.servicios.map((s) => s.id)).toEqual(['consulta'])

  const invalido = await request.get('/api/v1/servicios?especie=Dragones')
  expect(invalido.status()).toBe(400)
  expect((await invalido.json()).detalles.especie).toBeTruthy()

  const uno = await request.get('/api/v1/servicios/vacunacion')
  expect((await uno.json()).servicio).toMatchObject({ id: 'vacunacion', nombre: 'Vacunación' })
  expect((await request.get('/api/v1/servicios/no-existe')).status()).toBe(404)
})
