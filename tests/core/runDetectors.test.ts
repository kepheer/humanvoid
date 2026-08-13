import { describe, expect, it } from 'vitest'
import { runDetectors } from '@core/lib/runDetectors'
import type { IDetector, TSignalResult } from '@core/model/types'

const detector = (key: string, run: () => TSignalResult | Promise<TSignalResult>): IDetector<undefined> => ({
  key,
  group: 'test',
  weight: 1,
  run,
})

describe('detector runner', () => {
  it.each([
    [detector('clean', () => 'clean'), 'clean'],
    [detector('suspicious', () => 'suspicious'), 'suspicious'],
    [
      detector('throws', () => {
        throw new Error('no')
      }),
      'unavailable',
    ],
    [detector('rejects', async () => Promise.reject(new Error('no'))), 'unavailable'],
  ])('normalizes detector result %#', async (item, expected) => {
    const [result] = await runDetectors([item], undefined, { disabled: [], timeoutMs: 50 })
    expect(result?.result).toBe(expected)
  })

  it('returns unavailable for a disabled detector without running it', async () => {
    let calls = 0
    const [result] = await runDetectors(
      [
        detector('off', () => {
          calls += 1
          return 'suspicious'
        }),
      ],
      undefined,
      {
        disabled: ['off'],
        timeoutMs: 50,
      },
    )
    expect(result?.result).toBe('unavailable')
    expect(calls).toBe(0)
  })
})
