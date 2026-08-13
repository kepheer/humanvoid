import { DEFAULT_WEIGHTS, SIGNAL_GROUPS } from '@core/model/constants'
import type { IDetector, TSignalResult } from '@core/model/types'
import type { IServerContext } from '@server/model/types'

export const uaCrossMismatch: IDetector<IServerContext> = {
  key: 'uaCrossMismatch',
  group: SIGNAL_GROUPS.CROSS_CHECK,
  weight: DEFAULT_WEIGHTS.uaCrossMismatch ?? 40,
  run: (context: IServerContext): TSignalResult => {
    if (context.payload === null) {
      return 'unavailable'
    }

    const headerUa = context.headers['user-agent']

    if (headerUa === undefined) {
      return 'unavailable'
    }

    return context.payload.raw.userAgent.trim() !== headerUa.trim() ? 'suspicious' : 'clean'
  },
}
