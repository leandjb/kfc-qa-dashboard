import { describe, it, expect, afterEach } from 'vitest'
import { createPage, closeBrowser } from '../helpers/browser'
import { login, Selectors } from '../helpers/saucedemo'
import type { Page } from 'vibium'

let page: Page

afterEach(async () => {
  await closeBrowser()
})

it('M-LOG-001 | Standard user login redirects to product page', async () => {
  page = await createPage()
  await login(page, 'standard_user', 'secret_sauce')
  await page.waitUntil.loaded()
  const url = await page.url()
  expect(url).toContain('/inventory.html')
})

it('M-LOG-002 | Locked-out user shows correct error message', async () => {
  page = await createPage()
  await login(page, 'locked_out_user', 'secret_sauce')
  const errorEl = await page.find(Selectors.errorMessage)
  const errorText = await errorEl.text()
  expect(errorText).toBe('Epic sadface: Sorry, this user has been locked out.')
})

it('M-LOG-003 | Wrong password shows generic error without leaking account existence', async () => {
  page = await createPage()
  await login(page, 'standard_user', 'wrong_password_123')
  const errorEl = await page.find(Selectors.errorMessage)
  const errorText = await errorEl.text()
  expect(errorText).toContain('Username and password do not match')
})
