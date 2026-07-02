import type { Page, Element } from 'vibium'

export const BASE_URL = 'https://www.saucedemo.com'

export const Selectors = {
  username: '#user-name',
  password: '#password',
  loginButton: '#login-button',
  errorMessage: '[data-test="error"]',
  inventoryItem: '.inventory_item',
  inventoryItemName: '.inventory_item_name',
  inventoryItemPrice: '.inventory_item_price',
  sortDropdown: '.product_sort_container',
  cartBadge: '.shopping_cart_badge',
  cartLink: '.shopping_cart_link',
  addToCartBtn: (item: string) => `[data-test="add-to-cart-${item}"]`,
  removeBtn: (item: string) => `[data-test="remove-${item}"]`,
  checkoutBtn: '[data-test="checkout"]',
  continueBtn: '[data-test="continue"]',
  finishBtn: '[data-test="finish"]',
  firstName: '[data-test="firstName"]',
  lastName: '[data-test="lastName"]',
  postalCode: '[data-test="postalCode"]',
  menuButton: '#react-burger-menu-btn',
  menuCloseButton: '#react-burger-cross-btn',
  menuItems: '.bm-menu-wrap nav a',
} as const

export async function login(page: Page, username: string, password: string): Promise<void> {
  await page.go(BASE_URL)
  await page.find(Selectors.username).fill(username)
  await page.find(Selectors.password).fill(password)
  await page.find(Selectors.loginButton).click()
}

export async function getInventoryItems(page: Page): Promise<Element[]> {
  return page.findAll(Selectors.inventoryItem)
}

export async function getPrices(page: Page): Promise<number[]> {
  const priceEls = await page.findAll(Selectors.inventoryItemPrice)
  const prices: number[] = []
  for (const el of priceEls) {
    const text = await el.text()
    prices.push(Number.parseFloat(text.replace('$', '')))
  }
  return prices
}

export async function sortBy(page: Page, optionValue: string): Promise<void> {
  await page.find(Selectors.sortDropdown).selectOption(optionValue)
  await page.wait(500)
}

export async function addToCart(page: Page, itemId: string): Promise<void> {
  await page.find(Selectors.addToCartBtn(itemId)).click()
}
