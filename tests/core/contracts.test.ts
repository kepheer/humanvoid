import { describe, expect, it } from 'vitest'
import { clientReportToOutcomes } from '@core/lib/clientReport'
import { mergeScoringOptions } from '@core/lib/mergeOptions'
import { buildReport, calculateScore, resolveProbability } from '@core/lib/scoring'
import { DEFAULT_WEIGHTS } from '@core/model/constants'
import type { ISignalOutcome, TSignalResult } from '@core/model/types'

const outcome = (key: string, group: string, weight: number, result: TSignalResult): ISignalOutcome => ({
  key,
  group,
  weight,
  result,
})

describe('report contract', () => {
  it('serializes suspicious, clean and unavailable distinctly', () => {
    expect(
      buildReport([
        outcome('a', 'g', 1, 'suspicious'),
        outcome('b', 'g', 1, 'clean'),
        outcome('c', 'g', 1, 'unavailable'),
      ]),
    ).toEqual({ a: true, b: false, c: null })
  })

  it.each([
    [{ webdriverFlag: true }, 'webdriverFlag', 'suspicious'],
    [{ webdriverFlag: false }, 'webdriverFlag', 'clean'],
    [{ webdriverFlag: null }, 'webdriverFlag', 'unavailable'],
    [{}, 'webdriverFlag', 'unavailable'],
    [null, 'webdriverFlag', 'unavailable'],
  ])('maps report %j to %s', (report, key, result) => {
    expect(clientReportToOutcomes(report, DEFAULT_WEIGHTS).find((entry) => entry.key === key)?.result).toBe(result)
  })
})

describe('scoring invariants', () => {
  it.each([
    [[outcome('a', 'g', 40, 'clean')], 0],
    [[outcome('a', 'g', 40, 'unavailable')], 0],
    [[outcome('a', 'g', 40, 'suspicious')], 40],
    [[outcome('a', 'g', 40, 'suspicious'), outcome('b', 'g', 20, 'suspicious')], 50],
    [[outcome('a', 'x', 60, 'suspicious'), outcome('b', 'y', 50, 'suspicious')], 100],
  ])('calculates score %#', (outcomes, expected) => {
    expect(calculateScore(outcomes, mergeScoringOptions())).toBe(expected)
  })

  it.each([
    [29, [outcome('a', 'g', 29, 'suspicious')], 'low'],
    [30, [outcome('a', 'g', 30, 'suspicious')], 'medium'],
    [100, [outcome('a', 'g', 100, 'suspicious')], 'medium'],
    [70, [outcome('a', 'g', 40, 'suspicious'), outcome('b', 'g', 30, 'suspicious')], 'high'],
  ])('resolves probability %#', (score, outcomes, expected) => {
    expect(resolveProbability(score, outcomes, mergeScoringOptions())).toBe(expected)
  })
})
