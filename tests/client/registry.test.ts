import { describe, expect, it } from 'vitest'
import { FINGERPRINT_DETECTORS } from '@client/detectors/fingerprint'
import { GRAPHICS_DETECTORS } from '@client/detectors/graphics'
import { CLIENT_DETECTOR_GROUPS, DEFAULT_WEIGHTS } from '@core/model/constants'

const detectors = [...FINGERPRINT_DETECTORS, ...GRAPHICS_DETECTORS]

describe('client detector registry', () => {
  it('has unique keys', () => {
    expect(new Set(detectors.map((detector) => detector.key)).size).toBe(detectors.length)
  })

  it.each(detectors.map((detector) => [detector.key, detector.group, detector.weight]))(
    'keeps %s aligned with its public metadata',
    (key, group, weight) => {
      expect(CLIENT_DETECTOR_GROUPS[key]).toBe(group)
      expect(DEFAULT_WEIGHTS[key]).toBe(weight)
    },
  )
})
