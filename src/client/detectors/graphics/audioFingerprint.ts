import type { IDetector, TSignalResult } from '@core/model/types'
import { DEFAULT_WEIGHTS, SIGNAL_GROUPS } from '@core/model/constants'
import type { IClientContext } from '@client/model/types'
import { safeProbe } from '@client/lib/safeProbe'

const TYPICAL_SAMPLE_RATES: ReadonlySet<number> = new Set([44100, 48000])
const OFFLINE_CONTEXT_LENGTH = 5000
const RENDER_SAMPLE_RATE = 44100

export const checkAudioFingerprint = async (context: IClientContext): Promise<TSignalResult> => {
  try {
    const OfflineAudioContextCtor = safeProbe(() => context.win.OfflineAudioContext, undefined)
    if (OfflineAudioContextCtor === undefined) return 'unavailable'

    const offlineContext = new OfflineAudioContextCtor(1, OFFLINE_CONTEXT_LENGTH, RENDER_SAMPLE_RATE)
    const oscillator = offlineContext.createOscillator()
    const compressor = offlineContext.createDynamicsCompressor()
    oscillator.type = 'triangle'
    oscillator.frequency.value = 10000
    oscillator.connect(compressor)
    compressor.connect(offlineContext.destination)
    oscillator.start(0)

    const buffer = await offlineContext.startRendering()
    const channelData = buffer.getChannelData(0)
    let sum = 0
    for (let index = 0; index < channelData.length; index += 1) sum += Math.abs(channelData[index] ?? 0)

    return !TYPICAL_SAMPLE_RATES.has(buffer.sampleRate) || sum === 0 ? 'suspicious' : 'clean'
  } catch {
    return 'unavailable'
  }
}

export const audioFingerprint: IDetector<IClientContext> = {
  key: 'audioFingerprint',
  group: SIGNAL_GROUPS.GRAPHICS,
  weight: DEFAULT_WEIGHTS.audioFingerprint ?? 8,
  run: checkAudioFingerprint,
}
