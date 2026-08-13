import type { IProbabilityThresholds } from './types'

export const SCHEMA_VERSION = 1

export const PROBABILITY_THRESHOLDS: IProbabilityThresholds = {
  medium: 30,
  high: 70,
}

export const GROUP_DECAY = 0.5

export const MIN_SIGNALS_FOR_HIGH = 2

export const MIN_GROUPS_FOR_HIGH = 1

export const DETECTOR_TIMEOUT_MS = 250

export const DEFAULT_REQUEST_RATE_THRESHOLD = 10

export const SIGNAL_GROUPS = {
  FINGERPRINT: 'fingerprint',
  GRAPHICS: 'graphics',
  HTTP: 'http',
  CROSS_CHECK: 'crossCheck',
} as const

export const DEFAULT_WEIGHTS: Record<string, number> = {
  webdriverFlag: 45,
  cdpArtifacts: 50,
  softwareRenderer: 35,
  webglParamsAnomaly: 15,
  canvasFingerprint: 20,
  audioFingerprint: 15,

  secFetchMissing: 30,
  secChUaMismatch: 32,
  acceptEncodingAnomaly: 15,
  connectionAnomaly: 12,
  requestRateAnomaly: 25,

  payloadMissing: 25,
  payloadSchemaInvalid: 35,
  challengeInvalid: 40,
  languageMismatch: 25,
  uaCrossMismatch: 40,
  platformMismatch: 30,
  clientHintsMismatch: 25,
}

export const CLIENT_DETECTOR_GROUPS: Record<string, string> = {
  webdriverFlag: SIGNAL_GROUPS.FINGERPRINT,
  cdpArtifacts: SIGNAL_GROUPS.FINGERPRINT,
  softwareRenderer: SIGNAL_GROUPS.GRAPHICS,
  webglParamsAnomaly: SIGNAL_GROUPS.GRAPHICS,
  canvasFingerprint: SIGNAL_GROUPS.GRAPHICS,
  audioFingerprint: SIGNAL_GROUPS.GRAPHICS,
}
