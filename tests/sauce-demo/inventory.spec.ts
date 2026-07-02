import { describe, it, expect, afterEach } from 'vitest'
import { createPage, closeBrowser } from '../helpers/browser'
import { login, getInventoryItems, getPrices, sortBy } from '../helpers/saucedemo'
import type { Page } from 'vibium'

let page: Page

afterEach(async () => {
  await closeBrowser()
})

it('M-INV-001 | Inventory page displays 6 products', async () => {
  page = await createPage()
  await login(page, 'standard_user', 'secret_sauce')
  const items = await getInventoryItems(page)
  expect(items).toHaveLength(6)
})

it('M-INV-002 | Sort by price low to high returns ascending order', async () => {
  page = await createPage()
  await login(page, 'standard_user', 'secret_sauce')
  await sortBy(page, 'lohi')
  const prices = await getPrices(page)
  const sorted = [...prices].sort((a, b) => a - b)
  expect(prices).toEqual(sorted)
})
