import { test } from 'node:test'
import assert from 'node:assert/strict'
import { destinoDespuesDelLogin, inicioDelRol, pantallaDeVeterinaria } from '../src/lib/destino.js'

test('sin destino, cada rol va a su panel', () => {
  assert.equal(destinoDespuesDelLogin(undefined, 'cliente'), '/cliente')
  assert.equal(destinoDespuesDelLogin(undefined, 'veterinaria'), '/veterinaria')
  assert.equal(destinoDespuesDelLogin('', 'cliente'), '/cliente')
  assert.equal(inicioDelRol('otro'), '/cliente')
})

test('vuelve a la página privada que se quería abrir', () => {
  assert.equal(destinoDespuesDelLogin('/cliente/turnos/nuevo', 'cliente'), '/cliente/turnos/nuevo')
  assert.equal(destinoDespuesDelLogin('/cliente/vacunas', 'cliente'), '/cliente/vacunas')
  assert.equal(destinoDespuesDelLogin('/veterinaria/pacientes/12', 'veterinaria'), '/veterinaria/pacientes/12')
})

test('no manda a un panel que no es de su rol', () => {
  assert.equal(destinoDespuesDelLogin('/veterinaria/cobros', 'cliente'), '/cliente')
  // "/clientes-falsos" empieza con "/cliente" pero no es su panel
  assert.equal(destinoDespuesDelLogin('/clientes-falsos', 'cliente'), '/cliente')
})

test('ignora destinos peligrosos (open redirect)', () => {
  for (const malo of [
    'https://sitio-falso.com', '//sitio-falso.com', '/cliente//sitio-falso.com',
    'javascript:alert(1)', '/cliente/../veterinaria', '\\\\sitio-falso.com', '/cliente\\x',
    '/cliente?x=1', '/cliente#a', '/cliente?a?b', ['/cliente/turnos'], 42,
  ]) {
    assert.equal(destinoDespuesDelLogin(malo, 'cliente'), '/cliente', `debería ignorar ${malo}`)
  }
})

test('conserva solo el servicio elegido en el catálogo; cualquier otro parámetro se descarta', () => {
  assert.equal(destinoDespuesDelLogin('/cliente/turnos/nuevo?especialidad=vacunacion', 'cliente'),
    '/cliente/turnos/nuevo?especialidad=vacunacion')
  assert.equal(destinoDespuesDelLogin('/cliente/turnos/nuevo?x=1', 'cliente'), '/cliente/turnos/nuevo')
  assert.equal(destinoDespuesDelLogin('/cliente/turnos/nuevo?especialidad=https://falso.com', 'cliente'), '/cliente/turnos/nuevo')
})

test('la veterinaria que entra a una pantalla de cliente va a su pantalla equivalente', () => {
  const casos = {
    '/cliente': '/veterinaria',
    '/cliente/turnos': '/veterinaria/agenda',
    '/cliente/turnos/nuevo': '/veterinaria/agenda/nuevo',
    '/cliente/turnos/nuevo?especialidad=peluqueria': '/veterinaria/agenda/nuevo',
    '/cliente/vacunas': '/veterinaria/vacunas',
    '/cliente/estudios': '/veterinaria/estudios',
    '/cliente/pagos': '/veterinaria/cobros',
    '/cliente/pagos/resultado?pago=3': '/veterinaria/cobros',
    '/cliente/perfil': '/veterinaria/perfil',
    '/cliente/mascotas': '/veterinaria/pacientes',
    '/cliente/mascotas/12': '/veterinaria/pacientes/12',
    '/cliente/algo-nuevo': '/veterinaria',
    '': '/veterinaria',
  }
  for (const [ruta, esperada] of Object.entries(casos)) assert.equal(pantallaDeVeterinaria(ruta), esperada, ruta)
  assert.equal(pantallaDeVeterinaria(null), '/veterinaria')
})

test('después del login, la veterinaria también va a su pantalla equivalente', () => {
  assert.equal(destinoDespuesDelLogin('/cliente/turnos/nuevo', 'veterinaria'), '/veterinaria/agenda/nuevo')
  assert.equal(destinoDespuesDelLogin('/cliente/vacunas', 'veterinaria'), '/veterinaria/vacunas')
  // Lo peligroso se sigue ignorando
  assert.equal(destinoDespuesDelLogin('https://falso.com/cliente', 'veterinaria'), '/veterinaria')
})
