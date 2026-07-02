import { describe, it, expect, afterEach } from 'vitest'
import { createPage, closeBrowser } from '../helpers/browser'
import { login, Selectors } from '../helpers/saucedemo'
import type { Page } from 'vibium'

let page: Page

afterEach(async () => {
  await closeBrowser()
})

it('M-NAV-001 | Mobile menu opens and displays navigation items', async () => {
  page = await createPage()
  await login(page, 'standard_user', 'secret_sauce')
  await page.find(Selectors.menuButton).click()
  await page.wait(500)
  const menuItems = await page.findAll(Selectors.menuItems)
  const itemTexts: string[] = []
  for (const item of menuItems) {
    const text = await item.text()
    itemTexts.push(text)
  }
  expect(itemTexts.length).toBeGreaterThanOrEqual(4)
  expect(itemTexts).toContain('All Items')
  expect(itemTexts).toContain('About')
  expect(itemTexts).toContain('Logout')
})
