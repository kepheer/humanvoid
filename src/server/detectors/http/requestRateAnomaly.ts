import { DEFAULT_WEIGHTS, SIGNAL_GROUPS } from '@core/model/constants'
import type { IDetector, TSignalResult } from '@core/model/types'
import type { IServerContext } from '@server/model/types'

export const requestRateAnomaly: IDetector<IServerContext> = {
  key: 'requestRateAnomaly',
  group: SIGNAL_GROUPS.HTTP,
  weight: DEFAULT_WEIGHTS.requestRateAnomaly ?? 25,
  run: (context: IServerContext): TSignalResult => {
    if (context.requestRate === null) {
      return 'unavailable'
    }

    return context.requestRate > context.requestRateThreshold ? 'suspicious' : 'clean'
  },
}
