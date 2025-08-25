import { test as base, expect } from '@playwright/test'

// Usa el storageState generado por el setup de Clerk
const test = base.extend({
  context: async ({ browser, browserName }, use) => {
    const context = await browser.newContext({ storageState: `e2e/.auth/user-${browserName}.json` })
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(context)
    await context.close()
  },
})

test.describe('Dashboard', () => {
  test.skip(({ browserName }) => browserName === 'webkit', 'WebKit has issues with Clerk redirects')

  test('should load dashboard page and display main sections', async ({ page }) => {
    await page.goto('/dashboard')

    await expect(page.getByRole('heading', { name: /dashboard/i, level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { name: /recent links/i, level: 2 })).toBeVisible()
    await expect(page.getByRole('heading', { name: /your tags/i, level: 2 })).toBeVisible()
  })

  test('should load links page', async ({ page }) => {
    await page.goto('/links')
    await expect(page.getByRole('heading', { name: /links/i })).toBeVisible({ timeout: 15000 })
  })

  test('should load tags page', async ({ page }) => {
    await page.goto('/tags')
    await expect(page.getByRole('heading', { name: /tags/i })).toBeVisible({ timeout: 15000 })
  })
})
