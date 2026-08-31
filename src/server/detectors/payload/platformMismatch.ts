import { DEFAULT_WEIGHTS, SIGNAL_GROUPS } from '@core/model/constants'
import type { IDetector, TSignalResult } from '@core/model/types'
import { isPlatformFamilyMismatch } from '@core/lib/platformFamily'
import type { IServerContext } from '@server/model/types'

const stripQuotes = (value: string): string => value.replace(/^"|"$/g, '')

export const platformMismatch: IDetector<IServerContext> = {
  key: 'platformMismatch',
  group: SIGNAL_GROUPS.CROSS_CHECK,
  weight: DEFAULT_WEIGHTS.platformMismatch ?? 20,
  run: (context: IServerContext): TSignalResult => {
    const headerPlatformRaw = context.headers['sec-ch-ua-platform']
    const headerPlatform = headerPlatformRaw === undefined ? null : stripQuotes(headerPlatformRaw)
    const payloadPlatform = context.payload?.raw.platform ?? null

    if (headerPlatform === null || payloadPlatform === null) {
      return 'unavailable'
    }

    return isPlatformFamilyMismatch(headerPlatform, payloadPlatform) === true ? 'suspicious' : 'clean'
  },
}
