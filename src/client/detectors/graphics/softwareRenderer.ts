import type { IDetector, TSignalResult } from '@core/model/types'
import { DEFAULT_WEIGHTS, SIGNAL_GROUPS } from '@core/model/constants'
import { safeProbe } from '@client/lib/safeProbe'
import type { IClientContext } from '@client/model/types'
import { getWebglContext } from './webglHelpers'

const SOFTWARE_RENDERERS: readonly RegExp[] = [
  /SwiftShader/,
  /llvmpipe/,
  /Mesa/,
  /Software Rasterizer/,
  /ANGLE \(Software/,
]

export const isSoftwareRenderer = (renderer: string): boolean =>
  SOFTWARE_RENDERERS.some((pattern: RegExp) => pattern.test(renderer))

export const checkSoftwareRenderer = (context: IClientContext): TSignalResult => {
  const canvas = safeProbe(() => context.doc.createElement('canvas'), null)
  if (canvas === null) return 'unavailable'

  const gl = getWebglContext(canvas)
  if (gl === null) return 'unavailable'

  const debugInfo = safeProbe(() => gl.getExtension('WEBGL_debug_renderer_info'), null)
  if (debugInfo === null) return 'unavailable'

  const renderer = safeProbe(() => gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string, '')
  return isSoftwareRenderer(renderer) === true ? 'suspicious' : 'clean'
}

export const softwareRenderer: IDetector<IClientContext> = {
  key: 'softwareRenderer',
  group: SIGNAL_GROUPS.GRAPHICS,
  weight: DEFAULT_WEIGHTS.softwareRenderer ?? 35,
  run: checkSoftwareRenderer,
}
