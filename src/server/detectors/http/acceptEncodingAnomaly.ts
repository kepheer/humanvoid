import { DEFAULT_WEIGHTS, SIGNAL_GROUPS } from '@core/model/constants'
import type { IDetector, TSignalResult } from '@core/model/types'
import { isModernChromeUa } from '@server/lib/uaHeuristics'
import type { IServerContext } from '@server/model/types'

export const acceptEncodingAnomaly: IDetector<IServerContext> = {
  key: 'acceptEncodingAnomaly',
  group: SIGNAL_GROUPS.HTTP,
  weight: DEFAULT_WEIGHTS.acceptEncodingAnomaly ?? 8,
  run: (context: IServerContext): TSignalResult => {
    if (isModernChromeUa(context.userAgent) === false) {
      return 'clean'
    }

    const acceptEncoding = context.headers['accept-encoding']

    if (acceptEncoding === undefined) {
      return 'suspicious'
    }

    return acceptEncoding.toLowerCase().includes('br') === false ? 'suspicious' : 'clean'
  },
}
