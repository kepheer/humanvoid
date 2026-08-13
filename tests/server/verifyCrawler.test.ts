import { afterEach, describe, expect, it, vi } from 'vitest'

const reverse = vi.fn()
const resolve4 = vi.fn()
const resolve6 = vi.fn()

vi.mock('node:dns/promises', () => ({ reverse, resolve4, resolve6 }))

const { verifyCrawler } = await import('@server/lib/verifyCrawler')
const googlebot = 'Mozilla/5.0 (compatible; Googlebot/2.1)'

afterEach(() => {
  reverse.mockReset()
  resolve4.mockReset()
  resolve6.mockReset()
})

describe('crawler verification', () => {
  it.each([
    ['not crawler', 'Mozilla/5.0', '1.1.1.1', null],
    ['no IP', googlebot, null, { name: 'Googlebot', status: 'unavailable' }],
  ])('%s', async (_name, ua, ip, expected) => {
    expect(await verifyCrawler(ua, ip)).toEqual(expected)
  })

  it('checks every allowed reverse DNS hostname', async () => {
    reverse.mockResolvedValue(['wrong.googlebot.com', 'right.googlebot.com'])
    resolve4.mockImplementation(async (host: string) => (host.startsWith('right') ? ['66.249.66.1'] : ['1.1.1.1']))
    resolve6.mockResolvedValue([])
    expect(await verifyCrawler(googlebot, '66.249.66.1')).toEqual({ name: 'Googlebot', status: 'verified' })
  })

  it.each([
    [['evil.example'], 'unverified'],
    [['crawl.googlebot.com'], 'unverified'],
  ])('reports %s when forward confirmation fails', async (hosts, status) => {
    reverse.mockResolvedValue(hosts)
    resolve4.mockResolvedValue([])
    resolve6.mockResolvedValue([])
    expect(await verifyCrawler(googlebot, '66.249.66.1')).toEqual({ name: 'Googlebot', status })
  })

  it('returns unavailable on DNS failure', async () => {
    reverse.mockRejectedValue(new Error('offline'))
    expect(await verifyCrawler(googlebot, '66.249.66.1')).toEqual({ name: 'Googlebot', status: 'unavailable' })
  })
})
