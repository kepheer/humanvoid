import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

export interface IChallengeOptions {
  ttlMs?: number
}

export interface IChallengeVerdict {
  isValid: boolean
  reason: 'valid' | 'malformed' | 'expired' | 'signatureMismatch'
  nonce?: string
  exp?: number
}

interface IParsedToken {
  nonce: string
  exp: number
  signature: string
}

const DEFAULT_TTL_MS = 300000

const computeSignature = (nonce: string, exp: number, secret: string): string =>
  createHmac('sha256', secret).update(`${nonce}.${exp}`).digest('hex')

export const issueChallenge = (secret: string, options?: IChallengeOptions): string => {
  const nonce = randomBytes(16).toString('hex')
  const exp = Date.now() + (options?.ttlMs ?? DEFAULT_TTL_MS)
  const signature = computeSignature(nonce, exp, secret)

  return `${nonce}.${exp}.${signature}`
}

const parseToken = (token: string): IParsedToken | null => {
  const parts = token.split('.')

  if (parts.length !== 3) {
    return null
  }

  const [nonce, expRaw, signature] = parts

  if (nonce === undefined || expRaw === undefined || signature === undefined) {
    return null
  }

  if (nonce.length === 0 || signature.length === 0) {
    return null
  }

  const exp = Number(expRaw)

  if (Number.isFinite(exp) === false) {
    return null
  }

  return { nonce, exp, signature }
}

const isSignatureValid = (nonce: string, exp: number, signature: string, secret: string): boolean => {
  const expectedBuffer = Buffer.from(computeSignature(nonce, exp, secret), 'hex')
  const actualBuffer = Buffer.from(signature, 'hex')

  if (expectedBuffer.length !== actualBuffer.length) {
    return false
  }

  return timingSafeEqual(expectedBuffer, actualBuffer)
}

export const verifyChallenge = (token: string, secret: string): IChallengeVerdict => {
  const parsed = parseToken(token)

  if (parsed === null) {
    return { isValid: false, reason: 'malformed' }
  }

  const { nonce, exp, signature } = parsed

  if (isSignatureValid(nonce, exp, signature, secret) === false) {
    return { isValid: false, reason: 'signatureMismatch' }
  }

  if (Date.now() >= exp) {
    return { isValid: false, reason: 'expired' }
  }

  return { isValid: true, reason: 'valid', nonce, exp }
}
