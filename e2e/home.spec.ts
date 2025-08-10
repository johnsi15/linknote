import { test, expect } from '@playwright/test'

test.describe('Página Home', () => {
  test('debe cargar y mostrar elementos principales', async ({ page }) => {
    await page.goto('/')
    // Título principal
    await expect(page.getByRole('heading', { name: /save & organize your coding resources/i })).toBeVisible()
    // Subtítulo
    await expect(page.getByText(/helps programmers organize and access/i)).toBeVisible()
    // Botón Get Started (solo visible si no hay sesión)
    await expect(page.getByRole('button', { name: /get started/i })).toBeVisible()
    // Link a Dashboard (si está visible)
    // await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible()
  })
})
