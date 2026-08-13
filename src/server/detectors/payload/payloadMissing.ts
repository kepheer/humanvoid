import { DEFAULT_WEIGHTS, SIGNAL_GROUPS } from '@core/model/constants'
import type { IDetector, TSignalResult } from '@core/model/types'
import type { IServerContext } from '@server/model/types'

export const payloadMissing: IDetector<IServerContext> = {
  key: 'payloadMissing',
  group: SIGNAL_GROUPS.CROSS_CHECK,
  weight: DEFAULT_WEIGHTS.payloadMissing ?? 25,
  run: (context: IServerContext): TSignalResult =>
    context.payloadState === 'valid'
      ? 'clean'
      : context.payloadState === 'missing' && context.payloadPolicy === 'required'
        ? 'suspicious'
        : 'unavailable',
}
