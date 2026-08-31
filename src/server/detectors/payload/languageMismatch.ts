import { DEFAULT_WEIGHTS, SIGNAL_GROUPS } from '@core/model/constants'
import type { IDetector, TSignalResult } from '@core/model/types'
import type { IServerContext } from '@server/model/types'

const extractPrimaryLocale = (value: string): string | null => {
  const trimmed = value.trim()

  if (trimmed.length === 0) {
    return null
  }

  const firstEntry = trimmed.split(',')[0]?.split(';')[0]?.trim().toLowerCase() ?? ''

  if (firstEntry.length === 0) {
    return null
  }

  return firstEntry.split('-')[0] ?? null
}

export const languageMismatch: IDetector<IServerContext> = {
  key: 'languageMismatch',
  group: SIGNAL_GROUPS.CROSS_CHECK,
  weight: DEFAULT_WEIGHTS.languageMismatch ?? 8,
  run: (context: IServerContext): TSignalResult => {
    if (context.payload === null) {
      return 'unavailable'
    }

    const acceptLanguageHeader = context.headers['accept-language']

    if (acceptLanguageHeader === undefined) {
      return 'unavailable'
    }

    const headerLocale = extractPrimaryLocale(acceptLanguageHeader)
    const payloadRawLanguage = context.payload.raw.languages[0]
    const payloadLocale = payloadRawLanguage === undefined ? null : extractPrimaryLocale(payloadRawLanguage)

    if (headerLocale === null || payloadLocale === null) {
      return 'unavailable'
    }

    return headerLocale !== payloadLocale ? 'suspicious' : 'clean'
  },
}
