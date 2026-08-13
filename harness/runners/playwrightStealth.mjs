import { chromium } from 'playwright-extra'
import stealth from 'puppeteer-extra-plugin-stealth'
import { runOnPage } from '../lib/runProfile.mjs'

chromium.use(stealth())

export const run = async (baseUrl) => {
  const browser = await chromium.launch({ headless: true })

  try {
    const page = await browser.newPage()

    return await runOnPage(page, baseUrl)
  } finally {
    await browser.close()
  }
}
