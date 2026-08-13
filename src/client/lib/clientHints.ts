import type { IClientHints } from '@client/model/types'

interface INavigatorUaData {
  brands: readonly { brand: string; version: string }[]
  mobile: boolean
  platform: string
}

interface INavigatorWithUaData {
  userAgentData?: INavigatorUaData
}

export const collectClientHints = (nav: Navigator): IClientHints | null => {
  try {
    const userAgentData = (nav as unknown as INavigatorWithUaData).userAgentData

    if (userAgentData === undefined) {
      return null
    }

    return {
      brands: userAgentData.brands.map(({ brand, version }) => ({ brand, version })),
      mobile: userAgentData.mobile,
      platform: userAgentData.platform,
    }
  } catch {
    return null
  }
}
