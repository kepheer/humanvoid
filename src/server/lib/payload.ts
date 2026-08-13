import { SCHEMA_VERSION } from '@core/model/constants'
import type { TSignalValue } from '@core/model/types'
import type { IClientHintsLike, IClientPayloadLike, IClientRawSignalsLike, TPayloadState } from '@server/model/types'

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && Array.isArray(value) === false

const isSignalReport = (value: unknown): value is Record<string, TSignalValue> =>
  isPlainObject(value) === true &&
  Object.values(value).every((entry: unknown) => typeof entry === 'boolean' || entry === null)

const isRawSignals = (value: unknown): value is IClientRawSignalsLike => {
  if (
    isPlainObject(value) === false ||
    typeof value.userAgent !== 'string' ||
    Array.isArray(value.languages) === false
  ) {
    return false
  }

  if (
    value.languages.every((entry: unknown) => typeof entry === 'string') === false ||
    (value.platform !== null && typeof value.platform !== 'string')
  ) {
    return false
  }

  if (value.clientHints === null) {
    return true
  }

  return isClientHints(value.clientHints)
}

const isClientHints = (value: unknown): value is IClientHintsLike =>
  isPlainObject(value) === true &&
  typeof value.mobile === 'boolean' &&
  typeof value.platform === 'string' &&
  Array.isArray(value.brands) === true &&
  value.brands.every(
    (brand: unknown) =>
      isPlainObject(brand) === true && typeof brand.brand === 'string' && typeof brand.version === 'string',
  )

export const isClientPayload = (value: unknown): value is IClientPayloadLike => {
  if (isPlainObject(value) === false) {
    return false
  }

  return (
    value.schemaVersion === SCHEMA_VERSION &&
    (value.challenge === null || typeof value.challenge === 'string') &&
    isSignalReport(value.report) === true &&
    isRawSignals(value.raw) === true
  )
}

export const resolvePayloadState = (value: unknown): TPayloadState => {
  if (value === null || value === undefined) {
    return 'missing'
  }

  return isClientPayload(value) === true ? 'valid' : 'invalid'
}
