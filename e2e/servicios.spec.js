// Pruebas E2E del catálogo de servicios: navegar, filtrar por especie, ver el detalle y sacar turno.

import { test, expect } from '@playwright/test'

test('el catálogo lista los servicios y se filtra por especie', async ({ page }) => {
  await page.goto('/servicios')
  await expect(page.getByRole('heading', { level: 1, name: 'Todo lo que tu mascota necesita' })).toBeVisible()
  const tarjetas = page.getByRole('main').getByRole('listitem')
  await expect(tarjetas).toHaveCount(4)

  // El filtro es un enlace: cambia la URL y marca cuál está elegido
  await page.getByRole('link', { name: 'Aves', exact: true }).click()
  await expect(page).toHaveURL(/\/servicios\?especie=Aves$/)
  await expect(page.getByRole('link', { name: 'Aves', exact: true })).toHaveAttribute('aria-current', 'page')
  await expect(tarjetas).toHaveCount(1)
  await expect(tarjetas.first()).toContainText('Consulta')
})

test('desde la portada se llega al detalle de un servicio con su información', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Ver los servicios y sacar turno' }).click()
  await page.getByRole('link', { name: /Vacunación/ }).click()

  await expect(page).toHaveURL(/\/servicios\/vacunacion$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Vacunación' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Qué incluye' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Ruta de navegación' })).toContainText('Servicios')
})

test('"Sacar turno" desde un servicio pide ingresar y recuerda el servicio elegido', async ({ page }) => {
  await page.goto('/servicios/peluqueria')
  await page.getByRole('link', { name: 'Sacar turno de peluquería' }).click()
  await expect(page).toHaveURL(/\/login\?siguiente=%2Fcliente%2Fturnos%2Fnuevo%3Fespecialidad%3Dpeluqueria$/)
})

test('un servicio que no existe da 404', async ({ page }) => {
  const respuesta = await page.goto('/servicios/no-existe')
  expect(respuesta.status()).toBe(404)
})
