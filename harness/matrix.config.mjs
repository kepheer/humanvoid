import { createPlaywrightVanillaRunner } from './runners/playwrightVanilla.mjs'
import { run as runPlaywrightStealth } from './runners/playwrightStealth.mjs'
import { run as runPuppeteerHeadless } from './runners/puppeteer.mjs'
import { run as runPuppeteerCdpSession } from './runners/puppeteerCdpSession.mjs'
import { run as runSelenium } from './runners/selenium.mjs'

export const MATRIX = [
  {
    name: 'playwright-chromium-headless',
    expected: 'medium-or-high',
    run: createPlaywrightVanillaRunner('chromium', { headless: true }),
  },
  {
    name: 'playwright-chromium-headful',
    expected: 'medium-or-high',
    run: createPlaywrightVanillaRunner('chromium', { headless: false }),
  },
  {
    name: 'playwright-firefox-headless',
    expected: 'medium-or-high',
    run: createPlaywrightVanillaRunner('firefox', { headless: true }),
  },
  {
    name: 'playwright-webkit-headless',
    expected: 'medium-or-high',
    run: createPlaywrightVanillaRunner('webkit', { headless: true }),
  },
  {
    name: 'playwright-stealth-chromium',
    expected: 'low',
    run: runPlaywrightStealth,
  },
  {
    name: 'puppeteer-headless',
    expected: 'medium-or-high',
    run: runPuppeteerHeadless,
  },
  {
    name: 'puppeteer-cdp-session',
    expected: 'medium-or-high',
    run: runPuppeteerCdpSession,
  },
  {
    name: 'selenium-chrome-headless',
    expected: 'medium-or-high',
    run: runSelenium,
  },
]
