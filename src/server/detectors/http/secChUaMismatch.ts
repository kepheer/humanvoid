import { DEFAULT_WEIGHTS, SIGNAL_GROUPS } from '@core/model/constants'
import type { IDetector, TSignalResult } from '@core/model/types'
import {
  brandMatchesUa,
  isModernChromeUa,
  isRealBrand,
  parseSecChUaBrands,
  type ISecChUaBrand,
} from '@server/lib/uaHeuristics'
import type { IServerContext } from '@server/model/types'

const hasMatchingBrand = (brands: ISecChUaBrand[], ua: string): boolean =>
  brands.some((brand: ISecChUaBrand) => brandMatchesUa(brand.brand, ua) === true)

export const secChUaMismatch: IDetector<IServerContext> = {
  key: 'secChUaMismatch',
  group: SIGNAL_GROUPS.HTTP,
  weight: DEFAULT_WEIGHTS.secChUaMismatch ?? 32,
  run: (context: IServerContext): TSignalResult => {
    const secChUa = context.headers['sec-ch-ua']

    if (secChUa === undefined) {
      return isModernChromeUa(context.userAgent) === true ? 'suspicious' : 'clean'
    }

    const realBrands = parseSecChUaBrands(secChUa).filter((brand: ISecChUaBrand) => isRealBrand(brand.brand) === true)

    if (realBrands.length === 0) {
      return 'suspicious'
    }

    return hasMatchingBrand(realBrands, context.userAgent) === false ? 'suspicious' : 'clean'
  },
}
