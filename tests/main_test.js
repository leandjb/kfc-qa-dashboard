import { writeFileSync } from 'node:fs'
import { browser } from 'vibium'

const browserSession = await browser.start()
const vibe = await browserSession.page()

await vibe.go('https://www.kfc.co/')
const png = await vibe.screenshot()
writeFileSync('kfc.png', png)

await browserSession.stop()