import puppeteer from 'puppeteer'
import { runOnPage } from '../lib/runProfile.mjs'

export const run = async (baseUrl) => {
  const browser = await puppeteer.launch({ headless: 'new' })

  try {
    const page = await browser.newPage()

    return await runOnPage(page, baseUrl)
  } finally {
    await browser.close()
  }
}
