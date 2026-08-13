import puppeteer from 'puppeteer'

const POLL_INTERVAL_MS = 100
const POLL_TIMEOUT_MS = 3000

const evaluateViaCdp = async (client, expression) => {
  const { result, exceptionDetails } = await client.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  })

  if (exceptionDetails !== undefined) {
    throw new Error(`puppeteer-cdp-session harness: evaluate failed: ${exceptionDetails.text}`)
  }

  return result.value
}

const waitForResultViaCdp = async (client) => {
  const deadline = Date.now() + POLL_TIMEOUT_MS

  while (Date.now() < deadline) {
    const value = await evaluateViaCdp(client, 'window.__humanvoidResult')

    if (value !== null && value !== undefined) {
      return value
    }

    await new Promise((resolvePromise) => setTimeout(resolvePromise, POLL_INTERVAL_MS))
  }

  throw new Error('puppeteer-cdp-session harness: timed out waiting for window.__humanvoidResult')
}

export const run = async (baseUrl) => {
  const browser = await puppeteer.launch({ headless: 'new' })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 720 })
    const client = await page.target().createCDPSession()

    await client.send('Page.enable')
    await client.send('Page.navigate', { url: baseUrl })

    return await waitForResultViaCdp(client)
  } finally {
    await browser.close()
  }
}
