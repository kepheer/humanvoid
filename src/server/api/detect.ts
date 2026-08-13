import { clientReportToOutcomes } from '@core/lib/clientReport'
import { mergeRunOptions, mergeScoringOptions } from '@core/lib/mergeOptions'
import { runDetectors } from '@core/lib/runDetectors'
import { scoreOutcomes } from '@core/lib/scoring'
import { DEFAULT_REQUEST_RATE_THRESHOLD } from '@core/model/constants'
import type { ISignalOutcome } from '@core/model/types'
import { HTTP_DETECTORS } from '../detectors/http'
import { PAYLOAD_DETECTORS } from '../detectors/payload'
import { verifyCrawler } from '@server/lib/verifyCrawler'
import { isClientPayload, resolvePayloadState } from '@server/lib/payload'
import { challengeInvalid } from '../detectors/payload/challengeInvalid'
import type { IServerContext, IServerDetectResult, IServerInput, IServerOptions } from '@server/model/types'

const normalizeHeaderValue = (value: string | string[] | undefined): string | undefined => {
  if (value === undefined) {
    return undefined
  }

  return Array.isArray(value) === true ? value.join(', ') : value
}

const normalizeHeaders = (headers: Record<string, string | string[] | undefined> = {}): Record<string, string> => {
  const normalized: Record<string, string> = {}

  for (const [name, value] of Object.entries(headers)) {
    const normalizedValue = normalizeHeaderValue(value)

    if (normalizedValue !== undefined) {
      normalized[name.toLowerCase()] = normalizedValue
    }
  }

  return normalized
}

const resolveRequestRateThreshold = (threshold: number | undefined): number =>
  threshold === undefined || Number.isFinite(threshold) === false || threshold < 0
    ? DEFAULT_REQUEST_RATE_THRESHOLD
    : threshold

const buildContext = (input: IServerInput, options?: IServerOptions): IServerContext => {
  const headers = normalizeHeaders(input.headers)
  const payloadState = resolvePayloadState(input.payload)

  return {
    headers,
    userAgent: headers['user-agent'] ?? '',
    requestRate: input.requestRate ?? null,
    payload: isClientPayload(input.payload) === true ? input.payload : null,
    payloadState,
    payloadPolicy: options?.payloadPolicy ?? 'optional',
    secret: options?.secret,
    consumeNonce: options?.consumeNonce,
    requestRateThreshold: resolveRequestRateThreshold(options?.requestRateThreshold),
  }
}

export const detect = async (input: IServerInput, options?: IServerOptions): Promise<IServerDetectResult> => {
  const context = buildContext(input, options)
  const scoringOptions = mergeScoringOptions(options)

  const shouldVerifyCrawler = options?.verifyCrawler ?? true

  const [serverOutcomes, crawler] = await Promise.all([
    runDetectors([...HTTP_DETECTORS, ...PAYLOAD_DETECTORS], context, mergeRunOptions(options)),
    shouldVerifyCrawler === true ? verifyCrawler(context.userAgent, input.ip ?? null) : Promise.resolve(null),
  ])

  const clientOutcomes: ISignalOutcome[] =
    context.payloadState === 'valid' && context.payload !== null
      ? clientReportToOutcomes(context.payload.report, scoringOptions.weights).map((outcome: ISignalOutcome) =>
          options?.disabled?.includes(outcome.key) === true ? { ...outcome, result: 'unavailable' } : outcome,
        )
      : clientReportToOutcomes({}, scoringOptions.weights)

  const challengeOutcome = await challengeInvalid.run(context)

  const scoreResult = scoreOutcomes(
    [...serverOutcomes, { ...challengeInvalid, result: challengeOutcome }, ...clientOutcomes],
    scoringOptions,
  )

  return { ...scoreResult, crawler }
}
