import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should load and display main elements', async ({ page }) => {
    await page.goto('/')
    // Título principal
    await expect(page.getByRole('heading', { name: /save & organize your coding resources/i })).toBeVisible()
    // Subtítulo
    await expect(page.getByText(/helps programmers organize and access/i)).toBeVisible()

    await expect(page.getByRole('button', { name: /get started/i })).toBeVisible()
  })
})
