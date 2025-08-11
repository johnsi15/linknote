import { test as base } from '@playwright/test'

// Credenciales de test (ajusta según tu entorno Clerk)
const EMAIL = process.env.CLERK_TEST_EMAIL || 'test@example.com'
const PASSWORD = process.env.CLERK_TEST_PASSWORD || '12345678A#'

base('setup clerk session', async ({ page, browserName }) => {
  await page.goto('http://localhost:3000/')
  // Click en el botón Login para abrir el modal
  await page.getByRole('button', { name: /login/i }).click()
  // Espera el modal y rellena email
  await page.getByRole('textbox', { name: /email|correo/i }).fill(EMAIL)
  await page.getByRole('button', { name: /continuar|continue/i }).click()

  await page.locator('input[type="password"]').fill(PASSWORD)
  await page.getByRole('button', { name: /continuar|continue/i }).click()

  // await page.waitForURL('**/dashboard', { timeout: 10000 })

  // Esperar a que el modal desaparezca y luego navegar manualmente al dashboard
  await page.waitForTimeout(3000)
  await page.goto('/dashboard')

  await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 10000 })

  // Guarda el storage state
  await page.context().storageState({ path: `e2e/.auth/user-${browserName}.json` })
})
