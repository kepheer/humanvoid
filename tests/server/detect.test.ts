import { describe, expect, it } from 'vitest'
import { detect } from '@server/api/detect'
import { issueChallenge } from '@server/lib/challenge'

const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
const headers = {
  accept: 'text/html',
  'accept-language': 'en-US,en;q=0.9',
  'accept-encoding': 'gzip, deflate, br',
  'user-agent': ua,
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'none',
  'sec-fetch-dest': 'document',
  'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  'sec-ch-ua-platform': '"Windows"',
  connection: 'keep-alive',
}

const payload = (report: Record<string, boolean | null> = {}, challenge: string | null = null) => ({
  schemaVersion: 1,
  challenge,
  report,
  raw: { userAgent: ua, languages: ['en-US'], platform: 'Windows', clientHints: null },
})

const options = { verifyCrawler: false }

describe('server detection boundary', () => {
  it.each([
    [{ headers }, 'payloadMissing', null],
    [{ headers, payload: null }, 'payloadMissing', null],
    [{ headers, payload: 'invalid' }, 'payloadSchemaInvalid', true],
    [{ headers, payload: payload({ webdriverFlag: true }) }, 'webdriverFlag', true],
    [{ headers, payload: payload({ webdriverFlag: false }) }, 'webdriverFlag', false],
    [{ headers, payload: payload({ webdriverFlag: null }) }, 'webdriverFlag', null],
  ])('normalizes payload state %#', async (input, key, expected) => {
    const result = await detect(input, options)
    expect(result.report[key]).toBe(expected)
  })

  it('does not score report data from an invalid payload', async () => {
    const result = await detect(
      { headers, payload: { ...payload({ webdriverFlag: true }), schemaVersion: 2 } },
      options,
    )
    expect(result.report.payloadSchemaInvalid).toBe(true)
    expect(result.report.webdriverFlag).toBeNull()
  })

  it('makes payload absence suspicious only in required mode', async () => {
    const result = await detect({ headers }, { ...options, payloadPolicy: 'required' })
    expect(result.report.payloadMissing).toBe(true)
  })

  it('honors disabled client signals', async () => {
    const result = await detect(
      { headers, payload: payload({ webdriverFlag: true }) },
      { ...options, disabled: ['webdriverFlag'] },
    )
    expect(result.report.webdriverFlag).toBeNull()
    expect(result.score).toBe(0)
  })

  it.each([
    [
      {
        mobile: false,
        platform: 'Windows',
        brands: [
          { brand: 'Chromium', version: '120' },
          { brand: 'Google Chrome', version: '120' },
        ],
      },
      false,
    ],
    [
      {
        mobile: true,
        platform: 'Windows',
        brands: [
          { brand: 'Chromium', version: '120' },
          { brand: 'Google Chrome', version: '120' },
        ],
      },
      true,
    ],
  ])('cross-checks client hints %#', async (clientHints, mismatch) => {
    const result = await detect(
      {
        headers: { ...headers, 'sec-ch-ua-mobile': '?0' },
        payload: { ...payload(), raw: { ...payload().raw, clientHints } },
      },
      options,
    )
    expect(result.report.clientHintsMismatch).toBe(mismatch)
  })
})

describe('challenge consumption', () => {
  it.each([
    ['missing payload', undefined, undefined, 'unavailable'],
    ['valid payload without secret', payload(), undefined, 'unavailable'],
    ['missing challenge with secret', payload(), 'secret', 'suspicious'],
  ])('handles %s', async (_name, clientPayload, secret, expected) => {
    const result = await detect({ headers, payload: clientPayload }, { ...options, secret })
    expect(result.report.challengeInvalid).toBe(expected === 'unavailable' ? null : true)
  })

  it('uses consumeNonce exactly once after a valid signature', async () => {
    const secret = 'secret'
    let calls = 0
    const result = await detect(
      { headers, payload: payload({}, issueChallenge(secret)) },
      {
        ...options,
        secret,
        consumeNonce: () => {
          calls += 1
          return true
        },
      },
    )
    expect(result.report.challengeInvalid).toBe(false)
    expect(calls).toBe(1)
  })

  it('marks an already consumed nonce suspicious', async () => {
    const secret = 'secret'
    const result = await detect(
      { headers, payload: payload({}, issueChallenge(secret)) },
      { ...options, secret, consumeNonce: () => false },
    )
    expect(result.report.challengeInvalid).toBe(true)
  })
})
