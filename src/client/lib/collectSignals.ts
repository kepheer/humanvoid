import { runDetectors } from '@core/lib/runDetectors'
import type { IDetector, IRunOptions, ISignalOutcome } from '@core/model/types'
import { FINGERPRINT_DETECTORS } from '@client/detectors/fingerprint'
import { GRAPHICS_DETECTORS } from '@client/detectors/graphics'
import type { IClientContext } from '@client/model/types'

const ALL_DETECTORS: IDetector<IClientContext>[] = [...FINGERPRINT_DETECTORS, ...GRAPHICS_DETECTORS]

export const collectSignals = async (context: IClientContext, options: IRunOptions): Promise<ISignalOutcome[]> => {
  return runDetectors(ALL_DETECTORS, context, options)
}
