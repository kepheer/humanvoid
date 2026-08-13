import { mergeRunOptions, mergeScoringOptions } from '@core/lib/mergeOptions'
import { scoreOutcomes } from '@core/lib/scoring'
import { collectSignals } from '../lib/collectSignals'
import type { IClientContext, IClientDetectResult, IClientOptions } from '@client/model/types'

export const detect = async (options?: IClientOptions): Promise<IClientDetectResult> => {
  const context: IClientContext = { win: window, nav: navigator, doc: document }
  const outcomes = await collectSignals(context, mergeRunOptions(options))

  return scoreOutcomes(outcomes, mergeScoringOptions(options))
}
