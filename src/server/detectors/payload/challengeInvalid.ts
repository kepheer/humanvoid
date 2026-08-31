import { DEFAULT_WEIGHTS, SIGNAL_GROUPS } from '@core/model/constants'
import type { IDetector, TSignalResult } from '@core/model/types'
import { verifyChallenge } from '@server/lib/challenge'
import type { IServerContext } from '@server/model/types'

export const challengeInvalid: IDetector<IServerContext> = {
  key: 'challengeInvalid',
  group: SIGNAL_GROUPS.CROSS_CHECK,
  weight: DEFAULT_WEIGHTS.challengeInvalid ?? 50,
  run: async (context: IServerContext): Promise<TSignalResult> => {
    if (context.payloadState !== 'valid' || context.payload === null) {
      return 'unavailable'
    }

    const challenge = context.payload.challenge

    if (challenge === null) {
      return context.secret === undefined ? 'unavailable' : 'suspicious'
    }

    if (context.secret === undefined) {
      return 'unavailable'
    }

    const verdict = verifyChallenge(challenge, context.secret)

    if (verdict.isValid === false) {
      return 'suspicious'
    }

    if (context.consumeNonce !== undefined) {
      try {
        if ((await context.consumeNonce(verdict.nonce ?? '', verdict.exp ?? 0)) === false) {
          return 'suspicious'
        }
      } catch {
        return 'unavailable'
      }
    }

    return 'clean'
  },
}
