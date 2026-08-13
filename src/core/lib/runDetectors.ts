import type { IDetector, IRunOptions, ISignalOutcome, TSignalResult } from '../model/types'

const runWithTimeout = async <TContext>(
  detector: IDetector<TContext>,
  context: TContext,
  timeoutMs: number,
): Promise<TSignalResult> => {
  let timer: ReturnType<typeof setTimeout> | null = null

  try {
    return await Promise.race([
      Promise.resolve(detector.run(context)),
      new Promise<TSignalResult>((resolve: (value: TSignalResult) => void) => {
        timer = setTimeout(() => resolve('unavailable'), timeoutMs)
      }),
    ])
  } catch {
    return 'unavailable'
  } finally {
    if (timer !== null) {
      clearTimeout(timer)
    }
  }
}

const toOutcome = <TContext>(detector: IDetector<TContext>, result: TSignalResult): ISignalOutcome => ({
  key: detector.key,
  group: detector.group,
  weight: detector.weight,
  result,
})

export const runDetectors = async <TContext>(
  detectors: IDetector<TContext>[],
  context: TContext,
  options: IRunOptions,
): Promise<ISignalOutcome[]> =>
  Promise.all(
    detectors.map(async (detector: IDetector<TContext>) =>
      toOutcome(
        detector,
        options.disabled.includes(detector.key) === true
          ? 'unavailable'
          : await runWithTimeout(detector, context, options.timeoutMs),
      ),
    ),
  )
