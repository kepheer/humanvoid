const PLATFORM_FAMILY_PREFIXES: Record<string, string> = {
  macOS: 'Mac',
  Windows: 'Win',
  Linux: 'Linux',
  'Chrome OS': 'Linux',
  Android: 'Linux',
}

export const isPlatformFamilyMismatch = (friendlyPlatform: string, legacyPlatform: string): boolean => {
  const expectedPrefix = PLATFORM_FAMILY_PREFIXES[friendlyPlatform]

  if (expectedPrefix === undefined) {
    return false
  }

  return legacyPlatform.startsWith(expectedPrefix) === false
}
