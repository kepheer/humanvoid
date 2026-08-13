import { safeProbe } from '@client/lib/safeProbe'

export const getWebglContext = (canvas: HTMLCanvasElement): WebGLRenderingContext | WebGL2RenderingContext | null => {
  const webgl = safeProbe(() => canvas.getContext('webgl'), null)

  if (webgl !== null) {
    return webgl
  }

  return safeProbe(() => canvas.getContext('webgl2'), null)
}
