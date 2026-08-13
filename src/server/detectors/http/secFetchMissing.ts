import { DEFAULT_WEIGHTS, SIGNAL_GROUPS } from '@core/model/constants'
import type { IDetector, TSignalResult } from '@core/model/types'
import { isModernChromeOrEdgeUa } from '@server/lib/uaHeuristics'
import type { IServerContext } from '@server/model/types'

const SEC_FETCH_HEADERS = ['sec-fetch-mode', 'sec-fetch-site', 'sec-fetch-dest']

export const secFetchMissing: IDetector<IServerContext> = {
  key: 'secFetchMissing',
  group: SIGNAL_GROUPS.HTTP,
  weight: DEFAULT_WEIGHTS.secFetchMissing ?? 30,
  run: (context: IServerContext): TSignalResult => {
    if (isModernChromeOrEdgeUa(context.userAgent) === false) {
      return 'clean'
    }

    const isMissingAny = SEC_FETCH_HEADERS.some((name: string) => context.headers[name] === undefined)

    return isMissingAny === true ? 'suspicious' : 'clean'
  },
}
