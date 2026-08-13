import type { IDetector } from '@core/model/types'
import type { IServerContext } from '@server/model/types'
import { languageMismatch } from './languageMismatch'
import { clientHintsMismatch } from './clientHintsMismatch'
import { payloadMissing } from './payloadMissing'
import { payloadSchemaInvalid } from './payloadSchemaInvalid'
import { platformMismatch } from './platformMismatch'
import { uaCrossMismatch } from './uaCrossMismatch'

export {
  languageMismatch,
  clientHintsMismatch,
  payloadMissing,
  payloadSchemaInvalid,
  platformMismatch,
  uaCrossMismatch,
}

export const PAYLOAD_DETECTORS: IDetector<IServerContext>[] = [
  payloadMissing,
  payloadSchemaInvalid,
  languageMismatch,
  clientHintsMismatch,
  uaCrossMismatch,
  platformMismatch,
]
