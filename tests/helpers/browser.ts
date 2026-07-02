import { browser, type Page, type Browser } from 'vibium'

let vibiumBrowser: Browser | null = null

export async function createPage(): Promise<Page> {
  vibiumBrowser = await browser.start({ headless: true })
  const page = await vibiumBrowser.page()
  await page.setViewport({ width: 375, height: 812 })
  return page
}

export async function closeBrowser(): Promise<void> {
  if (vibiumBrowser) {
    await vibiumBrowser.stop()
    vibiumBrowser = null
  }
}
