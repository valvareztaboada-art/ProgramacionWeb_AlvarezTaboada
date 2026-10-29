// Pruebas E2E de ingreso y registro (sin iniciar sesión de verdad: no hacen falta usuarios).
// Verifican la validación de los formularios y que las páginas privadas pidan ingresar.

import { test, expect } from '@playwright/test'

test.describe('Ingresar', () => {
  test('sin completar nada muestra los errores y lleva el foco al primero', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page.getByText('Ingresá tu email.')).toBeVisible()
    await expect(page.getByText('Ingresá tu contraseña.')).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeFocused()
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveAttribute('aria-invalid', 'true')
  })

  test('el error desaparece mientras se corrige el campo', async ({ page }) => {
    await page.goto('/login')
    const email = page.getByRole('textbox', { name: 'Email' })
    await email.fill('ana@')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page.getByText('Ingresá un email válido (ej: nombre@mail.com).')).toBeVisible()

    await email.fill('ana@mail.com')
    await expect(page.getByText('Ingresá un email válido (ej: nombre@mail.com).')).toBeHidden()
  })

  test('tiene el enlace para crear una cuenta', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: 'Creá tu cuenta' }).click()
    await expect(page).toHaveURL(/\/registro$/)
  })
})

test.describe('Crear cuenta', () => {
  test('controla que las contraseñas coincidan y mide la fortaleza', async ({ page }) => {
    await page.goto('/registro')
    await page.getByRole('textbox', { name: 'Nombre y apellido' }).fill('Valentina Ríos')
    await page.getByRole('textbox', { name: 'Email' }).fill('valentina@mail.com')
    // type=password no tiene rol de textbox: se buscan por su etiqueta
    await page.getByLabel('Contraseña', { exact: true }).fill('abc')
    await expect(page.getByText('Débil')).toBeVisible()

    await page.getByLabel('Repetí la contraseña').fill('otra-cosa')
    await page.getByRole('button', { name: 'Crear cuenta' }).click()
    await expect(page.getByText('Las contraseñas no coinciden.')).toBeVisible()
  })
})

test.describe('Páginas privadas', () => {
  test('sin sesión, "Sacar turno" pide ingresar y recuerda a dónde iba', async ({ page }) => {
    await page.goto('/cliente/turnos/nuevo')
    await expect(page).toHaveURL(/\/login\?siguiente=%2Fcliente%2Fturnos%2Fnuevo$/)
    await expect(page.getByText('Ingresá para continuar. Después te llevamos a donde ibas.')).toBeVisible()
  })

  test('sin sesión, el panel de la veterinaria también pide ingresar', async ({ page }) => {
    await page.goto('/veterinaria/pacientes')
    await expect(page).toHaveURL(/\/login\?siguiente=%2Fveterinaria%2Fpacientes$/)
  })
})

test.describe('Recuperar la contraseña', () => {
  test('desde el login se llega al formulario, que valida el email', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: '¿Olvidaste tu contraseña?' }).click()
    await expect(page).toHaveURL(/\/recuperar$/)

    await page.getByRole('button', { name: 'Mandarme el enlace' }).click()
    await expect(page.getByText('Ingresá tu email.')).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Email de tu cuenta' })).toBeFocused()
  })

  test('sin sesión, "contraseña nueva" pide un enlace nuevo', async ({ page }) => {
    await page.goto('/nueva-contrasena')
    await expect(page.getByText('El enlace venció o se abrió en otro navegador.')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Pedí uno nuevo' })).toHaveAttribute('href', '/recuperar')
  })
})
