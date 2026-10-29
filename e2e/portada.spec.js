// Pruebas E2E de la portada: lo que ve alguien que entra por primera vez.
// Los locators son SEMÁNTICOS (getByRole, getByText): buscan lo que ve y usa la persona,
// no clases de CSS que cambian con cada rediseño.

import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('muestra el título, los botones principales y el pie', async ({ page }) => {
  await expect(page).toHaveTitle(/MICAN/)
  await expect(page.getByRole('heading', { level: 1, name: 'Medicina de verdad, a la vuelta de casa.' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Sacá un turno' })).toBeVisible()
  await expect(page.getByRole('link', { name: '¿Primera vez? Cómo funciona' })).toBeVisible()
  await expect(page.getByRole('contentinfo')).toContainText('Horarios')
})

test('"¿Primera vez? Cómo funciona" lleva a la explicación', async ({ page }) => {
  await page.getByRole('link', { name: '¿Primera vez? Cómo funciona' }).click()
  await expect(page).toHaveURL(/#como-funciona$/)
  await expect(page.getByRole('heading', { name: '¿Primera vez en MICAN? Te explicamos' })).toBeInViewport()
})

test('"Cómo funciona": las pestañas cambian de camino (con clic y con el teclado)', async ({ page }) => {
  const yaVino = page.getByRole('tab', { name: 'Ya llevé a mi mascota a MICAN' })
  const nuevo = page.getByRole('tab', { name: 'Todavía no la llevé' })

  await expect(yaVino).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('tabpanel')).toContainText('Creá tu cuenta')

  await nuevo.click()
  await expect(nuevo).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('tabpanel')).toContainText('Pedí el primer turno')

  // Accesibilidad: con la flecha se vuelve a la otra pestaña y el foco la acompaña
  await nuevo.press('ArrowLeft')
  await expect(yaVino).toBeFocused()
  await expect(yaVino).toHaveAttribute('aria-selected', 'true')
})

test('las opiniones se pasan con la flecha y con los puntos', async ({ page }) => {
  const opinion = page.getByRole('blockquote')
  await expect(opinion).toContainText('Ramona')

  await page.getByRole('button', { name: 'Opinión siguiente' }).click()
  await expect(opinion).toContainText('Osiris')

  await page.getByRole('button', { name: 'Opinión 4 de 4' }).click()
  await expect(opinion).toContainText('Frida')

  // Desde la última, "siguiente" vuelve a la primera
  await page.getByRole('button', { name: 'Opinión siguiente' }).click()
  await expect(opinion).toContainText('Ramona')
})

test('las preguntas frecuentes se despliegan', async ({ page }) => {
  const pregunta = page.getByText('¿Puedo cancelar un turno?')
  const respuesta = page.getByText('hasta 24 horas antes', { exact: false })
  await expect(respuesta).toBeHidden()
  await pregunta.click()
  await expect(respuesta).toBeVisible()
})

test('"Saltar al contenido" aparece con el teclado (accesibilidad)', async ({ page, isMobile }) => {
  test.skip(isMobile, 'En el celular no se navega con Tab')
  await page.keyboard.press('Tab')
  const saltar = page.getByRole('link', { name: 'Saltar al contenido' })
  await expect(saltar).toBeFocused()
  await expect(saltar).toBeInViewport()
})

test('en el celular el menú se abre, navega y se cierra con Escape', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'En la compu el menú se ve siempre')
  const menu = page.getByRole('button', { name: 'Menú' })
  await expect(page.getByRole('link', { name: 'Servicios' })).toBeHidden()

  await menu.click()
  await expect(page.getByRole('button', { name: 'Cerrar' })).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('link', { name: 'Servicios' })).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(page.getByRole('link', { name: 'Servicios' })).toBeHidden()
  await expect(menu).toBeFocused() // el foco vuelve al botón

  // Barra fija de abajo con lo más usado
  await expect(page.getByRole('link', { name: 'Llamar' })).toBeVisible()
})

test('una página que no existe muestra el 404', async ({ page }) => {
  const respuesta = await page.goto('/esta-pagina-no-existe')
  expect(respuesta.status()).toBe(404)
  await expect(page.getByRole('heading', { name: '404' })).toBeVisible()
})
