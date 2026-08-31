import type { IDetector, TSignalResult } from '@core/model/types'
import { DEFAULT_WEIGHTS, SIGNAL_GROUPS } from '@core/model/constants'
import { safeProbe } from '@client/lib/safeProbe'
import type { IClientContext } from '@client/model/types'

const MINIMAL_CANVAS_DATA_URLS: ReadonlySet<string> = new Set(['', 'data:,'])

const drawFingerprintCanvas = (doc: Document): string => {
  const canvas = doc.createElement('canvas')
  canvas.width = 220
  canvas.height = 30
  const ctx = canvas.getContext('2d')
  if (ctx === null) return ''

  ctx.textBaseline = 'top'
  ctx.font = '14px Arial'
  ctx.fillStyle = '#f60'
  ctx.fillRect(0, 0, 100, 20)
  ctx.fillStyle = '#069'
  ctx.fillText('humanvoid fingerprint 😀 ~!@#$%^&*()', 2, 2)
  ctx.strokeStyle = 'rgba(102,204,0,0.7)'
  ctx.beginPath()
  ctx.arc(50, 15, 10, 0, Math.PI * 2)
  ctx.stroke()
  return canvas.toDataURL()
}

export const checkCanvasFingerprint = async (context: IClientContext): Promise<TSignalResult> => {
  const dataUrl = safeProbe(() => drawFingerprintCanvas(context.doc), '')
  if (MINIMAL_CANVAS_DATA_URLS.has(dataUrl)) return 'suspicious'
  return 'clean'
}

export const canvasFingerprint: IDetector<IClientContext> = {
  key: 'canvasFingerprint',
  group: SIGNAL_GROUPS.GRAPHICS,
  weight: DEFAULT_WEIGHTS.canvasFingerprint ?? 8,
  run: checkCanvasFingerprint,
}
