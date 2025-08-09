import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test('debe cargar la página de dashboard y mostrar zonas principales', async ({ page }) => {
    // Simula autenticación si es necesario (ajustar según Clerk)
    // await page.goto('/sign-in');
    // await page.fill('input[type="email"]', 'test@example.com');
    // await page.click('button[type="submit"]');
    // await page.waitForURL('/(protected)/dashboard');

    await page.goto('/(protected)/dashboard')
    await expect(page.getByText(/dashboard/i)).toBeVisible()
    await expect(page.getByText(/enlaces recientes|links recientes/i)).toBeVisible()
    await expect(page.getByText(/tags más usados|etiquetas más usadas/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /links/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /tags/i })).toBeVisible()
  })

  test('debe cargar la página de links', async ({ page }) => {
    await page.goto('/(protected)/links')
    await expect(page.getByText(/links|enlaces/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /nuevo link|nuevo enlace/i })).toBeVisible()
  })

  test('debe cargar la página de tags', async ({ page }) => {
    await page.goto('/(protected)/tags')
    await expect(page.getByText(/tags|etiquetas/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /nuevo tag|nueva etiqueta/i })).toBeVisible()
  })
})
