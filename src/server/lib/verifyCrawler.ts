import { resolve4, resolve6, reverse } from 'node:dns/promises'

import type { ICrawlerVerdict } from '@server/model/types'

const DNS_TIMEOUT_MS = 2000

interface ICrawlerDefinition {
  name: string
  pattern: RegExp
  allowedDomains: string[]
}

const CRAWLER_DEFINITIONS: ICrawlerDefinition[] = [
  { name: 'Googlebot', pattern: /Googlebot/i, allowedDomains: ['googlebot.com', 'google.com'] },
  { name: 'YandexBot', pattern: /YandexBot/i, allowedDomains: ['yandex.ru', 'yandex.net', 'yandex.com'] },
  { name: 'Bingbot', pattern: /Bingbot/i, allowedDomains: ['search.msn.com'] },
]

const identifyCrawler = (userAgent: string): ICrawlerDefinition | null =>
  CRAWLER_DEFINITIONS.find((definition: ICrawlerDefinition) => definition.pattern.test(userAgent)) ?? null

const hostnameMatchesDomain = (hostname: string, domains: string[]): boolean =>
  domains.some((domain: string) => hostname === domain || hostname.endsWith(`.${domain}`))

const isForwardConfirmed = async (hostname: string, ip: string): Promise<boolean> => {
  const results = await Promise.allSettled([resolve4(hostname), resolve6(hostname)])

  return results.some(
    (result: PromiseSettledResult<string[]>) => result.status === 'fulfilled' && result.value.includes(ip),
  )
}

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T | null> => {
  let timer: ReturnType<typeof setTimeout> | null = null

  try {
    return await Promise.race([
      promise,
      new Promise<T | null>((resolve: (value: T | null) => void) => {
        timer = setTimeout(() => resolve(null), timeoutMs)
      }),
    ])
  } finally {
    if (timer !== null) {
      clearTimeout(timer)
    }
  }
}

const verifyAgainstDns = async (definition: ICrawlerDefinition, ip: string): Promise<ICrawlerVerdict> => {
  try {
    const hostnames = await reverse(ip)
    const allowedHostnames = hostnames.filter((hostname: string) =>
      hostnameMatchesDomain(hostname, definition.allowedDomains),
    )

    if (allowedHostnames.length === 0) {
      return { status: 'unverified', name: definition.name }
    }

    const confirmations = await Promise.allSettled(
      allowedHostnames.map((hostname: string) => isForwardConfirmed(hostname, ip)),
    )
    const verified = confirmations.some(
      (result: PromiseSettledResult<boolean>) => result.status === 'fulfilled' && result.value === true,
    )

    return { status: verified === true ? 'verified' : 'unverified', name: definition.name }
  } catch {
    return { status: 'unavailable', name: definition.name }
  }
}

export const verifyCrawler = async (userAgent: string, ip: string | null): Promise<ICrawlerVerdict | null> => {
  const definition = identifyCrawler(userAgent)

  if (definition === null) {
    return null
  }

  if (ip === null) {
    return { status: 'unavailable', name: definition.name }
  }

  return (
    (await withTimeout(verifyAgainstDns(definition, ip), DNS_TIMEOUT_MS)) ?? {
      status: 'unavailable',
      name: definition.name,
    }
  )
}
