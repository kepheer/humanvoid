import type { IDetector } from '@core/model/types'
import type { IClientContext } from '@client/model/types'
import { cdpArtifacts } from './cdpArtifacts'
import { webdriverFlag } from './webdriverFlag'

export const FINGERPRINT_DETECTORS: IDetector<IClientContext>[] = [webdriverFlag, cdpArtifacts]

export { webdriverFlag, cdpArtifacts }
