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
  webdriverFlag: 50,
  cdpArtifacts: 55,
  softwareRenderer: 18,
  webglParamsAnomaly: 12,
  canvasFingerprint: 8,
  audioFingerprint: 8,

  secFetchMissing: 25,
  secChUaMismatch: 30,
  acceptEncodingAnomaly: 8,
  connectionAnomaly: 5,
  requestRateAnomaly: 25,

  payloadMissing: 30,
  payloadSchemaInvalid: 30,
  challengeInvalid: 50,
  languageMismatch: 8,
  uaCrossMismatch: 40,
  platformMismatch: 20,
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
