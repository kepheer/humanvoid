import type { IDetector } from '@core/model/types'
import type { IClientContext } from '@client/model/types'
import { audioFingerprint } from './audioFingerprint'
import { canvasFingerprint } from './canvasFingerprint'
import { softwareRenderer } from './softwareRenderer'
import { webglParamsAnomaly } from './webglParamsAnomaly'

export const GRAPHICS_DETECTORS: IDetector<IClientContext>[] = [
  softwareRenderer,
  webglParamsAnomaly,
  canvasFingerprint,
  audioFingerprint,
]

export { audioFingerprint, canvasFingerprint, softwareRenderer, webglParamsAnomaly }
