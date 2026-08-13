import { buildReport } from '@core/lib/scoring'
import { mergeRunOptions } from '@core/lib/mergeOptions'
import { SCHEMA_VERSION } from '@core/model/constants'
import { collectSignals } from '../lib/collectSignals'
import { collectClientHints } from '@client/lib/clientHints'
import type { IClientContext, IClientOptions, IClientPayload } from '@client/model/types'

export const collect = async (options?: IClientOptions): Promise<IClientPayload> => {
  const context: IClientContext = { win: window, nav: navigator, doc: document }
  const outcomes = await collectSignals(context, mergeRunOptions(options))

  return {
    schemaVersion: SCHEMA_VERSION,
    challenge: options?.challenge ?? null,
    report: buildReport(outcomes),
    raw: {
      userAgent: context.nav.userAgent,
      languages: [...context.nav.languages],
      platform: context.nav.platform ?? null,
      clientHints: collectClientHints(context.nav),
    },
  }
}
