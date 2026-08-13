import type { IDetectOptions, TProbability, TSignalValue } from '@core/model/types'
import type { IChallengeOptions, IChallengeVerdict } from '@server/lib/challenge'

export interface IClientRawSignalsLike {
  userAgent: string
  languages: readonly string[]
  platform: string | null
  clientHints: IClientHintsLike | null
}

export interface IClientHintsLike {
  brands: readonly { brand: string; version: string }[]
  mobile: boolean
  platform: string
}

export interface IClientPayloadLike {
  schemaVersion: number
  challenge: string | null
  report: Record<string, TSignalValue>
  raw: IClientRawSignalsLike
}

export interface IServerContext {
  headers: Record<string, string>
  userAgent: string
  requestRate: number | null
  payload: IClientPayloadLike | null
  payloadState: TPayloadState
  payloadPolicy: TPayloadPolicy
  secret?: string
  consumeNonce?: (nonce: string, exp: number) => boolean | Promise<boolean>
  requestRateThreshold: number
}

export type TPayloadState = 'missing' | 'invalid' | 'valid'

export type TPayloadPolicy = 'optional' | 'required'

export interface IServerInput {
  payload?: unknown
  headers?: Record<string, string | string[] | undefined>
  ip?: string | null
  requestRate?: number | null
}

export interface IServerOptions extends IDetectOptions {
  secret?: string
  consumeNonce?: (nonce: string, exp: number) => boolean | Promise<boolean>
  payloadPolicy?: TPayloadPolicy
  verifyCrawler?: boolean
  requestRateThreshold?: number
}

export interface ICrawlerVerdict {
  name: string
  status: 'verified' | 'unverified' | 'unavailable'
}

export interface IServerDetectResult {
  probability: TProbability
  score: number
  report: Record<string, TSignalValue>
  crawler: ICrawlerVerdict | null
}

export type { IChallengeOptions, IChallengeVerdict }
