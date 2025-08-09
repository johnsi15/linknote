import { test, expect } from '@playwright/test'

test.describe('Página Home', () => {
  test('debe cargar y mostrar textos principales', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/linknote/i)
    await expect(page.getByText(/guarda tus enlaces/i)).toBeVisible()
    await expect(page.getByText(/organiza y busca tus links/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /empezar/i })).toBeVisible()
  })
})
