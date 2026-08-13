export const safeProbe = <TValue>(probe: () => TValue, fallback: TValue): TValue => {
  try {
    return probe()
  } catch {
    return fallback
  }
}
