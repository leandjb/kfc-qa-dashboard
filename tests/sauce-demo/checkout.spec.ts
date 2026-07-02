import { describe, it, expect, afterEach } from 'vitest'
import { createPage, closeBrowser } from '../helpers/browser'
import { login, Selectors, addToCart } from '../helpers/saucedemo'
import type { Page } from 'vibium'

let page: Page

afterEach(async () => {
  await closeBrowser()
})

it('M-CHK-001 | Add to cart updates badge number', async () => {
  page = await createPage()
  await login(page, 'standard_user', 'secret_sauce')
  await addToCart(page, 'sauce-labs-backpack')
  const badge = await page.find(Selectors.cartBadge)
  const badgeText = await badge.text()
  expect(badgeText).toBe('1')
})

it('M-CHK-002 | Full checkout flow completes successfully', async () => {
  page = await createPage()
  await login(page, 'standard_user', 'secret_sauce')
  await addToCart(page, 'sauce-labs-backpack')
  await addToCart(page, 'sauce-labs-bike-light')
  await page.find(Selectors.cartLink).click()
  await page.waitUntil.loaded()
  await page.find(Selectors.checkoutBtn).click()
  await page.waitUntil.loaded()
  await page.find(Selectors.firstName).fill('Test')
  await page.find(Selectors.lastName).fill('User')
  await page.find(Selectors.postalCode).fill('12345')
  await page.find(Selectors.continueBtn).click()
  await page.waitUntil.loaded()
  await page.find(Selectors.finishBtn).click()
  await page.waitUntil.loaded()
  const url = await page.url()
  expect(url).toContain('/checkout-complete.html')
})
