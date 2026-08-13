import type { IDetector, TSignalResult } from '@core/model/types'
import { DEFAULT_WEIGHTS, SIGNAL_GROUPS } from '@core/model/constants'
import { safeProbe } from '@client/lib/safeProbe'
import type { IClientContext } from '@client/model/types'

const CDP_ARTIFACT_PATTERN =
  /^(cdc_|\$cdc_|__playwright|__puppeteer|__pw_|__driver_evaluate|__webdriver_evaluate|__selenium_evaluate)/

export const hasCdpArtifactKey = (target: object): boolean =>
  Reflect.ownKeys(target).some((key: string | symbol) =>
    typeof key === 'string' ? CDP_ARTIFACT_PATTERN.test(key) : false,
  )

export const checkCdpArtifacts = (context: IClientContext): TSignalResult => {
  const foundOnWindow = safeProbe(() => hasCdpArtifactKey(context.win), false)
  const foundOnDocument = safeProbe(() => hasCdpArtifactKey(context.doc), false)

  return foundOnWindow === true || foundOnDocument === true ? 'suspicious' : 'clean'
}

export const cdpArtifacts: IDetector<IClientContext> = {
  key: 'cdpArtifacts',
  group: SIGNAL_GROUPS.FINGERPRINT,
  weight: DEFAULT_WEIGHTS.cdpArtifacts ?? 50,
  run: (context: IClientContext): TSignalResult => checkCdpArtifacts(context),
}
