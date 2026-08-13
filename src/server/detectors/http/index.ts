import type { IDetector } from '@core/model/types'
import type { IServerContext } from '@server/model/types'
import { acceptEncodingAnomaly } from './acceptEncodingAnomaly'
import { connectionAnomaly } from './connectionAnomaly'
import { requestRateAnomaly } from './requestRateAnomaly'
import { secChUaMismatch } from './secChUaMismatch'
import { secFetchMissing } from './secFetchMissing'

export { acceptEncodingAnomaly, connectionAnomaly, requestRateAnomaly, secChUaMismatch, secFetchMissing }

export const HTTP_DETECTORS: IDetector<IServerContext>[] = [
  secFetchMissing,
  secChUaMismatch,
  acceptEncodingAnomaly,
  connectionAnomaly,
  requestRateAnomaly,
]
