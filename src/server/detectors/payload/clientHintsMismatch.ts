import { DEFAULT_WEIGHTS, SIGNAL_GROUPS } from '@core/model/constants'
import type { IDetector, TSignalResult } from '@core/model/types'
import { isRealBrand, parseSecChUaBrands } from '@server/lib/uaHeuristics'
import type { IServerContext } from '@server/model/types'

const normalizeBrand = (brand: string): string => brand.trim().toLowerCase()

const sameBrands = (
  headerBrands: readonly { brand: string; version: string }[],
  clientBrands: readonly { brand: string; version: string }[],
): boolean => {
  const header = new Set(
    headerBrands
      .filter((brand) => isRealBrand(brand.brand))
      .map((brand) => `${normalizeBrand(brand.brand)}:${brand.version}`),
  )
  const client = new Set(
    clientBrands
      .filter((brand) => isRealBrand(brand.brand))
      .map((brand) => `${normalizeBrand(brand.brand)}:${brand.version}`),
  )

  return header.size === client.size && [...header].every((brand) => client.has(brand))
}

const parseMobile = (value: string | undefined): boolean | null => {
  if (value === '?1') {
    return true
  }

  if (value === '?0') {
    return false
  }

  return null
}

const unquote = (value: string): string => value.replace(/^"|"$/g, '')

export const clientHintsMismatch: IDetector<IServerContext> = {
  key: 'clientHintsMismatch',
  group: SIGNAL_GROUPS.CROSS_CHECK,
  weight: DEFAULT_WEIGHTS.clientHintsMismatch ?? 25,
  run: (context: IServerContext): TSignalResult => {
    const hints = context.payload?.raw.clientHints ?? null

    if (hints === null) {
      return 'unavailable'
    }

    const mobile = parseMobile(context.headers['sec-ch-ua-mobile'])
    const platform = context.headers['sec-ch-ua-platform']
    const brands = context.headers['sec-ch-ua']
    const checks: boolean[] = []

    if (mobile !== null) {
      checks.push(mobile === hints.mobile)
    }

    if (platform !== undefined) {
      checks.push(unquote(platform) === hints.platform)
    }

    if (brands !== undefined) {
      checks.push(sameBrands(parseSecChUaBrands(brands), hints.brands))
    }

    if (checks.length === 0) {
      return 'unavailable'
    }

    return checks.every(Boolean) === true ? 'clean' : 'suspicious'
  },
}
