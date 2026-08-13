import { describe, expect, it, vi } from 'vitest'
import { issueChallenge, verifyChallenge } from '@server/lib/challenge'

describe('challenge token', () => {
  it.each([
    ['malformed', 'bad', 'secret', false, 'malformed'],
    ['wrong secret', issueChallenge('a'), 'b', false, 'signatureMismatch'],
  ])('%s', (_name, token, secret, valid, reason) => {
    expect(verifyChallenge(token, secret)).toMatchObject({ isValid: valid, reason })
  })

  it('expires', () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    const token = issueChallenge('secret', { ttlMs: 1 })
    vi.setSystemTime(2)
    expect(verifyChallenge(token, 'secret')).toMatchObject({ isValid: false, reason: 'expired' })
    vi.useRealTimers()
  })

  it('validates a newly issued token', () => {
    expect(verifyChallenge(issueChallenge('secret'), 'secret').isValid).toBe(true)
  })
})
