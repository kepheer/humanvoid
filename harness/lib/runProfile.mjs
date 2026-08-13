const POLL_INTERVAL_MS = 100
const POLL_TIMEOUT_MS = 3000

export const waitForHumanvoidResult = async (page) => {
  const deadline = Date.now() + POLL_TIMEOUT_MS

  while (Date.now() < deadline) {
    const result = await page.evaluate(() => window.__humanvoidResult)

    if (result !== null && result !== undefined) {
      return result
    }

    await new Promise((resolvePromise) => setTimeout(resolvePromise, POLL_INTERVAL_MS))
  }

  throw new Error('humanvoid harness: timed out waiting for window.__humanvoidResult')
}

export const runOnPage = async (page, baseUrl) => {
  await page.goto(baseUrl)

  return waitForHumanvoidResult(page)
}
