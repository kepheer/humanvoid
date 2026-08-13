import { CLIENT_DETECTOR_GROUPS } from '../model/constants'
import type { ISignalOutcome, TSignalValue } from '../model/types'

const isValidReport = (report: unknown): report is Record<string, TSignalValue> =>
  typeof report === 'object' && report !== null

export const clientReportToOutcomes = (report: unknown, weights: Record<string, number>): ISignalOutcome[] => {
  const safeReport = isValidReport(report) === true ? report : {}

  return Object.entries(CLIENT_DETECTOR_GROUPS).map(([key, group]: [string, string]) => ({
    key,
    group,
    weight: weights[key] ?? 0,
    result: safeReport[key] === true ? 'suspicious' : safeReport[key] === false ? 'clean' : 'unavailable',
  }))
}
