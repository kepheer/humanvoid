import type { IDetector, TSignalResult } from '@core/model/types'
import { DEFAULT_WEIGHTS, SIGNAL_GROUPS } from '@core/model/constants'
import { safeProbe } from '@client/lib/safeProbe'
import type { IClientContext } from '@client/model/types'
import { getWebglContext } from './webglHelpers'

const MIN_TEXTURE_SIZE = 4096
const MIN_EXTENSIONS = 5

export const checkWebglParamsAnomaly = (context: IClientContext): TSignalResult => {
  const canvas = safeProbe(() => context.doc.createElement('canvas'), null)
  if (canvas === null) return 'unavailable'

  const gl = getWebglContext(canvas)
  if (gl === null) return 'unavailable'

  const maxTextureSize = safeProbe(() => gl.getParameter(gl.MAX_TEXTURE_SIZE) as number, 0)
  const supportedExtensions = safeProbe(() => gl.getSupportedExtensions(), null)
  const debugInfo = safeProbe(() => gl.getExtension('WEBGL_debug_renderer_info'), null)

  return maxTextureSize < MIN_TEXTURE_SIZE ||
    supportedExtensions === null ||
    supportedExtensions.length < MIN_EXTENSIONS ||
    debugInfo === null
    ? 'suspicious'
    : 'clean'
}

export const webglParamsAnomaly: IDetector<IClientContext> = {
  key: 'webglParamsAnomaly',
  group: SIGNAL_GROUPS.GRAPHICS,
  weight: DEFAULT_WEIGHTS.webglParamsAnomaly ?? 12,
  run: checkWebglParamsAnomaly,
}
