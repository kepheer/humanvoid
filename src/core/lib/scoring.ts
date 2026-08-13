import type { IDetectResult, IScoringOptions, ISignalOutcome, TProbability, TSignalValue } from '../model/types'

const resolveWeight = (outcome: ISignalOutcome, weights: Record<string, number>): number =>
  weights[outcome.key] ?? outcome.weight

const selectSuspicious = (outcomes: ISignalOutcome[]): ISignalOutcome[] =>
  outcomes.filter((outcome: ISignalOutcome) => outcome.result === 'suspicious')

const groupWeights = (outcomes: ISignalOutcome[], weights: Record<string, number>): number[][] => {
  const groups = new Map<string, number[]>()

  for (const outcome of outcomes) {
    groups.set(outcome.group, [...(groups.get(outcome.group) ?? []), resolveWeight(outcome, weights)])
  }

  return [...groups.values()]
}

const groupContribution = (weights: number[], decay: number): number => {
  if (weights.length === 0) {
    return 0
  }

  const maxWeight = Math.max(...weights)

  return maxWeight + decay * (weights.reduce((sum: number, weight: number) => sum + weight, 0) - maxWeight)
}

const toSignalValue = (result: ISignalOutcome['result']): TSignalValue => {
  if (result === 'unavailable') {
    return null
  }

  return result === 'suspicious'
}

export const buildReport = (outcomes: ISignalOutcome[]): Record<string, TSignalValue> =>
  Object.fromEntries(outcomes.map((outcome: ISignalOutcome) => [outcome.key, toSignalValue(outcome.result)]))

export const calculateScore = (outcomes: ISignalOutcome[], options: IScoringOptions): number => {
  const rawScore = groupWeights(selectSuspicious(outcomes), options.weights).reduce(
    (total: number, weights: number[]) => total + groupContribution(weights, options.groupDecay),
    0,
  )

  const safeScore = Number.isFinite(rawScore) === true ? rawScore : 0

  return Math.max(0, Math.min(100, Math.round(safeScore)))
}

export const resolveProbability = (
  score: number,
  outcomes: ISignalOutcome[],
  options: IScoringOptions,
): TProbability => {
  const suspicious = selectSuspicious(outcomes)
  const hasEnoughEvidence =
    suspicious.length >= options.minSignalsForHigh &&
    new Set(suspicious.map((outcome: ISignalOutcome) => outcome.group)).size >= options.minGroupsForHigh

  if (score >= options.thresholds.high && hasEnoughEvidence === true) {
    return 'high'
  }

  if (score >= options.thresholds.medium) {
    return 'medium'
  }

  return 'low'
}

export const scoreOutcomes = (outcomes: ISignalOutcome[], options: IScoringOptions): IDetectResult => {
  const score = calculateScore(outcomes, options)

  return {
    probability: resolveProbability(score, outcomes, options),
    score,
    report: buildReport(outcomes),
  }
}
