import type { IDetectOptions, TProbability, TSignalValue } from '@core/model/types'

export interface IClientContext {
  win: Window & typeof globalThis
  nav: Navigator
  doc: Document
}

export interface IClientOptions extends IDetectOptions {
  challenge?: string
}

export interface IClientRawSignals {
  userAgent: string
  languages: readonly string[]
  platform: string | null
  clientHints: IClientHints | null
}

export interface IClientHintBrand {
  brand: string
  version: string
}

export interface IClientHints {
  brands: readonly IClientHintBrand[]
  mobile: boolean
  platform: string
}

export interface IClientPayload {
  schemaVersion: number
  challenge: string | null
  report: Record<string, TSignalValue>
  raw: IClientRawSignals
}

export interface IClientDetectResult {
  probability: TProbability
  score: number
  report: Record<string, TSignalValue>
}
