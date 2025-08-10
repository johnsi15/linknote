import { test as base, expect } from '@playwright/test'

// Usa el storageState generado por el setup de Clerk
const test = base.extend({
  context: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: 'e2e/.auth/user.json' })
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(context)
    await context.close()
  },
})

test.describe('Dashboard', () => {
  test('debe cargar la página de dashboard y mostrar zonas principales', async ({ page }) => {
    await page.goto('/dashboard')

    await expect(page.getByRole('heading', { name: /dashboard/i, level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { name: /recent links/i, level: 2 })).toBeVisible()
    await expect(page.getByRole('heading', { name: /your tags/i, level: 2 })).toBeVisible()
  })

  test('debe cargar la página de links', async ({ page }) => {
    await page.goto('/links')
  await expect(page.getByRole('heading', { name: /links/i })).toBeVisible({ timeout: 15000 })
    // Puedes ajustar el nombre del botón según el texto real
    // await expect(page.getByRole('button', { name: /nuevo link|nuevo enlace|add link/i })).toBeVisible()
  })

  test('debe cargar la página de tags', async ({ page }) => {
    await page.goto('/tags')
  await expect(page.getByRole('heading', { name: /tags/i })).toBeVisible({ timeout: 15000 })
    // Puedes ajustar el nombre del botón según el texto real
    // await expect(page.getByRole('button', { name: /nuevo tag|nueva etiqueta|add tag/i })).toBeVisible()
  })
})
