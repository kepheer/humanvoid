import {
  DEFAULT_WEIGHTS,
  DETECTOR_TIMEOUT_MS,
  GROUP_DECAY,
  MIN_GROUPS_FOR_HIGH,
  MIN_SIGNALS_FOR_HIGH,
  PROBABILITY_THRESHOLDS,
} from '../model/constants'
import type { IDetectOptions, IRunOptions, IScoringOptions } from '../model/types'

const isValidWeight = (value: number): boolean => Number.isFinite(value) === true && value >= 0

const sanitizeWeights = (
  defaults: Record<string, number>,
  overrides: Record<string, number> | undefined,
): Record<string, number> => {
  if (overrides === undefined) {
    return { ...defaults }
  }

  const sanitizedOverrides = Object.fromEntries(
    Object.entries(overrides).filter(([, value]: [string, number]) => isValidWeight(value) === true),
  )

  return { ...defaults, ...sanitizedOverrides }
}

const sanitizeGroupDecay = (value: number | undefined): number =>
  value === undefined || Number.isFinite(value) === false ? GROUP_DECAY : Math.max(0, Math.min(1, value))

const sanitizePositiveInt = (value: number | undefined, fallback: number): number =>
  value === undefined || Number.isFinite(value) === false || value < 0 ? fallback : Math.round(value)

export const mergeScoringOptions = (options?: IDetectOptions): IScoringOptions => ({
  weights: sanitizeWeights(DEFAULT_WEIGHTS, options?.weights),
  thresholds: { ...PROBABILITY_THRESHOLDS, ...options?.thresholds },
  groupDecay: sanitizeGroupDecay(options?.groupDecay),
  minSignalsForHigh: sanitizePositiveInt(options?.minSignalsForHigh, MIN_SIGNALS_FOR_HIGH),
  minGroupsForHigh: sanitizePositiveInt(options?.minGroupsForHigh, MIN_GROUPS_FOR_HIGH),
})

export const mergeRunOptions = (options?: IDetectOptions): IRunOptions => ({
  timeoutMs: options?.timeoutMs ?? DETECTOR_TIMEOUT_MS,
  disabled: options?.disabled ?? [],
})
