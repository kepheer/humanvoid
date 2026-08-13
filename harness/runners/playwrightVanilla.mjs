import { chromium, firefox, webkit } from 'playwright'
import { runOnPage } from '../lib/runProfile.mjs'

const BROWSER_LAUNCHERS = { chromium, firefox, webkit }

export const createPlaywrightVanillaRunner = (browserName, launchOptions) => async (baseUrl) => {
  const launcher = BROWSER_LAUNCHERS[browserName]
  const browser = await launcher.launch(launchOptions)

  try {
    const page = await browser.newPage()

    return await runOnPage(page, baseUrl)
  } finally {
    await browser.close()
  }
}
