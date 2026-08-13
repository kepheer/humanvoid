export {
  DEFAULT_WEIGHTS,
  DETECTOR_TIMEOUT_MS,
  GROUP_DECAY,
  MIN_GROUPS_FOR_HIGH,
  MIN_SIGNALS_FOR_HIGH,
  PROBABILITY_THRESHOLDS,
  SCHEMA_VERSION,
  SIGNAL_GROUPS,
} from './core/model/constants'

export type {
  IDetectOptions,
  IDetectResult,
  IDetector,
  IProbabilityThresholds,
  IRunOptions,
  IScoringOptions,
  ISignalOutcome,
  TProbability,
  TSignalResult,
} from './core/model/types'

export type { IChallengeVerdict, ICrawlerVerdict, IServerDetectResult } from './server/model/types'
