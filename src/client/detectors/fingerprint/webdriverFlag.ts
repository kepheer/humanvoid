import type { IDetector, TSignalResult } from '@core/model/types'
import { DEFAULT_WEIGHTS, SIGNAL_GROUPS } from '@core/model/constants'
import { safeProbe } from '@client/lib/safeProbe'
import type { IClientContext } from '@client/model/types'

export const checkWebdriverFlag = (context: IClientContext): TSignalResult =>
  safeProbe(() => context.nav.webdriver === true, false) === true ? 'suspicious' : 'clean'

export const webdriverFlag: IDetector<IClientContext> = {
  key: 'webdriverFlag',
  group: SIGNAL_GROUPS.FINGERPRINT,
  weight: DEFAULT_WEIGHTS.webdriverFlag ?? 50,
  run: (context: IClientContext): TSignalResult => checkWebdriverFlag(context),
}
