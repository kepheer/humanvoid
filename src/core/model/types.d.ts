export type TProbability = 'low' | 'medium' | 'high'

export type TSignalResult = 'suspicious' | 'clean' | 'unavailable'

export type TSignalValue = boolean | null

export interface IDetectResult {
  probability: TProbability
  score: number
  report: Record<string, TSignalValue>
}

export interface IDetector<TContext> {
  key: string
  group: string
  weight: number
  run: (context: TContext) => TSignalResult | Promise<TSignalResult>
}

export interface ISignalOutcome {
  key: string
  group: string
  weight: number
  result: TSignalResult
}

export interface IProbabilityThresholds {
  medium: number
  high: number
}

export interface IScoringOptions {
  weights: Record<string, number>
  thresholds: IProbabilityThresholds
  groupDecay: number
  minSignalsForHigh: number
  minGroupsForHigh: number
}

export interface IRunOptions {
  timeoutMs: number
  disabled: string[]
}

export interface IDetectOptions {
  weights?: Record<string, number>
  thresholds?: Partial<IProbabilityThresholds>
  groupDecay?: number
  minSignalsForHigh?: number
  minGroupsForHigh?: number
  timeoutMs?: number
  disabled?: string[]
}
