import { DEFAULT_WEIGHTS, SIGNAL_GROUPS } from '@core/model/constants'
import type { IDetector, TSignalResult } from '@core/model/types'
import type { IServerContext } from '@server/model/types'

export const payloadSchemaInvalid: IDetector<IServerContext> = {
  key: 'payloadSchemaInvalid',
  group: SIGNAL_GROUPS.CROSS_CHECK,
  weight: DEFAULT_WEIGHTS.payloadSchemaInvalid ?? 35,
  run: (context: IServerContext): TSignalResult => {
    if (context.payloadState === 'missing') {
      return 'unavailable'
    }

    return context.payloadState === 'invalid' ? 'suspicious' : 'clean'
  },
}
