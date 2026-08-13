const EXPECTATION_CHECKS = {
  low: (probability) => probability === 'low',
  high: (probability) => probability === 'high',
  'medium-or-high': (probability) => probability === 'medium' || probability === 'high',
}

export const evaluateGate = (profile, result) => {
  const check = EXPECTATION_CHECKS[profile.expected]

  if (check === undefined) {
    return { pass: false, reason: `unknown expected value "${profile.expected}"` }
  }

  const pass = check(result.probability)

  return {
    pass,
    reason: pass ? 'ok' : `expected ${profile.expected}, got ${result.probability}`,
  }
}
