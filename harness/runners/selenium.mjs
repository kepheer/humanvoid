import { existsSync, readdirSync } from 'node:fs'
import { homedir, platform } from 'node:os'
import { join } from 'node:path'
import { Builder } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'
import chromedriverPackage from 'chromedriver'

const POLL_INTERVAL_MS = 100
const POLL_TIMEOUT_MS = 3000

const CACHE_DIR_BY_PLATFORM = {
  darwin: process.arch === 'arm64' ? 'mac-arm64' : 'mac-x64',
  linux: 'linux64',
  win32: 'win64',
}

const CHROME_BINARY_BY_PLATFORM = {
  darwin: 'Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
  linux: 'chrome',
  win32: 'chrome.exe',
}

const findCachedChromeBinary = () => {
  const platformDir = CACHE_DIR_BY_PLATFORM[platform()]
  const binaryName = CHROME_BINARY_BY_PLATFORM[platform()]

  if (platformDir === undefined || binaryName === undefined) {
    return null
  }

  const cacheRoot = join(homedir(), '.cache', 'selenium', 'chrome', platformDir)

  if (existsSync(cacheRoot) === false) {
    return null
  }

  const versions = readdirSync(cacheRoot)

  if (versions.length === 0) {
    return null
  }

  const binaryPath = join(cacheRoot, versions[versions.length - 1], binaryName)

  return existsSync(binaryPath) === true ? binaryPath : null
}

const waitForHumanvoidResult = async (driver) => {
  const deadline = Date.now() + POLL_TIMEOUT_MS

  while (Date.now() < deadline) {
    const result = await driver.executeScript(() => window.__humanvoidResult)

    if (result !== null && result !== undefined) {
      return result
    }

    await new Promise((resolvePromise) => setTimeout(resolvePromise, POLL_INTERVAL_MS))
  }

  throw new Error('humanvoid harness: timed out waiting for window.__humanvoidResult')
}

export const run = async (baseUrl) => {
  const options = new chrome.Options()
  options.addArguments('--headless=new', '--no-sandbox', '--disable-dev-shm-usage')

  const chromeBinary = findCachedChromeBinary()

  if (chromeBinary !== null) {
    options.setChromeBinaryPath(chromeBinary)
  }

  const service = new chrome.ServiceBuilder(chromedriverPackage.path)

  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).setChromeService(service).build()

  try {
    await driver.get(baseUrl)

    return await waitForHumanvoidResult(driver)
  } finally {
    await driver.quit()
  }
}
