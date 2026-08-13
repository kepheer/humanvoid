import { DEFAULT_WEIGHTS, SIGNAL_GROUPS } from '@core/model/constants'
import type { IDetector, TSignalResult } from '@core/model/types'
import { isModernChromeUa } from '@server/lib/uaHeuristics'
import type { IServerContext } from '@server/model/types'

export const connectionAnomaly: IDetector<IServerContext> = {
  key: 'connectionAnomaly',
  group: SIGNAL_GROUPS.HTTP,
  weight: DEFAULT_WEIGHTS.connectionAnomaly ?? 12,
  run: (context: IServerContext): TSignalResult => {
    if (isModernChromeUa(context.userAgent) === false) {
      return 'clean'
    }

    const connection = context.headers['connection']

    if (connection === undefined) {
      return 'clean'
    }

    return connection.trim().toLowerCase() === 'close' ? 'suspicious' : 'clean'
  },
}
